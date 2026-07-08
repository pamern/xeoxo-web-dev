import { createAdminClient } from "@/lib/supabase/admin";
import { getProductMediaPublicUrl } from "@/lib/supabase/storage";
import type { AccountOrder, AccountOrderItem, AccountOrderDetail, AccountOrderShipping } from "@/types/account-order.types";

type SalesOrderRecord = {
  created_at: string;
  order_code: string;
  order_id: number;
  order_status: string;
  payment_status: string;
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

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

async function fetchRecordsByIds<TRecord extends Record<string, unknown>>(
  admin: ReturnType<typeof createAdminClient>,
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

  const { data, error } = await admin
    .schema(schema)
    .from(table)
    .select(select)
    .in(key, uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown) as TRecord[];
}

export async function getCustomerOrdersByCustomerId(
  customerId: number,
): Promise<AccountOrder[]> {
  const admin = createAdminClient();

  const { data: orders, error: ordersError } = await admin
    .schema("sales")
    .from("sales_order")
    .select(
      "order_id, order_code, order_status, payment_status, total_amount, created_at",
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  const safeOrders = (orders ?? []) as SalesOrderRecord[];

  if (!safeOrders.length) {
    return [];
  }

  const orderIds = safeOrders.map((order) => Number(order.order_id));

  const { data: orderItems, error: orderItemsError } = await admin
    .schema("sales")
    .from("order_item")
    .select("order_item_id, order_id, variant_id, quantity, unit_price, line_total")
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
    ? await admin
        .schema("sales")
        .from("review")
        .select("order_item_id")
        .in("order_item_id", orderItemIds)
    : { data: [], error: null };

  if (reviewsError) {
    throw new Error(reviewsError.message);
  }

  const variants = await fetchRecordsByIds<VariantRecord>(
    admin,
    "catalog",
    "product_variant",
    "variant_id, component_id, size_option_id",
    "variant_id",
    variantIds,
  );
  const components = await fetchRecordsByIds<ComponentRecord>(
    admin,
    "catalog",
    "product_component",
    "component_id, product_line_id",
    "component_id",
    variants.map((variant) => variant.component_id),
  );
  const productLines = await fetchRecordsByIds<ProductLineRecord>(
    admin,
    "catalog",
    "product_line",
    "product_line_id, line_name, slug, color_id",
    "product_line_id",
    components.map((component) => component.product_line_id),
  );
  const sizes = await fetchRecordsByIds<SizeOptionRecord>(
    admin,
    "catalog",
    "size_option",
    "size_option_id, size_name",
    "size_option_id",
    variants
      .map((variant) => variant.size_option_id)
      .filter((id): id is number => typeof id === "number"),
  );
  const colors = await fetchRecordsByIds<ColorRecord>(
    admin,
    "catalog",
    "color",
    "color_id, color_name",
    "color_id",
    productLines
      .map((line) => line.color_id)
      .filter((id): id is number => typeof id === "number"),
  );
  const lineMedia = await fetchRecordsByIds<ProductLineMediaRecord>(
    admin,
    "catalog",
    "product_line_media",
    "product_line_id, media_id, media_role, display_order",
    "product_line_id",
    productLines.map((line) => line.product_line_id),
  );
  const media = await fetchRecordsByIds<MediaRecord>(
    admin,
    "catalog",
    "media",
    "media_id, storage_key, bucket_name, alt_text",
    "media_id",
    lineMedia.map((record) => record.media_id),
  );

  const variantMap = new Map(variants.map((variant) => [variant.variant_id, variant]));
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
    const variant = item.variant_id ? variantMap.get(item.variant_id) : undefined;
    const component = variant ? componentMap.get(variant.component_id) : undefined;
    const productLine = component
      ? productLineMap.get(component.product_line_id)
      : undefined;
    const size = variant?.size_option_id
      ? sizeMap.get(variant.size_option_id)?.size_name ?? null
      : null;
    const color = productLine?.color_id
      ? colorMap.get(productLine.color_id)?.color_name ?? null
      : null;
    const lineMediaRecords = productLine
      ? [...(mediaByLine.get(productLine.product_line_id) ?? [])]
      : [];
    const mainMedia =
      lineMediaRecords.find((record) => record.media_role === "MAIN") ??
      lineMediaRecords.sort((a, b) => a.display_order - b.display_order)[0];
    const mediaRecord = mainMedia ? mediaMap.get(mainMedia.media_id) : undefined;
    const imageSrc =
      getProductMediaPublicUrl(admin, mediaRecord?.storage_key) ??
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

  return safeOrders.map((order) => ({
    created_at: order.created_at,
    items: itemsByOrder.get(Number(order.order_id)) ?? [],
    order_code: order.order_code,
    order_id: Number(order.order_id),
    order_status: order.order_status,
    payment_status: order.payment_status,
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

  // Load shipping fee and discount amount
  const { data: salesOrderRaw, error: salesOrderError } = await admin
    .schema("sales")
    .from("sales_order")
    .select("shipping_fee, reward_dicount_amount")
    .eq("order_id", orderId)
    .maybeSingle();

  const shippingFee = salesOrderRaw ? Number(salesOrderRaw.shipping_fee) : 0;
  const rewardDiscount = salesOrderRaw ? Number(salesOrderRaw.reward_dicount_amount) : 0;

  // Load shipping info
  const { data: shipping, error: shippingError } = await admin
    .schema("sales")
    .from("shipping")
    .select("address_id, shipping_provider, tracking_code, shipped_at, delivered_at")
    .eq("order_id", orderId)
    .maybeSingle();

  let shippingInfo: AccountOrderShipping | null = null;

  if (shipping?.address_id) {
    const { data: address, error: addressError } = await admin
      .schema("iam")
      .from("address")
      .select("recipient_name, recipient_phone, address_detail, district_name, province_id")
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
        shipping_provider: shipping.shipping_provider ? String(shipping.shipping_provider) : null,
        tracking_code: shipping.tracking_code ? String(shipping.tracking_code) : null,
        shipped_at: shipping.shipped_at ? new Date(shipping.shipped_at).toISOString() : null,
        delivered_at: shipping.delivered_at ? new Date(shipping.delivered_at).toISOString() : null,
      };
    }
  }

  return {
    ...order,
    shipping: shippingInfo,
    shipping_fee: shippingFee,
    reward_discount_amount: rewardDiscount,
  };
}

export async function cancelCustomerOrder(
  customerId: number,
  orderId: number,
): Promise<{ success: boolean; message?: string }> {
  const admin = createAdminClient();

  // First, verify order status and ownership
  const { data: order, error: fetchError } = await admin
    .schema("sales")
    .from("sales_order")
    .select("order_status, customer_id")
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

  const allowedStatuses = ["PENDING", "CONFIRMED", "PACKING"];
  if (!allowedStatuses.includes(String(order.order_status).toUpperCase())) {
    return {
      success: false,
      message: "Đơn hàng đã được vận chuyển hoặc hoàn thành, không thể hủy.",
    };
  }

  // Update order status to CANCELLED
  const { error: updateError } = await admin
    .schema("sales")
    .from("sales_order")
    .update({
      order_status: "CANCELLED",
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  // Update shipping status if shipping record exists
  await admin
    .schema("sales")
    .from("shipping")
    .update({
      shipping_status: "CANCELLED",
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  return { success: true };
}
