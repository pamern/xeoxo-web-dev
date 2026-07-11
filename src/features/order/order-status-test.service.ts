import { createAdminClient } from "@/lib/supabase/admin";

export const ORDER_STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PACKING",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
  "RETURNED",
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export const SHIPPING_STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PACKING",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export const REFUND_STATUS_OPTIONS = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;

export const RETURN_STATUS_OPTIONS = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "RETURNING",
  "RECEIVED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderTestStatus = (typeof ORDER_STATUS_OPTIONS)[number];
export type PaymentTestStatus = (typeof PAYMENT_STATUS_OPTIONS)[number];
export type ShippingTestStatus = (typeof SHIPPING_STATUS_OPTIONS)[number];
export type RefundTestStatus = (typeof REFUND_STATUS_OPTIONS)[number];
export type ReturnTestStatus = (typeof RETURN_STATUS_OPTIONS)[number];

type OrderRow = {
  order_code: string;
  order_id: number;
  order_status: string;
  payment_status: string;
};

type PaymentRow = {
  amount: number | string;
  payment_id: number;
  payment_status: string;
  transaction_code: string;
};

type ShippingRow = {
  delivered_at: string | null;
  shipped_at: string | null;
  shipping_id: number;
  shipping_provider: string;
  shipping_status: string;
  tracking_code: string | null;
};

type RefundRow = {
  refund_id: number;
  refund_status: string;
};

type ReturnRow = {
  approved_at: string | null;
  completed_at: string | null;
  requested_at: string;
  return_id: number;
  return_status: string;
};

export type OrderStatusSnapshot = {
  latestPayment: PaymentRow | null;
  latestRefund: RefundRow | null;
  latestReturnRequest: ReturnRow | null;
  order: OrderRow;
  shipping: ShippingRow | null;
};

export type OrderStatusUpdateInput = {
  orderCode: string;
  orderStatus: OrderTestStatus;
  paymentStatus?: PaymentTestStatus | null;
  refundStatus?: RefundTestStatus | null;
  returnStatus?: ReturnTestStatus | null;
  shippingProvider?: string | null;
  shippingStatus?: ShippingTestStatus | null;
  trackingCode?: string | null;
};

export type ResolvedStatusPlan = {
  orderStatus: OrderTestStatus;
  paymentStatus: PaymentTestStatus | null;
  refundStatus: RefundTestStatus | null;
  returnStatus: ReturnTestStatus | null;
  shippingProvider: string | null;
  shippingStatus: ShippingTestStatus | null;
  trackingCode: string | null;
};

export type OrderStatusUpdateResult = {
  after: OrderStatusSnapshot;
  before: OrderStatusSnapshot;
  plan: ResolvedStatusPlan;
};

function normalizeUpper(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? null;
}

function ensureOption<TOption extends readonly string[]>(
  value: string | null | undefined,
  options: TOption,
  label: string,
) {
  const normalized = normalizeUpper(value);

  if (!normalized) {
    return null;
  }

  if (!options.includes(normalized)) {
    throw new Error(`${label} khong hop le: ${value}`);
  }

  return normalized as TOption[number];
}

