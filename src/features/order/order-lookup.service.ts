import { createAdminClient } from "@/lib/supabase/admin";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { getProductMediaPublicUrl } from "@/lib/supabase/storage";
import type {
  AccountOrderDetail,
  AccountOrderItem,
  AccountOrderShipping,
} from "@/types/account-order.types";
import type { OrderLookupInput } from "@/validations/order/order-lookup.schema";

type SalesOrderRecord = {
  created_at: string;
  customer_id: number | null;
  order_code: string;
  order_id: number;
  order_status: string;
  payment_status: string;
  reward_discount_amount: number | string;
  shipping_fee: number | string;
  total_amount: number | string;
};

type PaymentRecord = {
  payment_id: number;
};

type RefundRecord = {
  refund_status: string;
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
  media_id: number;
  storage_key: string | null;
};

type CustomerContactRecord = {
  email: string | null;
  phone: string | null;
};

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

async function getLatestRefundStatus(orderId: number): Promise<string | null> {
  const admin = createAdminClient();
  const { data: payments, error: paymentError } = await admin
    .schema("sales")
    .from("payment")
    .select("payment_id")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  const paymentIds = (payments ?? [])
    .map((payment) => Number((payment as PaymentRecord).payment_id))
    .filter((paymentId) => Number.isInteger(paymentId) && paymentId > 0);

  if (!paymentIds.length) {
    return null;
  }

  const { data: refunds, error: refundError } = await admin
    .schema("sales")
    .from("refund")
    .select("refund_status")
    .in("payment_id", paymentIds)
    .order("created_at", { ascending: false })
    .limit(1);

  if (refundError) {
    throw new Error(refundError.message);
  }

  const latestRefund = (refunds?.[0] ?? null) as RefundRecord | null;
  return latestRefund?.refund_status ?? null;
}

