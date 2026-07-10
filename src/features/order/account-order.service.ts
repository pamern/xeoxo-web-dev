import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { createClient } from "@/lib/supabase/server";
import { getProductMediaPublicUrl } from "@/lib/supabase/storage";
import type {
  AccountOrder,
  AccountOrderItem,
  AccountOrderDetail,
  AccountOrderShipping,
} from "@/types/account-order.types";

type OrderSummaryRecord = {
  created_at: string;
  item_count: number | string;
  order_code: string;
  order_id: number;
  payment_status: string;
  refund_status: string | null;
  shipping_status: string | null;
  status: string;
  tracking_code: string | null;
  thumbnail_storage_key: string | null;
  total_amount: number | string;
};

type OrderItemRecord = {
  line_total: number | string;
  order_id: number;
  order_item_id: number;
  quantity: number;
  unit_price: number | string;
  variant_id: number | null;
};

type VariantRecord = {
  component_id: number;
  size_option_id: number | null;
  variant_id: number;
};

type ComponentRecord = {
  component_id: number;
  product_line_id: number;
};

type ProductLineRecord = {
  color_id: number | null;
  line_name: string;
  product_line_id: number;
  slug: string;
};

type SizeOptionRecord = {
  size_name: string;
  size_option_id: number;
};

type ColorRecord = {
  color_id: number;
  color_name: string;
};

type ProductLineMediaRecord = {
  display_order: number;
  media_id: number;
  media_role: string;
  product_line_id: number;
};

type MediaRecord = {
  alt_text: string | null;
  bucket_name: string | null;
  media_id: number;
  storage_key: string | null;
};

type OrderPaymentRecord = {
  amount: number | string;
  order_id: number;
  paid_at: string | null;
  payment_id: number;
  payment_status: string;
  transaction_code: string;
};

type RefundRecord = {
  refund_id: number;
  refund_status: string;
};

type CancelOrderResult = {
  success: boolean;
  message?: string;
  order_status?: string;
  payment_status?: string;
  refund_status?: string | null;
};

const CANCELLABLE_ORDER_STATUSES = ["PENDING", "CONFIRMED", "PACKING"];
const TERMINAL_REFUND_STATUSES = new Set(["COMPLETED", "CANCELLED"]);

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

async function getLatestRefundStatusForOrder(
  supabase: SupabaseClient,
  orderId: number,
): Promise<string | null> {
  const { data: payments, error: paymentError } = await supabase
    .schema("sales")
    .from("payment")
    .select("payment_id")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  const paymentIds = (payments ?? [])
    .map((payment) => Number(payment.payment_id))
    .filter((paymentId) => Number.isInteger(paymentId) && paymentId > 0);

  if (!paymentIds.length) {
    return null;
  }

  const { data: refunds, error: refundError } = await supabase
    .schema("sales")
    .from("refund")
    .select("refund_status")
    .in("payment_id", paymentIds)
    .order("created_at", { ascending: false })
    .limit(1);

  if (refundError) {
    throw new Error(refundError.message);
  }

  const latestRefund = refunds?.[0];
  return latestRefund?.refund_status ? String(latestRefund.refund_status) : null;
}

