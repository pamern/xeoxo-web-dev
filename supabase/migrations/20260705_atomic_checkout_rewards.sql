-- XEOXO: seed loyalty data on ORIGINAL tables and atomic checkout RPC.
-- No new business tables are introduced.

-- Remove objects from the superseded migration that were not in database_schema.md.
drop function if exists sales.checkout_order(bigint,bigint,bigint,integer,bigint[],text,text);
drop table if exists sales.voucher_usage;
drop table if exists sales.voucher;
alter table if exists iam.loyalty_reward drop column if exists period_key;

-- Restore original documented constraints.
update iam.loyalty_tier set free_shipping_quota = 32767
where loyalty_tier_id = 'MVG' and free_shipping_quota is null;
alter table iam.loyalty_tier alter column free_shipping_quota set not null;
update sales.payment set paid_at = coalesce(paid_at, created_at, now()) where paid_at is null;
alter table sales.payment alter column paid_at set not null;

insert into iam.loyalty_tier (
  loyalty_tier_id, tier_name, min_accumulated_amount, maintain_amount,
  birthday_voucher_value, free_shipping_quota, free_tailor_quota,
  special_gift, created_at, updated_at
) values
  ('SILVER','Silver',20000000,6000000,200000,0,0,null,now(),now()),
  ('GOLD','Gold',50000000,10000000,500000,10,0,null,now(),now()),
  ('DIAMOND','Diamond',100000000,20000000,1000000,20,5,null,now(),now()),
  ('MVG','MVG',200000000,40000000,3000000,32767,10,'Qua tang dip dac biet',now(),now())
on conflict (loyalty_tier_id) do update set
  tier_name=excluded.tier_name,
  min_accumulated_amount=excluded.min_accumulated_amount,
  maintain_amount=excluded.maintain_amount,
  birthday_voucher_value=excluded.birthday_voucher_value,
  free_shipping_quota=excluded.free_shipping_quota,
  free_tailor_quota=excluded.free_tailor_quota,
  special_gift=excluded.special_gift,
  updated_at=now();

-- The real account is gmail.com (not gmai.com), customer_id currently 14.
update iam.customer
set tier_id='GOLD',
    total_spent=greatest(total_spent,50000000),
    spent_in_year=greatest(spent_in_year,10000000),
    last_tier_updated_at=now(),
    updated_at=now()
where lower(email)='nhoangthientruc123@gmail.com'
  and customer_type='MEMBER';

-- Fixed-value vouchers supported by the original LOYALTY_REWARD schema.
insert into iam.loyalty_reward (
  customer_id, loyalty_tier_id, reward_type, reward_name, voucher_code,
  reward_value, issued_at, expired_at, status, created_at, updated_at
)
select customer_id,'GOLD','BIRTHDAY_VOUCHER','Voucher sinh nhat Gold 2026',
       'GOLD-BDAY-2026-'||customer_id,500000,now(),
       timestamptz '2026-12-31 23:59:59+07','AVAILABLE',now(),now()
from iam.customer where lower(email)='nhoangthientruc123@gmail.com'
on conflict (voucher_code) do nothing;

insert into iam.loyalty_reward (
  customer_id, loyalty_tier_id, reward_type, reward_name, voucher_code,
  reward_value, issued_at, expired_at, status, created_at, updated_at
)
select customer_id,'GOLD','TIER_VOUCHER','Voucher uu dai hang Gold',
       'GOLD500-'||customer_id,500000,now(),
       timestamptz '2026-12-31 23:59:59+07','AVAILABLE',now(),now()
from iam.customer where lower(email)='nhoangthientruc123@gmail.com'
on conflict (voucher_code) do nothing;

insert into iam.loyalty_reward (
  customer_id, loyalty_tier_id, reward_type, reward_name, voucher_code,
  reward_value, issued_at, expired_at, status, created_at, updated_at
)
select c.customer_id,'GOLD','FREE_SHIPPING','Mien phi van chuyen Gold lan '||n,
       'GOLD-SHIP-2026-'||c.customer_id||'-'||n,30000,now(),
       timestamptz '2026-12-31 23:59:59+07','AVAILABLE',now(),now()