export function deriveStatusPlan(
  snapshot: OrderStatusSnapshot,
  input: OrderStatusUpdateInput,
): ResolvedStatusPlan {
  const currentPaymentStatus = ensureOption(
    snapshot.latestPayment?.payment_status ?? snapshot.order.payment_status,
    PAYMENT_STATUS_OPTIONS,
    "payment_status hien tai",
  );

  let paymentStatus = ensureOption(
    input.paymentStatus ?? null,
    PAYMENT_STATUS_OPTIONS,
    "payment_status",
  );
  let shippingStatus = ensureOption(
    input.shippingStatus ?? null,
    SHIPPING_STATUS_OPTIONS,
    "shipping_status",
  );
  let refundStatus = ensureOption(
    input.refundStatus ?? null,
    REFUND_STATUS_OPTIONS,
    "refund_status",
  );
  let returnStatus = ensureOption(
    input.returnStatus ?? null,
    RETURN_STATUS_OPTIONS,
    "return_status",
  );

  if (!paymentStatus) {
    if (input.orderStatus === "PENDING") {
      paymentStatus = "PENDING";
    } else if (input.orderStatus === "COMPLETED") {
      paymentStatus = currentPaymentStatus === "REFUNDED" ? "REFUNDED" : "PAID";
    } else if (input.orderStatus === "RETURNED") {
      paymentStatus = "REFUNDED";
    } else {
      paymentStatus = currentPaymentStatus;
    }
  }

  if (!shippingStatus) {
    const fallbackShippingStatus = {
      PENDING: "PENDING",
      CONFIRMED: "CONFIRMED",
      PACKING: "PACKING",
      SHIPPING: "SHIPPING",
      COMPLETED: "DELIVERED",
      CANCELLED: "CANCELLED",
      RETURNED: "RETURNED",
    } satisfies Record<OrderTestStatus, ShippingTestStatus>;

    shippingStatus = fallbackShippingStatus[input.orderStatus];
  }

  if (!returnStatus && input.orderStatus === "RETURNED" && snapshot.latestReturnRequest) {
    returnStatus = "COMPLETED";
  }

  if (
    !refundStatus &&
    snapshot.latestRefund &&
    (input.orderStatus === "RETURNED" || paymentStatus === "REFUNDED")
  ) {
    refundStatus = "COMPLETED";
  }

  return {
    orderStatus: input.orderStatus,
    paymentStatus,
    refundStatus,
    returnStatus,
    shippingProvider: input.shippingProvider?.trim() || snapshot.shipping?.shipping_provider || null,
    shippingStatus,
    trackingCode: input.trackingCode?.trim() || snapshot.shipping?.tracking_code || null,
  };
}

export async function getOrderStatusSnapshot(orderCode: string) {
  const admin = createAdminClient();
  const normalizedCode = orderCode.trim();

  if (!normalizedCode) {
    throw new Error("orderCode khong duoc de trong.");
  }

  const { data: order, error: orderError } = await admin
    .schema("sales")
    .from("sales_order")
    .select("order_id, order_code, order_status, payment_status")
    .eq("order_code", normalizedCode)
    .maybeSingle();

  if (orderError) {
    throw new Error(orderError.message);
  }

  if (!order) {
    throw new Error(`Khong tim thay don hang voi ma ${normalizedCode}.`);
  }

  const orderId = Number(order.order_id);

  const { data: latestPayment, error: paymentError } = await admin
    .schema("sales")
    .from("payment")
    .select("payment_id, payment_status, transaction_code, amount")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  const { data: shipping, error: shippingError } = await admin
    .schema("sales")
    .from("shipping")
    .select(
      "shipping_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at",
    )
    .eq("order_id", orderId)
    .maybeSingle();

  if (shippingError) {
    throw new Error(shippingError.message);
  }

  let latestRefund: RefundRow | null = null;

  if (latestPayment?.payment_id) {
    const { data: refund, error: refundError } = await admin
      .schema("sales")
      .from("refund")
      .select("refund_id, refund_status")
      .eq("payment_id", Number(latestPayment.payment_id))
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (refundError) {
      throw new Error(refundError.message);
    }

    latestRefund = (refund as RefundRow | null) ?? null;
  }

  const { data: latestReturnRequest, error: returnError } = await admin
    .schema("sales")
    .from("return_request")
    .select("return_id, return_status, requested_at, approved_at, completed_at")
    .eq("order_id", orderId)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (returnError) {
    throw new Error(returnError.message);
  }

  return {
    order: order as OrderRow,
    latestPayment: (latestPayment as PaymentRow | null) ?? null,
    shipping: (shipping as ShippingRow | null) ?? null,
    latestRefund,
    latestReturnRequest: (latestReturnRequest as ReturnRow | null) ?? null,
  } satisfies OrderStatusSnapshot;
}