async function fetchRecordsByIds<TRecord extends Record<string, unknown>>(
  supabase: SupabaseClient,
  schema: string,
  table: string,
  select: string,
  key: string,
  ids: Array<number | string>,
) {
  const uniqueIds = Array.from(new Set(ids)).filter(Boolean);

  if (!uniqueIds.length) {
    return [] as TRecord[];
  }

  const { data, error } = await supabase
    .schema(schema)
    .from(table)
    .select(select)
    .in(key, uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as TRecord[];
}

export async function getCustomerOrdersByCustomerId(
  customerId: number,
): Promise<AccountOrder[]> {
  const supabase = await createClient();

  const { data: orderSummaries, error: orderSummariesError } = await supabase
    .schema("sales")
    .from("v_my_order_summary")
    .select(
      "order_id, order_code, created_at, status, payment_status, total_amount, item_count, shipping_status, tracking_code, refund_status, thumbnail_storage_key",
    )
    .order("created_at", { ascending: false });

  if (orderSummariesError) {
    throw new Error(orderSummariesError.message);
  }

  const safeOrderSummaries = (orderSummaries ?? []) as OrderSummaryRecord[];

  if (!safeOrderSummaries.length) {
    return [];
  }

  const orderIds = safeOrderSummaries.map((order) => Number(order.order_id));

  const { data: orderItems, error: orderItemsError } = await supabase
    .schema("sales")
    .from("order_item")
    .select(
      "order_item_id, order_id, variant_id, quantity, unit_price, line_total",
    )
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });

  if (orderItemsError) {
    throw new Error(orderItemsError.message);
  }

  const safeOrderItems = (orderItems ?? []) as OrderItemRecord[];
  const orderItemIds = safeOrderItems.map((item) => Number(item.order_item_id));
  const variantIds = safeOrderItems
    .map((item) => item.variant_id)
    .filter((id): id is number => typeof id === "number");

  const { data: reviews, error: reviewsError } = orderItemIds.length
    ? await supabase
        .schema("sales")
        .from("review")
        .select("order_item_id")
        .in("order_item_id", orderItemIds)
    : { data: [], error: null };

  if (reviewsError) {
    throw new Error(reviewsError.message);
  }

  const variants = await fetchRecordsByIds<VariantRecord>(
    supabase,
    "catalog",
    "product_variant",
    "variant_id, component_id, size_option_id",
    "variant_id",
    variantIds,
  );
  const components = await fetchRecordsByIds<ComponentRecord>(
    supabase,
    "catalog",
    "product_component",
    "component_id, product_line_id",
    "component_id",
    variants.map((variant) => variant.component_id),
  );
  const productLines = await fetchRecordsByIds<ProductLineRecord>(
    supabase,
    "catalog",
    "product_line",
    "product_line_id, line_name, slug, color_id",
    "product_line_id",
    components.map((component) => component.product_line_id),
  );
  const sizes = await fetchRecordsByIds<SizeOptionRecord>(
    supabase,
    "catalog",
    "size_option",
    "size_option_id, size_name",
    "size_option_id",
    variants
      .map((variant) => variant.size_option_id)
      .filter((id): id is number => typeof id === "number"),
  );
  const colors = await fetchRecordsByIds<ColorRecord>(
    supabase,
    "catalog",
    "color",
    "color_id, color_name",
    "color_id",
    productLines
      .map((line) => line.color_id)
      .filter((id): id is number => typeof id === "number"),
  );
  const lineMedia = await fetchRecordsByIds<ProductLineMediaRecord>(
    supabase,
    "catalog",
    "product_line_media",
    "product_line_id, media_id, media_role, display_order",
    "product_line_id",
    productLines.map((line) => line.product_line_id),
  );
  const media = await fetchRecordsByIds<MediaRecord>(
    supabase,
    "catalog",
    "media",
    "media_id, storage_key, bucket_name, alt_text",
    "media_id",
    lineMedia.map((record) => record.media_id),
  );

  const variantMap = new Map(
    variants.map((variant) => [variant.variant_id, variant]),
  );
  const componentMap = new Map(
    components.map((component) => [component.component_id, component]),
  );
  const productLineMap = new Map(
    productLines.map((line) => [line.product_line_id, line]),
  );
  const sizeMap = new Map(sizes.map((size) => [size.size_option_id, size]));
  const colorMap = new Map(colors.map((color) => [color.color_id, color]));
  const mediaMap = new Map(media.map((item) => [item.media_id, item]));
  const mediaByLine = new Map<number, ProductLineMediaRecord[]>();

  for (const record of lineMedia) {
    const list = mediaByLine.get(record.product_line_id) ?? [];
    list.push(record);
    mediaByLine.set(record.product_line_id, list);
  }

  const itemsByOrder = new Map<number, AccountOrderItem[]>();
  const reviewedOrderItemIds = new Set(
    (reviews ?? []).map((review) => Number(review.order_item_id)),
  );

  for (const item of safeOrderItems) {
    const variant = item.variant_id
      ? variantMap.get(item.variant_id)
      : undefined;
    const component = variant
      ? componentMap.get(variant.component_id)
      : undefined;
    const productLine = component
      ? productLineMap.get(component.product_line_id)
      : undefined;
    const size = variant?.size_option_id
      ? (sizeMap.get(variant.size_option_id)?.size_name ?? null)
      : null;
    const color = productLine?.color_id
      ? (colorMap.get(productLine.color_id)?.color_name ?? null)
      : null;
    const lineMediaRecords = productLine
      ? [...(mediaByLine.get(productLine.product_line_id) ?? [])]
      : [];
    const mainMedia =
      lineMediaRecords.find((record) => record.media_role === "MAIN") ??
      lineMediaRecords.sort((a, b) => a.display_order - b.display_order)[0];
    const mediaRecord = mainMedia
      ? mediaMap.get(mainMedia.media_id)
      : undefined;
    const imageSrc =
      getProductMediaPublicUrl(supabase, mediaRecord?.storage_key) ??
      "/images/placeholder.png";

    const parts = [color, size].filter(Boolean);
    const mappedItem: AccountOrderItem = {
      has_review: reviewedOrderItemIds.has(Number(item.order_item_id)),
      image_alt: mediaRecord?.alt_text ?? productLine?.line_name ?? null,
      image_src: imageSrc,
      line_total: toNumber(item.line_total),
      order_item_id: Number(item.order_item_id),
      price: toNumber(item.unit_price),
      product_slug: productLine?.slug ?? null,
      quantity: Number(item.quantity),
      size_label: size,
      subtitle: parts.length ? parts.join(" - ") : "Tùy chọn mặc định",
      title: productLine?.line_name ?? "Sản phẩm Xéo Xọ",
    };

    const list = itemsByOrder.get(Number(item.order_id)) ?? [];
    list.push(mappedItem);
    itemsByOrder.set(Number(item.order_id), list);
  }

  return safeOrderSummaries.map((order) => ({
    created_at: order.created_at,
    items: itemsByOrder.get(Number(order.order_id)) ?? [],
    order_code: order.order_code,
    order_id: Number(order.order_id),
    order_status: order.status,
    payment_status: order.payment_status,
    refund_status: order.refund_status,
    total_amount: toNumber(order.total_amount),
  }));
}

