import { createAdminClient } from "@/lib/supabase/admin";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import type { CartDto, CartItemDto } from "@/types/cart.types";
import type {
  CheckoutPreviewDto,
  CreateOrderValues,
  ShippingAddressValues,
} from "@/types/order.types";
import {
  buildCartDto,
  findActiveCart,
  getCartOwner,
  getCurrentCustomerId,
  isVariantPurchasableStatus,
} from "@/features/cart/cart-server.service";
import { assertCustomizationCheckoutReady } from "@/features/customization/customization-server.service";

type AddressRecord = {
  address_id: number;
  customer_id: number;
};

type PaymentMethodRecord = {
  method_id: number;
  method_code: string;
  method_name: string;
  is_active: boolean;
};

type RewardRecord = {
  reward_id: number;
  reward_type: string;
  reward_value: number | string | null;
};

type VariantCheckoutRecord = {
  variant_id: number;
  price: number;
  status: string;
};

type VariantStockRecord = {
  variant_id: number;
  total_quantity: number | null;
};

type CreatedOrderRecord = {
  order_id: number;
  order_code: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
};

type CheckoutBenefit = {
  discountAmount: number;
  rewardDiscountAmount: number;
  freeShipping: boolean;
};

export type PreparedCheckout = CheckoutPreviewDto & {
  cart: CartDto;
  selected_ids: number[];
};

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function normalizeIds(ids: unknown) {
  if (!Array.isArray(ids)) {
    return [];
  }

  return Array.from(
    new Set(
      ids
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  );
}

function buildPreview(
  items: CartItemDto[],
  cart: CartDto,
  selectedIds: number[],
  discountAmount = 0,
  rewardDiscountAmount = 0,
  shippingFee = 30000,
) {
  const subtotal = items.reduce((sum, item) => sum + toNumber(item.line_total), 0);

  return {
    cart,
    selected_ids: selectedIds,
    items,
    subtotal,
    shipping_fee: shippingFee,
    discount_amount: discountAmount,
    reward_discount_amount: rewardDiscountAmount,
    total_amount: Math.max(
      subtotal + shippingFee - discountAmount - rewardDiscountAmount,
      0,
    ),
  } satisfies PreparedCheckout;
}

async function getVariantCheckoutSnapshot(variantIds: number[]) {
  const normalizedVariantIds = Array.from(
    new Set(
      variantIds.filter((id) => Number.isInteger(id) && id > 0),
    ),
  );

  if (!normalizedVariantIds.length) {
    return new Map<
      number,
      { price: number; status: string | null; stockQuantity: number }
    >();
  }

  const admin = createAdminClient();
  const [{ data: variants, error: variantError }, { data: stocks, error: stockError }] =
    await Promise.all([
      admin
        .schema("catalog")
        .from("product_variant")
        .select("variant_id, price, status")
        .in("variant_id", normalizedVariantIds),
      admin
        .schema("catalog")
        .from("v_inventory_availability")
        .select("variant_id, total_quantity")
        .in("variant_id", normalizedVariantIds),
    ]);

  if (variantError) {
    throw new Error(variantError.message);
  }

  if (stockError) {
    throw new Error(`Khong the kiem tra ton kho: ${stockError.message}`);
  }

  const stockMap = new Map(
    ((stocks ?? []) as VariantStockRecord[]).map((item) => [
      Number(item.variant_id),
      Math.max(0, Number(item.total_quantity ?? 0)),
    ]),
  );

  return new Map(
    ((variants ?? []) as VariantCheckoutRecord[]).map((variant) => [
      Number(variant.variant_id),
      {
        price: toNumber(variant.price),
        status: variant.status ?? null,
        stockQuantity: stockMap.get(Number(variant.variant_id)) ?? 0,
      },
    ]),
  );
}

export async function prepareCheckout(cartItemIds: unknown, voucherCode?: unknown) {
  const selectedIds = normalizeIds(cartItemIds);
  if (!selectedIds.length) {
    throw new Error("Vui long chon san pham can thanh toan.");
  }

  const owner = await getCartOwner();
  const cartRecord = await findActiveCart(owner);
  const cart = await buildCartDto(cartRecord);

  if (!cart.cart_id || !cart.items.length) {
    throw new Error("Gio hang dang trong.");
  }

  const selectedItems = cart.items.filter((item) =>
    selectedIds.includes(item.cart_item_id),
  );

  if (selectedItems.length !== selectedIds.length) {
    throw new Error("Mot so san pham khong con trong gio hang.");
  }

  const standardVariantSnapshot = await getVariantCheckoutSnapshot(
    selectedItems
      .filter((item) => item.item_type === "STANDARD")
      .map((item) => item.variant_id ?? 0),
  );

  const validatedItems = await Promise.all(
    selectedItems.map(async (item) => {
      if (item.item_type === "CUSTOMIZED") {
        if (!item.customization_id) {
          throw new Error(`${item.name || "San pham"} khong co yeu cau may do hop le.`);
        }

        const customization = await assertCustomizationCheckoutReady(item.customization_id);
        const currentUnitPrice = toNumber(customization.custom_price);

        return {
          ...item,
          unit_price: currentUnitPrice,
          line_total: currentUnitPrice * item.quantity,
          custom_price: currentUnitPrice,
          surcharge_amount: toNumber(customization.surcharge_amount),
          customization_snapshot:
            item.customization_snapshot ?? customization.measurement_snapshot ?? null,
        };
      }

      const variantId = item.variant_id ?? 0;
      const variant = standardVariantSnapshot.get(variantId);

      if (!variant || !isVariantPurchasableStatus(variant.status)) {
        throw new Error(`${item.name} khong con kha dung.`);
      }

      if (item.quantity > variant.stockQuantity) {
        throw new Error(`${item.name} không đủ số lượng trong kho.`);
      }

      const currentUnitPrice = variant.price;
      return {
        ...item,
        unit_price: currentUnitPrice,
        line_total: currentUnitPrice * item.quantity,
      };
    }),
  );

  const subtotal = validatedItems.reduce((sum, item) => sum + item.line_total, 0);
  const hasCustomizedItems = validatedItems.some(
    (item) => item.item_type === "CUSTOMIZED",
  );
  const customSurchargeTotal = validatedItems.reduce((sum, item) => {
    if (item.item_type !== "CUSTOMIZED") {
      return sum;
    }

    return sum + toNumber(item.surcharge_amount) * item.quantity;
  }, 0);
  const benefit = await resolveCheckoutBenefit(
    typeof voucherCode === "string" ? voucherCode.trim() : "",
    subtotal,
    owner.customerId,
    {
      hasCustomizedItems,
      customSurchargeTotal,
    },
  );

  return buildPreview(
    validatedItems,
    cart,
    selectedIds,
    benefit.discountAmount,
    benefit.rewardDiscountAmount,
    benefit.freeShipping ? 0 : 30000,
  );
}

async function resolveCheckoutBenefit(
  voucherCode: string,
  subtotal: number,
  customerId: number | null,
  options: {
    hasCustomizedItems: boolean;
    customSurchargeTotal: number;
  },
): Promise<CheckoutBenefit> {
  if (!voucherCode) {
    return { discountAmount: 0, rewardDiscountAmount: 0, freeShipping: false };
  }

  if (!customerId) {
    throw new Error("Ma quyen loi chi danh cho thanh vien.");
  }

  const admin = createAdminClient();
  const { data: reward, error: rewardError } = await admin
    .schema("iam")
    .from("loyalty_reward")
    .select("reward_type, reward_value")
    .eq("customer_id", customerId)
    .ilike("voucher_code", voucherCode)
    .eq("status", "AVAILABLE")
    .or(`expired_at.is.null,expired_at.gt.${new Date().toISOString()}`)
    .maybeSingle();

  if (rewardError) throw new Error(rewardError.message);
  if (!reward) {
    throw new Error("Ma quyen loi khong hop le, khong thuoc tai khoan hoac da het han.");
  }
  if (reward.reward_type === "FREE_SHIPPING") {
    return { discountAmount: 0, rewardDiscountAmount: 0, freeShipping: true };
  }
  if (reward.reward_type === "FREE_TAILOR") {
    if (!options.hasCustomizedItems || options.customSurchargeTotal <= 0) {
      throw new Error("Quyen loi FREE_TAILOR chi ap dung cho san pham customize.");
    }

    return {
      discountAmount: 0,
      rewardDiscountAmount: Math.min(options.customSurchargeTotal, subtotal),
      freeShipping: false,
    };
  }
  if (!["BIRTHDAY_VOUCHER", "TIER_VOUCHER"].includes(reward.reward_type)) {
    throw new Error("Quyen loi nay khong ap dung cho don hang nay.");
  }
  return {
    discountAmount: 0,
    rewardDiscountAmount: Math.min(Number(reward.reward_value ?? 0), subtotal),
    freeShipping: false,
  };
}

export async function resolveCheckoutAddress(
  currentCustomerId: number | null,
  addressId: unknown,
  shippingAddress?: ShippingAddressValues,
) {
  const admin = createAdminClient();

  if (currentCustomerId && addressId) {
    const { data, error } = await admin
      .schema("iam")
      .from("address")
      .select("address_id, customer_id")
      .eq("address_id", Number(addressId))
      .eq("customer_id", currentCustomerId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Dia chi khong ton tai hoac khong thuoc tai khoan nay.");
    }

    return {
      customerId: currentCustomerId,
      addressId: Number((data as AddressRecord).address_id),
    };
  }

  if (!shippingAddress) {
    throw new Error("Vui long nhap dia chi giao hang.");
  }

  // Validate address input values
  if (!shippingAddress.recipient_name?.trim()) {
    throw new Error("Vui long nhap ten nguoi nhan.");
  }
  if (!shippingAddress.recipient_phone?.trim()) {
    throw new Error("Vui long nhap so dien thoai nguoi nhan.");
  }
  if (!currentCustomerId) {
    if (!shippingAddress.email?.trim()) {
      throw new Error("Vui long nhap email.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email.trim())) {
      throw new Error("Email khong dung dinh dang.");
    }
  }
  if (!shippingAddress.province_id || Number(shippingAddress.province_id) <= 0) {
    throw new Error("Vui long chon tinh/thanh pho hop le.");
  }
  if (!shippingAddress.district_name?.trim()) {
    throw new Error("Vui long nhap quan/huyen.");
  }
  if (!shippingAddress.address_detail?.trim()) {
    throw new Error("Vui long nhap dia chi chi tiet.");
  }

  const customerId =
    currentCustomerId ?? (await findOrCreateGuestCustomer(shippingAddress));
  const createdAddressId = await createCheckoutAddress(customerId, shippingAddress);

  return {
    customerId,
    addressId: createdAddressId,
  };
}

async function findOrCreateGuestCustomer(shippingAddress: ShippingAddressValues) {
  const admin = createAdminClient();
  const rawPhone = shippingAddress.recipient_phone?.trim();
  const email = shippingAddress.email?.trim().toLowerCase();

  if (!rawPhone || !email) {
    throw new Error("Khach vang lai can nhap so dien thoai va email.");
  }

  const phoneIdentifier = parseAuthIdentifier(rawPhone);
  if (!phoneIdentifier || phoneIdentifier.type !== "phone") {
    throw new Error("So dien thoai khong hop le.");
  }

  const phone = phoneIdentifier.value;

  const { data: existing, error: existingError } = await admin
    .schema("iam")
    .from("customer")
    .select("customer_id, email, customer_name")
    .eq("phone", phone)
    .eq("customer_type", "GUEST")
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.customer_id) {
    const nextName = shippingAddress.recipient_name?.trim() || null;
    const nextEmail = email;
    const currentEmail =
      typeof existing.email === "string" ? existing.email.trim().toLowerCase() : null;
    const currentName =
      typeof existing.customer_name === "string" ? existing.customer_name.trim() : null;

    if (currentEmail !== nextEmail || currentName !== nextName) {
      const { error: updateGuestError } = await admin
        .schema("iam")
        .from("customer")
        .update({
          email: nextEmail,
          customer_name: nextName,
          updated_at: new Date().toISOString(),
        })
        .eq("customer_id", Number(existing.customer_id))
        .eq("customer_type", "GUEST");

      if (updateGuestError) {
        throw new Error(updateGuestError.message);
      }
    }

    return Number(existing.customer_id);
  }

  const now = new Date().toISOString();
  const { data, error } = await admin
    .schema("iam")
    .from("customer")
    .insert({
      customer_name: shippingAddress.recipient_name,
      phone,
      email,
      customer_type: "GUEST",
      total_spent: 0,
      spent_in_year: 0,
      created_at: now,
      updated_at: now,
    })
    .select("customer_id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return Number(data.customer_id);
}

async function createCheckoutAddress(
  customerId: number,
  shippingAddress: ShippingAddressValues,
) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await admin
    .schema("iam")
    .from("address")
    .insert({
      customer_id: customerId,
      recipient_name: shippingAddress.recipient_name,
      recipient_phone: shippingAddress.recipient_phone,
      province_id: shippingAddress.province_id,
      district_name: shippingAddress.district_name,
      address_detail: shippingAddress.address_detail,
      is_default: false,
      is_active: true,
      created_at: now,
      updated_at: now,
    })
    .select("address_id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return Number(data.address_id);
}

export async function getActivePaymentMethod(methodId: unknown) {
  const id = Number(methodId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Phuong thuc thanh toan khong hop le.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("sales")
    .from("payment_method")
    .select("method_id, method_code, method_name, is_active")
    .eq("method_id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Phuong thuc thanh toan khong ton tai.");
  }

  return data as PaymentMethodRecord;
}

async function attachGuestCartToCustomer(
  cartId: number,
  customerId: number,
) {
  const admin = createAdminClient();
  const { data: cart, error: cartError } = await admin
    .schema("sales")
    .from("cart")
    .select("cart_id, customer_id")
    .eq("cart_id", cartId)
    .eq("cart_status", "ACTIVE")
    .maybeSingle();

  if (cartError) {
    throw new Error(cartError.message);
  }

  if (!cart) {
    throw new Error("Gio hang khong ton tai hoac da checkout.");
  }

  const existingCustomerId = cart.customer_id
    ? Number(cart.customer_id)
    : null;

  if (existingCustomerId === customerId) {
    return null;
  }

  if (existingCustomerId !== null) {
    const { data: existingOwner, error: ownerError } = await admin
      .schema("iam")
      .from("customer")
      .select("customer_type")
      .eq("customer_id", existingCustomerId)
      .maybeSingle();

    if (ownerError) {
      throw new Error(ownerError.message);
    }

    if (existingOwner?.customer_type !== "GUEST") {
      throw new Error("Gio hang khong thuoc tai khoan hien tai.");
    }
  }

  let updateQuery = admin
    .schema("sales")
    .from("cart")
    .update({
      customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
    .eq("cart_id", cartId)
    .eq("cart_status", "ACTIVE");

  updateQuery = existingCustomerId === null
    ? updateQuery.is("customer_id", null)
    : updateQuery.eq("customer_id", existingCustomerId);

  const { data: claimedCart, error } = await updateQuery
    .select("cart_id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!claimedCart) {
    throw new Error("Gio hang da thay doi, vui long tai lai trang va thu lai.");
  }

  return existingCustomerId;
}

async function backfillGuestCustomizationOwner(
  customerId: number,
  prepared: PreparedCheckout,
  previousGuestCustomerId: number | null,
) {
  const customizationIds = prepared.items
    .filter((item) => item.item_type === "CUSTOMIZED" && item.customization_id)
    .map((item) => Number(item.customization_id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (!customizationIds.length) {
    return;
  }

  const admin = createAdminClient();
  let updateQuery = admin
    .schema("customization")
    .from("customization_request")
    .update({
      customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
    .in("customization_id", customizationIds);

  updateQuery = previousGuestCustomerId === null
    ? updateQuery.is("customer_id", null)
    : updateQuery.or(
        `customer_id.is.null,customer_id.eq.${previousGuestCustomerId}`,
      );

  const { error } = await updateQuery;

  if (error) {
    throw new Error(error.message);
  }
}

export async function createCheckoutOrder(values: CreateOrderValues) {
  const customerNote = values.customer_note?.trim();
  if (customerNote && customerNote.length > 200) {
    throw new Error("Ghi chu don hang khong duoc vuot qua 200 ky tu.");
  }

  const admin = createAdminClient();
  const currentCustomerId = await getCurrentCustomerId();
  const [prepared, paymentMethod, checkoutAddress] = await Promise.all([
    prepareCheckout(values.cart_item_ids, values.voucher_code),
    getActivePaymentMethod(values.payment_method_id),
    resolveCheckoutAddress(
      currentCustomerId,
      values.address_id,
      values.shipping_address,
    ),
  ]);
  const { customerId, addressId } = checkoutAddress;

  if (!prepared.cart.cart_id) {
    throw new Error("Gio hang khong ton tai.");
  }

  const previousGuestCustomerId = await attachGuestCartToCustomer(
    prepared.cart.cart_id,
    customerId,
  );
  await backfillGuestCustomizationOwner(
    customerId,
    prepared,
    previousGuestCustomerId,
  );

  await Promise.all(
    prepared.items
      .filter((item) => item.item_type === "CUSTOMIZED" && item.customization_id)
      .map((item) =>
        assertCustomizationCheckoutReady(item.customization_id!, customerId),
      ),
  );

  const hasCustomizedItems = prepared.items.some(
    (item) => item.item_type === "CUSTOMIZED",
  );
  const hasStandardItems = prepared.items.some(
    (item) => item.item_type === "STANDARD",
  );

  if (hasCustomizedItems && !hasStandardItems) {
    return createCustomizedCheckoutOrder({
      prepared,
      customerId,
      addressId,
      paymentMethod,
      customerNote: customerNote || null,
      voucherCode: values.voucher_code?.trim() || null,
    });
  }

  const { data, error } = await admin.schema("sales").rpc("checkout_order", {
    p_cart_id: prepared.cart.cart_id,
    p_customer_id: customerId,
    p_address_id: addressId,
    p_payment_method_id: Number(values.payment_method_id),
    p_cart_item_ids: prepared.selected_ids,
    p_customer_note: customerNote || null,
    p_voucher_code: values.voucher_code?.trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as {
    order_id: number;
    order_code: string;
    order_status: string;
    payment_status: string;
    total_amount: number;
    shipping_id: number;
    payment_id: number;
  };
}

async function consumeCheckoutReward(
  customerId: number,
  voucherCode: string | null,
  orderId: number,
  rewardDiscountAmount: number,
  shippingFee: number,
) {
  if (!voucherCode) {
    return null;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("iam")
    .from("loyalty_reward")
    .select("reward_id, reward_type, reward_value")
    .eq("customer_id", customerId)
    .ilike("voucher_code", voucherCode)
    .eq("status", "AVAILABLE")
    .or(`expired_at.is.null,expired_at.gt.${new Date().toISOString()}`)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Ma quyen loi khong hop le, khong thuoc tai khoan hoac da het han.");
  }

  const reward = data as RewardRecord;
  const { error: updateRewardError } = await admin
    .schema("iam")
    .from("loyalty_reward")
    .update({
      status: "USED",
      updated_at: new Date().toISOString(),
    })
    .eq("reward_id", reward.reward_id)
    .eq("status", "AVAILABLE");

  if (updateRewardError) {
    throw new Error(updateRewardError.message);
  }

  const usedAmount =
    reward.reward_type === "FREE_SHIPPING" ? shippingFee : rewardDiscountAmount;
  const { error: rewardUsageError } = await admin
    .schema("iam")
    .from("reward_usage")
    .insert({
      reward_id: reward.reward_id,
      order_id: orderId,
      used_amount: usedAmount,
      used_at: new Date().toISOString(),
    });

  if (rewardUsageError) {
    throw new Error(rewardUsageError.message);
  }

  return reward.reward_id;
}

async function createCustomizedCheckoutOrder({
  prepared,
  customerId,
  addressId,
  paymentMethod,
  customerNote,
  voucherCode,
}: {
  prepared: PreparedCheckout;
  customerId: number;
  addressId: number;
  paymentMethod: PaymentMethodRecord;
  customerNote: string | null;
  voucherCode: string | null;
}) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const orderCode = `XX${Date.now()}`;
  let orderId: number | null = null;
  let shippingId: number | null = null;
  let paymentId: number | null = null;
  let orderItemIds: number[] = [];
  let rewardId: number | null = null;

  try {
    const { data: order, error: orderError } = await admin
      .schema("sales")
      .from("sales_order")
      .insert({
        order_code: orderCode,
        customer_id: customerId,
        order_date: now,
        reward_discount_amount: prepared.reward_discount_amount,
        shipping_fee: prepared.shipping_fee,
        total_amount: prepared.total_amount,
        order_status: "PENDING",
        payment_status: "PENDING",
        customer_note: customerNote,
        created_at: now,
        updated_at: now,
      })
      .select("order_id, order_code, order_status, payment_status, total_amount")
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    const createdOrder = order as CreatedOrderRecord;
    orderId = Number(createdOrder.order_id);

    const orderItemsPayload = prepared.items.map((item) => ({
      order_id: orderId,
      variant_id: null,
      customization_id: item.customization_id ?? null,
      customization_snapshot: item.customization_snapshot ?? null,
      item_type: "CUSTOMIZED",
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: 0,
      line_total: item.line_total,
      created_at: now,
    }));

    const { data: orderItems, error: orderItemsError } = await admin
      .schema("sales")
      .from("order_item")
      .insert(orderItemsPayload)
      .select("order_item_id");

    if (orderItemsError) {
      throw new Error(orderItemsError.message);
    }

    orderItemIds = (orderItems ?? []).map((item) => Number(item.order_item_id));

    const { data: shipping, error: shippingError } = await admin
      .schema("sales")
      .from("shipping")
      .insert({
        order_id: orderId,
        address_id: addressId,
        shipping_provider: "PENDING",
        tracking_code: null,
        shipping_status: "PENDING",
        shipped_at: null,
        delivered_at: null,
        created_at: now,
        updated_at: now,
      })
      .select("shipping_id")
      .single();

    if (shippingError) {
      throw new Error(shippingError.message);
    }

    shippingId = Number(shipping.shipping_id);

    const transactionCode = `${paymentMethod.method_code}-${orderCode}`;
    const { data: payment, error: paymentError } = await admin
      .schema("sales")
      .from("payment")
      .insert({
        order_id: orderId,
        method_id: paymentMethod.method_id,
        amount: prepared.total_amount,
        payment_status: "PENDING",
        transaction_code: transactionCode,
        paid_at: now,
        created_at: now,
        updated_at: now,
      })
      .select("payment_id")
      .single();

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    paymentId = Number(payment.payment_id);

    rewardId = await consumeCheckoutReward(
      customerId,
      voucherCode,
      orderId,
      prepared.reward_discount_amount,
      prepared.shipping_fee,
    );

    const { error: deleteCartItemsError } = await admin
      .schema("sales")
      .from("cart_item")
      .delete()
      .in("cart_item_id", prepared.selected_ids);

    if (deleteCartItemsError) {
      throw new Error(deleteCartItemsError.message);
    }

    const { count: remainingItemCount, error: remainingItemsError } = await admin
      .schema("sales")
      .from("cart_item")
      .select("cart_item_id", { count: "exact", head: true })
      .eq("cart_id", prepared.cart.cart_id!);

    if (remainingItemsError) {
      console.error("[checkout] Khong the dem cart item con lai", remainingItemsError);
    } else if ((remainingItemCount ?? 0) === 0) {
      const { error: checkoutCartError } = await admin
        .schema("sales")
        .from("cart")
        .update({ cart_status: "CHECKOUT", updated_at: now })
        .eq("cart_id", prepared.cart.cart_id!);

      if (checkoutCartError) {
        console.error("[checkout] Khong the chuyen cart sang CHECKOUT", checkoutCartError);
      }
    }

    const customizableIds = prepared.items
      .map((item) => item.customization_id)
      .filter((value): value is number => Number.isInteger(value) && Number(value) > 0);

    if (customizableIds.length) {
      const { error: updateCustomizationError } = await admin
        .schema("customization")
        .from("customization_request")
        .update({
          customization_status: "CONFIRMED",
          updated_at: now,
        })
        .in("customization_id", customizableIds)
        .in("customization_status", ["REQUESTED", "MEASUREMENT_PENDING", "MEASURED"]);

      if (updateCustomizationError) {
        throw new Error(updateCustomizationError.message);
      }
    }

    return {
      order_id: orderId,
      order_code: createdOrder.order_code,
      order_status: createdOrder.order_status,
      payment_status: createdOrder.payment_status,
      total_amount: toNumber(createdOrder.total_amount),
      shipping_id: shippingId,
      payment_id: paymentId,
      payment_url: undefined,
    };
  } catch (error) {
    await rollbackCreatedCheckout({
      orderId,
      shippingId,
      paymentId,
      orderItemIds,
      rewardId,
    });
    throw error;
  }
}

async function createCheckoutOrderLegacy(values: CreateOrderValues) {
  const admin = createAdminClient();
  const currentCustomerId = await getCurrentCustomerId();
  const prepared = await prepareCheckout(values.cart_item_ids);
  const paymentMethod = await getActivePaymentMethod(values.payment_method_id);
  const { customerId, addressId } = await resolveCheckoutAddress(
    currentCustomerId,
    values.address_id,
    values.shipping_address,
  );

  const now = new Date().toISOString();
  const orderCode = `XX${Date.now()}`;
  let orderId: number | null = null;
  let shippingId: number | null = null;
  let paymentId: number | null = null;
  let orderItemIds: number[] = [];

  try {
    const { data: order, error: orderError } = await admin
      .schema("sales")
      .from("sales_order")
      .insert({
        order_code: orderCode,
        customer_id: customerId,
        order_date: now,
        reward_discount_amount: prepared.reward_discount_amount,
        shipping_fee: prepared.shipping_fee,
        total_amount: prepared.total_amount,
        order_status: "PENDING",
        payment_status: "PENDING",
        customer_note: values.customer_note ?? null,
        created_at: now,
        updated_at: now,
      })
      .select("order_id, order_code, order_status, payment_status, total_amount")
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    const createdOrder = order as CreatedOrderRecord;
    orderId = Number(createdOrder.order_id);

    const orderItemsPayload = prepared.items.map((item) => ({
      order_id: orderId,
      variant_id: item.variant_id,
      customization_id: null,
      item_type: "STANDARD",
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: 0,
      line_total: item.line_total,
      created_at: now,
    }));

    const { data: orderItems, error: orderItemsError } = await admin
      .schema("sales")
      .from("order_item")
      .insert(orderItemsPayload)
      .select("order_item_id");

    if (orderItemsError) {
      throw new Error(orderItemsError.message);
    }

    orderItemIds = (orderItems ?? []).map((item) => Number(item.order_item_id));

    const { data: shipping, error: shippingError } = await admin
      .schema("sales")
      .from("shipping")
      .insert({
        order_id: orderId,
        address_id: addressId,
        shipping_provider: "PENDING",
        tracking_code: null,
        shipping_status: "PENDING",
        shipped_at: null,
        delivered_at: null,
        created_at: now,
        updated_at: now,
      })
      .select("shipping_id")
      .single();

    if (shippingError) {
      throw new Error(shippingError.message);
    }

    shippingId = Number(shipping.shipping_id);

    const transactionCode = `${paymentMethod.method_code}-${orderCode}`;
    const { data: payment, error: paymentError } = await admin
      .schema("sales")
      .from("payment")
      .insert({
        order_id: orderId,
        method_id: paymentMethod.method_id,
        amount: prepared.total_amount,
        payment_status: "PENDING",
        transaction_code: transactionCode,
        paid_at: now,
        created_at: now,
        updated_at: now,
      })
      .select("payment_id")
      .single();

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    paymentId = Number(payment.payment_id);

    const { error: deleteCartItemsError } = await admin
      .schema("sales")
      .from("cart_item")
      .delete()
      .in("cart_item_id", prepared.selected_ids);

    if (deleteCartItemsError) {
      throw new Error(deleteCartItemsError.message);
    }

    const { count: remainingItemCount, error: remainingItemsError } = await admin
      .schema("sales")
      .from("cart_item")
      .select("cart_item_id", { count: "exact", head: true })
      .eq("cart_id", prepared.cart.cart_id!);

    if (remainingItemsError) {
      console.error("[checkout] Khong the dem cart item con lai", remainingItemsError);
    } else if ((remainingItemCount ?? 0) === 0) {
      const { error: checkoutCartError } = await admin
        .schema("sales")
        .from("cart")
        .update({ cart_status: "CHECKOUT", updated_at: now })
        .eq("cart_id", prepared.cart.cart_id!);

      if (checkoutCartError) {
        console.error("[checkout] Khong the chuyen cart sang CHECKOUT", checkoutCartError);
      }
    }

    return {
      order_id: orderId,
      order_code: createdOrder.order_code,
      order_status: createdOrder.order_status,
      payment_status: createdOrder.payment_status,
      total_amount: toNumber(createdOrder.total_amount),
      shipping_id: shippingId,
      payment_id: paymentId,
      payment_url: undefined,
    };
  } catch (error) {
    await rollbackCreatedCheckout({
      orderId,
      shippingId,
      paymentId,
      orderItemIds,
      rewardId: null,
    });
    throw error;
  }
}

async function rollbackCreatedCheckout({
  orderId,
  shippingId,
  paymentId,
  orderItemIds,
  rewardId,
}: {
  orderId: number | null;
  shippingId: number | null;
  paymentId: number | null;
  orderItemIds: number[];
  rewardId: number | null;
}) {
  const admin = createAdminClient();

  if (rewardId && orderId) {
    await admin
      .schema("iam")
      .from("reward_usage")
      .delete()
      .eq("reward_id", rewardId)
      .eq("order_id", orderId);

    await admin
      .schema("iam")
      .from("loyalty_reward")
      .update({ status: "AVAILABLE", updated_at: new Date().toISOString() })
      .eq("reward_id", rewardId);
  }

  if (paymentId) {
    await admin.schema("sales").from("payment").delete().eq("payment_id", paymentId);
  }

  if (shippingId) {
    await admin
      .schema("sales")
      .from("shipping")
      .delete()
      .eq("shipping_id", shippingId);
  }

  if (orderItemIds.length) {
    await admin
      .schema("sales")
      .from("order_item")
      .delete()
      .in("order_item_id", orderItemIds);
  }

  if (orderId) {
    await admin.schema("sales").from("sales_order").delete().eq("order_id", orderId);
  }
}