export async function updateOrderStatuses(
  input: OrderStatusUpdateInput,
): Promise<OrderStatusUpdateResult> {
  const admin = createAdminClient();
  const before = await getOrderStatusSnapshot(input.orderCode);
  const plan = deriveStatusPlan(before, input);
  const now = new Date().toISOString();
  const orderId = Number(before.order.order_id);

  const { error: orderError } = await admin
    .schema("sales")
    .from("sales_order")
    .update({
      order_status: plan.orderStatus,
      payment_status: plan.paymentStatus ?? before.order.payment_status,
      updated_at: now,
    })
    .eq("order_id", orderId);

  if (orderError) {
    throw new Error(orderError.message);
  }

  if (before.latestPayment?.payment_id && plan.paymentStatus) {
    const paymentPayload: Record<string, string | number | null> = {
      payment_status: plan.paymentStatus,
      updated_at: now,
    };

    if (plan.paymentStatus === "PAID" && !before.latestPayment.transaction_code) {
      paymentPayload.transaction_code = `TEST-${before.order.order_code}`;
    }

    if (plan.paymentStatus === "PAID") {
      paymentPayload.paid_at = now;
    }

    const { error: paymentError } = await admin
      .schema("sales")
      .from("payment")
      .update(paymentPayload)
      .eq("payment_id", Number(before.latestPayment.payment_id));

    if (paymentError) {
      throw new Error(paymentError.message);
    }
  }

  if (before.shipping?.shipping_id && plan.shippingStatus) {
    const shippingPayload: Record<string, string | null> = {
      shipping_status: plan.shippingStatus,
      shipping_provider: plan.shippingProvider,
      tracking_code: plan.trackingCode,
      updated_at: now,
    };

    if (plan.shippingStatus === "SHIPPING") {
      shippingPayload.shipped_at = before.shipping.shipped_at ?? now;
      shippingPayload.delivered_at = null;
    } else if (plan.shippingStatus === "DELIVERED") {
      shippingPayload.shipped_at = before.shipping.shipped_at ?? now;
      shippingPayload.delivered_at = before.shipping.delivered_at ?? now;
    } else if (plan.shippingStatus === "RETURNED") {
      shippingPayload.shipped_at = before.shipping.shipped_at ?? now;
      shippingPayload.delivered_at = before.shipping.delivered_at ?? now;
    } else {
      shippingPayload.shipped_at = null;
      shippingPayload.delivered_at = null;
    }

    const { error: shippingError } = await admin
      .schema("sales")
      .from("shipping")
      .update(shippingPayload)
      .eq("shipping_id", Number(before.shipping.shipping_id));

    if (shippingError) {
      throw new Error(shippingError.message);
    }
  }

  if (before.latestReturnRequest?.return_id && plan.returnStatus) {
    const returnPayload: Record<string, string | null> = {
      return_status: plan.returnStatus,
      updated_at: now,
    };

    if (plan.returnStatus === "APPROVED") {
      returnPayload.approved_at = before.latestReturnRequest.approved_at ?? now;
    }

    if (plan.returnStatus === "COMPLETED") {
      returnPayload.approved_at = before.latestReturnRequest.approved_at ?? now;
      returnPayload.completed_at = before.latestReturnRequest.completed_at ?? now;
    }

    if (plan.returnStatus === "REQUESTED" || plan.returnStatus === "CANCELLED") {
      returnPayload.completed_at = null;
    }

    const { error: returnUpdateError } = await admin
      .schema("sales")
      .from("return_request")
      .update(returnPayload)
      .eq("return_id", Number(before.latestReturnRequest.return_id));

    if (returnUpdateError) {
      throw new Error(returnUpdateError.message);
    }
  }

  if (before.latestRefund?.refund_id && plan.refundStatus) {
    const refundPayload: Record<string, string | null> = {
      refund_status: plan.refundStatus,
      updated_at: now,
    };

    if (plan.refundStatus === "COMPLETED") {
      refundPayload.refunded_at = now;
    }

    const { error: refundError } = await admin
      .schema("sales")
      .from("refund")
      .update(refundPayload)
      .eq("refund_id", Number(before.latestRefund.refund_id));

    if (refundError) {
      throw new Error(refundError.message);
    }
  }

  const after = await getOrderStatusSnapshot(input.orderCode);

  return {
    before,
    after,
    plan,
  };
}
