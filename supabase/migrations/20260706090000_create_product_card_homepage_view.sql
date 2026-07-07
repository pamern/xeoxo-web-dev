create or replace view catalog.product_card_homepage
with (security_invoker = true)
as
select
  pl.product_line_id,
  pl.line_name,
  pl.slug as product_line_slug,
  pl.created_at,
  cat.category_id,
  cat.category_name,
  cat.slug as category_slug,
  price_range.min_price as price,
  main_image.storage_key as main_storage_key,
  main_image.alt_text as main_image_alt,
  hover_image.storage_key as hover_storage_key,
  hover_image.alt_text as hover_image_alt
from catalog.product_line pl
join catalog.line_category lc
  on lc.product_line_id = pl.product_line_id
join catalog.category cat
  on cat.category_id = lc.category_id
left join lateral (
  select
    min(pv.price) as min_price
  from catalog.product_component pc
  join catalog.product_variant pv
    on pv.component_id = pc.component_id
  where pc.product_line_id = pl.product_line_id
    and pv.status in ('ACTIVE', 'OUT_OF_STOCK', 'PREORDER', 'COMING_SOON')
) price_range on true
left join lateral (
  select
    media.storage_key,
    media.alt_text
  from catalog.product_line_media plm
  join catalog.media media
    on media.media_id = plm.media_id
  where plm.product_line_id = pl.product_line_id
    and plm.media_role = 'MAIN'
  order by plm.display_order asc, media.media_id asc
  limit 1
) main_image on true
left join lateral (
  select
    media.storage_key,
    media.alt_text
  from catalog.product_line_media plm
  join catalog.media media
    on media.media_id = plm.media_id
  where plm.product_line_id = pl.product_line_id
    and plm.media_role = 'GALLERY'
    and plm.display_order = 1
  order by media.media_id asc
  limit 1
) hover_image on true
where pl.status = 'ACTIVE'
  and cat.is_active = true;

grant select on catalog.product_card_homepage to anon, authenticated;