async function fetchRecordsByIds<TRecord extends Record<string, unknown>>(
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

  const admin = createAdminClient();
  const { data, error } = await admin
    .schema(schema)
    .from(table)
    .select(select)
    .in(key, uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as TRecord[];
}

async function getOrderItems(orderId: number): Promise<AccountOrderItem[]> {
  const admin = createAdminClient();
  const { data: orderItems, error: orderItemsError } = await admin
    .schema("sales")
    .from("order_item")
    .select(
      "order_item_id, order_id, variant_id, quantity, unit_price, line_total",
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (orderItemsError) {
    throw new Error(orderItemsError.message);
  }

  const safeOrderItems = (orderItems ?? []) as OrderItemRecord[];
  const variantIds = safeOrderItems
    .map((item) => item.variant_id)
    .filter((id): id is number => typeof id === "number");

  const variants = await fetchRecordsByIds<VariantRecord>(
    "catalog",
    "product_variant",
    "variant_id, component_id, size_option_id",
    "variant_id",
    variantIds,
  );
  const components = await fetchRecordsByIds<ComponentRecord>(
    "catalog",
    "product_component",
    "component_id, product_line_id",
    "component_id",
    variants.map((variant) => variant.component_id),
  );
  const productLines = await fetchRecordsByIds<ProductLineRecord>(
    "catalog",
    "product_line",
    "product_line_id, line_name, slug, color_id",
    "product_line_id",
    components.map((component) => component.product_line_id),
  );
  const sizes = await fetchRecordsByIds<SizeOptionRecord>(
    "catalog",
    "size_option",
    "size_option_id, size_name",
    "size_option_id",
    variants
      .map((variant) => variant.size_option_id)
      .filter((id): id is number => typeof id === "number"),
  );
  const colors = await fetchRecordsByIds<ColorRecord>(
    "catalog",
    "color",
    "color_id, color_name",
    "color_id",
    productLines
      .map((line) => line.color_id)
      .filter((id): id is number => typeof id === "number"),
  );
  const lineMedia = await fetchRecordsByIds<ProductLineMediaRecord>(
    "catalog",
    "product_line_media",
    "product_line_id, media_id, media_role, display_order",
    "product_line_id",
    productLines.map((line) => line.product_line_id),
  );
  const media = await fetchRecordsByIds<MediaRecord>(
    "catalog",
    "media",
    "media_id, storage_key, alt_text",
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

  return safeOrderItems.map((item) => {
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
      getProductMediaPublicUrl(admin, mediaRecord?.storage_key) ??
      "/images/placeholder.png";

    const parts = [color, size].filter(Boolean);

    return {
      has_review: false,
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
    } satisfies AccountOrderItem;
  });
}

async function getOrderShipping(
  orderId: number,
): Promise<AccountOrderShipping | null> {
  const admin = createAdminClient();
  const { data: shipping, error: shippingError } = await admin
    .schema("sales")
    .from("shipping")
    .select(
      "address_id, shipping_provider, tracking_code, shipped_at, delivered_at",
    )
    .eq("order_id", orderId)
    .maybeSingle();

  if (shippingError) {
    throw new Error(shippingError.message);
  }

  if (!shipping?.address_id) {
    return null;
  }

  const { data: address, error: addressError } = await admin
    .schema("iam")
    .from("address")
    .select(
      "recipient_name, recipient_phone, address_detail, district_name, province_id",
    )
    .eq("address_id", shipping.address_id)
    .maybeSingle();

  if (addressError) {
    throw new Error(addressError.message);
  }

  if (!address) {
    return null;
  }

  let provinceName: string | null = null;

  if (address.province_id) {
    const { data: province, error: provinceError } = await admin
      .schema("iam")
      .from("province")
      .select("province_name")
      .eq("province_id", address.province_id)
      .maybeSingle();

    if (provinceError) {
      throw new Error(provinceError.message);
    }

    provinceName = province ? String(province.province_name) : null;
  }

  return {
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

export async function lookupOrderByContact(
  input: OrderLookupInput,
): Promise<AccountOrderDetail | null> {
  const admin = createAdminClient();
  const identifier = parseAuthIdentifier(input.contact);

  if (!identifier) {
    return null;
  }

  const { data: order, error: orderError } = await admin
    .schema("sales")
    .from("sales_order")
    .select(
      "order_id, order_code, customer_id, order_status, payment_status, total_amount, created_at, shipping_fee, reward_discount_amount",
    )
    .eq("order_code", input.order_code)
    .maybeSingle();

  if (orderError) {
    throw new Error(orderError.message);
  }

  const safeOrder = (order ?? null) as SalesOrderRecord | null;

  if (!safeOrder?.customer_id) {
    return null;
  }

  const { data: customer, error: customerError } = await admin
    .schema("iam")
    .from("customer")
    .select("phone, email")
    .eq("customer_id", safeOrder.customer_id)
    .maybeSingle();

  if (customerError) {
    throw new Error(customerError.message);
  }

  const safeCustomer = (customer ?? null) as CustomerContactRecord | null;
  const phoneIdentifier =
    typeof safeCustomer?.phone === "string"
      ? parseAuthIdentifier(safeCustomer.phone)
      : null;
  const emailIdentifier =
    typeof safeCustomer?.email === "string"
      ? parseAuthIdentifier(safeCustomer.email)
      : null;

  const isContactMatched =
    (identifier.type === "phone" &&
      phoneIdentifier?.value === identifier.value) ||
    (identifier.type === "email" &&
      emailIdentifier?.value === identifier.value);

  if (!isContactMatched) {
    return null;
  }

  const [items, shipping, refundStatus] = await Promise.all([
    getOrderItems(safeOrder.order_id),
    getOrderShipping(safeOrder.order_id),
    getLatestRefundStatus(safeOrder.order_id),
  ]);

  return {
    created_at: safeOrder.created_at,
    items,
    order_code: safeOrder.order_code,
    order_id: Number(safeOrder.order_id),
    order_status: safeOrder.order_status,
    payment_status: safeOrder.payment_status,
    refund_status: refundStatus,
    reward_discount_amount: toNumber(safeOrder.reward_discount_amount),
    shipping,
    shipping_fee: toNumber(safeOrder.shipping_fee),
    total_amount: toNumber(safeOrder.total_amount),
  };
}