export async function getCustomerOrderDetail(
  orderId: number,
  customerId: number,
): Promise<AccountOrderDetail | null> {
  const orders = await getCustomerOrdersByCustomerId(customerId);
  const order = orders.find((o) => o.order_id === orderId);
  if (!order) return null;

  const admin = createAdminClient();
  const refundStatus = await getLatestRefundStatusForOrder(admin, orderId);

  // Load shipping fee and discount amount
  const { data: salesOrderRaw, error: salesOrderError } = await admin
    .schema("sales")
    .from("sales_order")
    .select("shipping_fee, reward_discount_amount")
    .eq("order_id", orderId)
    .maybeSingle();

  const shippingFee = salesOrderRaw ? Number(salesOrderRaw.shipping_fee) : 0;
  const rewardDiscount = salesOrderRaw
    ? Number(salesOrderRaw.reward_discount_amount)
    : 0;

  // Load shipping info
  const { data: shipping, error: shippingError } = await admin
    .schema("sales")
    .from("shipping")
    .select(
      "address_id, shipping_provider, tracking_code, shipped_at, delivered_at",
    )
    .eq("order_id", orderId)
    .maybeSingle();

  let shippingInfo: AccountOrderShipping | null = null;

  if (shipping?.address_id) {
    const { data: address, error: addressError } = await admin
      .schema("iam")
      .from("address")
      .select(
        "recipient_name, recipient_phone, address_detail, district_name, province_id",
      )
      .eq("address_id", shipping.address_id)
      .maybeSingle();

    if (address) {
      let provinceName: string | null = null;
      if (address.province_id) {
        const { data: province } = await admin
          .schema("iam")
          .from("province")
          .select("province_name")
          .eq("province_id", address.province_id)
          .maybeSingle();
        provinceName = province ? String(province.province_name) : null;
      }

      shippingInfo = {
        recipient_name: String(address.recipient_name),
        recipient_phone: String(address.recipient_phone),
        address_detail: String(address.address_detail),
        district_name: String(address.district_name),
        province_name: provinceName,
        shipping_provider: shipping.shipping_provider
          ? String(shipping.shipping_provider)
          : null,
        tracking_code: shipping.tracking_code
          ? String(shipping.tracking_code)
          : null,
        shipped_at: shipping.shipped_at
          ? new Date(shipping.shipped_at).toISOString()
          : null,
        delivered_at: shipping.delivered_at
          ? new Date(shipping.delivered_at).toISOString()
          : null,
      };
    }
  }

  return {
    ...order,
    refund_status: refundStatus ?? order.refund_status ?? null,
    shipping: shippingInfo,
    shipping_fee: shippingFee,
    reward_discount_amount: rewardDiscount,
  };
}