from iam.customer c cross join generate_series(1,10) n
where lower(c.email)='nhoangthientruc123@gmail.com'
on conflict (voucher_code) do nothing;

create or replace function sales.checkout_order(
  p_cart_id bigint,
  p_customer_id bigint,
  p_address_id bigint,
  p_payment_method_id integer,
  p_cart_item_ids bigint[],
  p_customer_note text default null,
  p_voucher_code text default null
) returns jsonb
language plpgsql
security definer
set search_path=public,sales,catalog,inventory,iam
as $$
declare
  v_order_id bigint;
  v_order_code text := 'XX'||floor(extract(epoch from clock_timestamp())*1000)::bigint;
  v_subtotal numeric(14,2):=0;
  v_shipping_fee numeric(14,2):=30000;
  v_discount numeric(14,2):=0;
  v_total numeric(14,2);
  v_shipping_id bigint;
  v_payment_id bigint;
  v_reward iam.loyalty_reward%rowtype;
  v_item record;
  v_inventory record;
  v_remaining integer;
  v_selected_count integer;
  v_purchasable_count integer;
  v_payment_code text;
begin
  perform 1 from sales.cart
  where cart_id=p_cart_id and cart_status='ACTIVE' for update;
  if not found then raise exception 'Gio hang khong ton tai hoac da checkout'; end if;

  if p_cart_item_ids is null or cardinality(p_cart_item_ids)=0 then
    raise exception 'Chua chon san pham';
  end if;
  select count(*) into v_selected_count from sales.cart_item
  where cart_id=p_cart_id and cart_item_id=any(p_cart_item_ids);
  if v_selected_count<>cardinality(p_cart_item_ids) then raise exception 'Cart item khong hop le'; end if;

  select count(*) into v_purchasable_count
  from sales.cart_item ci
  join catalog.product_variant pv on pv.variant_id=ci.variant_id
  join catalog.product_component pc on pc.component_id=pv.component_id
  join catalog.product_line pl on pl.product_line_id=pc.product_line_id
  where ci.cart_id=p_cart_id and ci.cart_item_id=any(p_cart_item_ids)
    and pv.status='ACTIVE' and pl.status='ACTIVE';
  if v_purchasable_count<>v_selected_count then
    raise exception 'Mot so san pham khong con kha dung';
  end if;

  select method_code into v_payment_code from sales.payment_method
  where method_id=p_payment_method_id and is_active=true;
  if v_payment_code is null then raise exception 'Phuong thuc thanh toan khong hop le'; end if;

  for v_item in
    select ci.cart_item_id,ci.variant_id,ci.quantity,pv.price
    from sales.cart_item ci
    join catalog.product_variant pv on pv.variant_id=ci.variant_id
    join catalog.product_component pc on pc.component_id=pv.component_id
    join catalog.product_line pl on pl.product_line_id=pc.product_line_id
    where ci.cart_id=p_cart_id and ci.cart_item_id=any(p_cart_item_ids)
      and pv.status='ACTIVE' and pl.status='ACTIVE'
    for update of ci,pv
  loop
    v_subtotal:=v_subtotal+(v_item.price*v_item.quantity);
    if (select coalesce(sum(quantity),0) from inventory.inventory where variant_id=v_item.variant_id)<v_item.quantity then
      raise exception 'Variant % khong du ton kho',v_item.variant_id;
    end if;
  end loop;

  if p_voucher_code is not null and btrim(p_voucher_code)<>'' then
    select * into v_reward from iam.loyalty_reward
    where upper(voucher_code)=upper(btrim(p_voucher_code))
      and customer_id=p_customer_id and status='AVAILABLE'
      and (expired_at is null or expired_at>now())
    for update;
    if not found then raise exception 'Ma quyen loi khong hop le, khong thuoc tai khoan hoac da het han'; end if;
    if v_reward.reward_type='FREE_SHIPPING' then
      v_shipping_fee:=0;
    elsif v_reward.reward_type in ('BIRTHDAY_VOUCHER','TIER_VOUCHER') then
      v_discount:=least(coalesce(v_reward.reward_value,0),v_subtotal);
    else
      raise exception 'Quyen loi nay khong ap dung cho don hang standard';
    end if;
  end if;

  v_total:=greatest(v_subtotal+v_shipping_fee-v_discount,0);
  insert into sales.sales_order(order_code,customer_id,order_date,reward_dicount_amount,shipping_fee,total_amount,order_status,payment_status,customer_note,created_at,updated_at)
  values(v_order_code,p_customer_id,now(),v_discount,v_shipping_fee,v_total,'PENDING','PENDING',p_customer_note,now(),now()) returning order_id into v_order_id;

  for v_item in
    select ci.variant_id,ci.quantity,pv.price from sales.cart_item ci
    join catalog.product_variant pv on pv.variant_id=ci.variant_id
    where ci.cart_id=p_cart_id and ci.cart_item_id=any(p_cart_item_ids)
  loop
    insert into sales.order_item(order_id,variant_id,customization_id,item_type,quantity,unit_price,discount_amount,line_total,created_at)
    values(v_order_id,v_item.variant_id,null,'STANDARD',v_item.quantity,v_item.price,0,v_item.price*v_item.quantity,now());
    v_remaining:=v_item.quantity;
    for v_inventory in
      select inventory_id,quantity from inventory.inventory
      where variant_id=v_item.variant_id and quantity>0
      order by quantity desc for update
    loop
      exit when v_remaining=0;
      update inventory.inventory
      set quantity=quantity-least(v_inventory.quantity,v_remaining),updated_at=now()
      where inventory_id=v_inventory.inventory_id;
      v_remaining:=v_remaining-least(v_inventory.quantity,v_remaining);
    end loop;
    if v_remaining>0 then raise exception 'Ton kho thay doi, vui long thu lai'; end if;
  end loop;

  insert into sales.shipping(order_id,address_id,shipping_provider,tracking_code,shipping_status,shipped_at,delivered_at,created_at,updated_at)
  values(v_order_id,p_address_id,'PENDING',null,'PENDING',null,null,now(),now()) returning shipping_id into v_shipping_id;
  -- paid_at is NOT NULL in the original schema, so created time is stored for PENDING rows.
  insert into sales.payment(order_id,method_id,amount,payment_status,transaction_code,paid_at,created_at,updated_at)
  values(v_order_id,p_payment_method_id,v_total,'PENDING',v_payment_code||'-'||v_order_code,now(),now(),now()) returning payment_id into v_payment_id;

  if v_reward.reward_id is not null then
    update iam.loyalty_reward set status='USED',updated_at=now() where reward_id=v_reward.reward_id;
    insert into iam.reward_usage(reward_id,order_id,used_amount,used_at)
    values(v_reward.reward_id,v_order_id,v_discount+case when v_reward.reward_type='FREE_SHIPPING' then 30000 else 0 end,now());
  end if;

  delete from sales.cart_item where cart_id=p_cart_id and cart_item_id=any(p_cart_item_ids);
  if not exists(select 1 from sales.cart_item where cart_id=p_cart_id) then
    update sales.cart set cart_status='CHECKOUT',updated_at=now() where cart_id=p_cart_id;
  end if;
  return jsonb_build_object('order_id',v_order_id,'order_code',v_order_code,'order_status','PENDING','payment_status','PENDING','total_amount',v_total,'shipping_id',v_shipping_id,'payment_id',v_payment_id);
end;
$$;

revoke all on function sales.checkout_order(bigint,bigint,bigint,integer,bigint[],text,text) from public,anon,authenticated;
grant execute on function sales.checkout_order(bigint,bigint,bigint,integer,bigint[],text,text) to service_role;
notify pgrst,'reload schema';