async function cancelOrderByAuthorizedCustomer(
  orderId: number,
  customerId: number,
): Promise<CancelOrderResult> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: order, error: fetchError } = await admin
    .schema("sales")
    .from("sales_order")
    .select("order_status, payment_status, customer_id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, message: fetchError.message };
  }

  if (!order) {
    return { success: false, message: "Không tìm thấy đơn hàng." };
  }

  if (Number(order.customer_id) !== customerId) {
    return { success: false, message: "Bạn không có quyền hủy đơn hàng này." };
  }

  const normalizedOrderStatus = String(order.order_status).toUpperCase();
  const normalizedPaymentStatus = String(order.payment_status).toUpperCase();

  if (!CANCELLABLE_ORDER_STATUSES.includes(normalizedOrderStatus)) {
    return {
      success: false,
      message: "Đơn hàng đã được vận chuyển hoặc hoàn thành, không thể hủy.",
    };
  }

  const { error: updateError } = await admin
    .schema("sales")
    .from("sales_order")
    .update({
      order_status: "CANCELLED",
      updated_at: now,
    })
    .eq("order_id", orderId);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  await admin
    .schema("sales")
    .from("shipping")
    .update({
      shipping_status: "CANCELLED",
      updated_at: now,
    })
    .eq("order_id", orderId);

  if (!["PAID", "REFUNDED"].includes(normalizedPaymentStatus)) {
    return {
      success: true,
      message: "Hủy đơn hàng thành công.",
      order_status: "CANCELLED",
      payment_status: normalizedPaymentStatus,
      refund_status: null,
    };
  }

  if (normalizedPaymentStatus === "REFUNDED") {
    return {
      success: true,
      message: "Đơn hàng đã được hủy và thanh toán đã ở trạng thái hoàn tiền.",
      order_status: "CANCELLED",
      payment_status: "REFUNDED",
      refund_status: "COMPLETED",
    };
  }

  const { data: payment, error: paymentError } = await admin
    .schema("sales")
    .from("payment")
    .select("payment_id, order_id, amount, payment_status, transaction_code, paid_at")
    .eq("order_id", orderId)
    .eq("payment_status", "PAID")
    .order("paid_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError) {
    return { success: false, message: paymentError.message };
  }

  const paidPayment = (payment ?? null) as OrderPaymentRecord | null;

  if (!paidPayment) {
    return {
      success: true,
      message:
        "Đơn hàng đã được hủy, nhưng chưa tìm thấy giao dịch thanh toán PAID để tạo yêu cầu hoàn tiền.",
      order_status: "CANCELLED",
      payment_status: normalizedPaymentStatus,
      refund_status: null,
    };
  }

  const { data: latestRefund, error: latestRefundError } = await admin
    .schema("sales")
    .from("refund")
    .select("refund_id, refund_status")
    .eq("payment_id", paidPayment.payment_id)
    .is("return_id", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestRefundError) {
    return { success: false, message: latestRefundError.message };
  }

  const refundRecord = (latestRefund ?? null) as RefundRecord | null;
  let refundStatus = refundRecord?.refund_status ?? null;

  if (!refundRecord || TERMINAL_REFUND_STATUSES.has(refundRecord.refund_status)) {
    const nextRefundStatus = refundRecord?.refund_status === "COMPLETED"
      ? "COMPLETED"
      : "PENDING";

    if (!refundRecord || nextRefundStatus !== "COMPLETED") {
      const { data: createdRefund, error: createRefundError } = await admin
        .schema("sales")
        .from("refund")
        .insert({
          created_at: now,
          payment_id: paidPayment.payment_id,
          reason: "Khách hủy đơn hàng trước khi giao.",
          refunded_at: null,
          refund_status: nextRefundStatus,
          return_id: null,
          transaction_code: null,
          updated_at: now,
        })
        .select("refund_status")
        .single();

      if (createRefundError) {
        return { success: false, message: createRefundError.message };
      }

      refundStatus = createdRefund?.refund_status
        ? String(createdRefund.refund_status)
        : nextRefundStatus;
    } else {
      refundStatus = "COMPLETED";
    }
  }

  if (refundStatus === "COMPLETED") {
    const { error: syncPaymentError } = await admin
      .schema("sales")
      .from("payment")
      .update({
        payment_status: "REFUNDED",
        updated_at: now,
      })
      .eq("payment_id", paidPayment.payment_id);

    if (syncPaymentError) {
      return { success: false, message: syncPaymentError.message };
    }

    const { error: syncOrderPaymentError } = await admin
      .schema("sales")
      .from("sales_order")
      .update({
        payment_status: "REFUNDED",
        updated_at: now,
      })
      .eq("order_id", orderId);

    if (syncOrderPaymentError) {
      return { success: false, message: syncOrderPaymentError.message };
    }

    return {
      success: true,
      message: "Đơn hàng đã được hủy và hoàn tiền thành công.",
      order_status: "CANCELLED",
      payment_status: "REFUNDED",
      refund_status: "COMPLETED",
    };
  }

  return {
    success: true,
    message: "Đơn hàng đã được hủy. Hệ thống đang xử lý hoàn tiền.",
    order_status: "CANCELLED",
    payment_status: "PAID",
    refund_status: refundStatus,
  };
}

export async function cancelCustomerOrder(
  customerId: number,
  orderId: number,
): Promise<CancelOrderResult> {
  return cancelOrderByAuthorizedCustomer(orderId, customerId);
}

export async function cancelLookupOrder(
  orderId: number,
  orderCode: string,
  contact: string,
): Promise<CancelOrderResult> {
  const admin = createAdminClient();
  const identifier = parseAuthIdentifier(contact);

  if (!identifier) {
    return { success: false, message: "Thông tin tra cứu không hợp lệ." };
  }

  const { data: order, error: orderError } = await admin
    .schema("sales")
    .from("sales_order")
    .select("order_id, order_code, customer_id")
    .eq("order_id", orderId)
    .eq("order_code", orderCode)
    .maybeSingle();

  if (orderError) {
    return { success: false, message: orderError.message };
  }

  if (!order?.customer_id) {
    return { success: false, message: "Không tìm thấy đơn hàng." };
  }

  const { data: customer, error: customerError } = await admin
    .schema("iam")
    .from("customer")
    .select("email, phone")
    .eq("customer_id", order.customer_id)
    .maybeSingle();

  if (customerError) {
    return { success: false, message: customerError.message };
  }

  const phoneIdentifier =
    typeof customer?.phone === "string"
      ? parseAuthIdentifier(customer.phone)
      : null;
  const emailIdentifier =
    typeof customer?.email === "string"
      ? parseAuthIdentifier(customer.email)
      : null;

  const isContactMatched =
    (identifier.type === "phone" &&
      phoneIdentifier?.value === identifier.value) ||
    (identifier.type === "email" &&
      emailIdentifier?.value === identifier.value);

  if (!isContactMatched) {
    return {
      success: false,
      message: "Thông tin tra cứu không khớp với đơn hàng này.",
    };
  }

  return cancelOrderByAuthorizedCustomer(orderId, Number(order.customer_id));
}
