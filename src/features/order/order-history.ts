import type { AccountOrder } from "@/types/account-order.types";

export const ORDERS_PAGE_SIZE = 5;

export type OrderHistoryFilter =
  | "all"
  | "shipping"
  | "completed"
  | "cancelled"
  | "returned";

export type OrderStatusPresentation = {
  filter: Exclude<OrderHistoryFilter, "all">;
  label: string;
  tone: "default" | "shipping" | "completed" | "cancelled" | "returned";
};

export type OrderActionPresentation = {
  href: string;
  label: string;
  variant: "primary" | "secondary";
};

export const ORDER_HISTORY_FILTERS: Array<{
  label: string;
  value: OrderHistoryFilter;
}> = [
  { label: "Tất cả", value: "all" },
  { label: "Đang vận chuyển", value: "shipping" },
  { label: "Hoàn thành", value: "completed" },
  { label: "Đã hủy", value: "cancelled" },
  { label: "Đã hoàn trả", value: "returned" },
];

function isPaidPaymentStatus(status: string) {
  const normalized = status.trim().toUpperCase();

  return [
    "PAID",
    "CAPTURED",
    "SETTLED",
    "SUCCESS",
    "COMPLETED",
    "PARTIALLY_PAID",
  ].includes(normalized);
}

export function isOrderHistoryFilter(
  value: string | undefined,
): value is OrderHistoryFilter {
  return ["all", "shipping", "completed", "cancelled", "returned"].includes(
    value ?? "",
  );
}

export function getOrderStatusPresentation(status: string): OrderStatusPresentation {
  const normalized = status.trim().toUpperCase();

  if (normalized === "COMPLETED") {
    return { filter: "completed", label: "Giao hàng thành công", tone: "completed" };
  }

  if (normalized === "CANCELLED") {
    return { filter: "cancelled", label: "Đã hủy", tone: "cancelled" };
  }

  if (normalized === "RETURNED") {
    return { filter: "returned", label: "Đã hoàn trả", tone: "returned" };
  }

  if (normalized === "PENDING") {
    return { filter: "shipping", label: "Chờ xác nhận", tone: "shipping" };
  }

  if (normalized === "CONFIRMED") {
    return { filter: "shipping", label: "Đã xác nhận", tone: "shipping" };
  }

  if (normalized === "PACKING") {
    return { filter: "shipping", label: "Đang chuẩn bị hàng", tone: "shipping" };
  }

  if (normalized === "SHIPPING") {
    return { filter: "shipping", label: "Đang giao hàng", tone: "shipping" };
  }

  return {
    filter: "shipping",
    label: status,
    tone: "shipping",
  };
}

export function filterOrdersByStatus(
  orders: AccountOrder[],
  filter: OrderHistoryFilter,
) {
  if (filter === "all") {
    return orders;
  }

  return orders.filter(
    (order) => getOrderStatusPresentation(order.order_status).filter === filter,
  );
}

const KNOWN_TERMINAL_STATUSES = ["COMPLETED", "CANCELLED", "RETURNED"];

/**
 * Order statuses that satisfy each history filter at the database level.
 * "shipping" has no fixed status list: it is every status that isn't one of
 * the terminal statuses above (mirrors the fallback branch of
 * getOrderStatusPresentation, which buckets unknown statuses into "shipping").
 */
export function getOrderStatusesForFilter(
  filter: OrderHistoryFilter,
): { in?: string[]; notIn?: string[] } | null {
  if (filter === "all") {
    return null;
  }

  if (filter === "completed") {
    return { in: ["COMPLETED"] };
  }

  if (filter === "cancelled") {
    return { in: ["CANCELLED"] };
  }

  if (filter === "returned") {
    return { in: ["RETURNED"] };
  }

  return { notIn: KNOWN_TERMINAL_STATUSES };
}

export function getOrderActions(
  order: AccountOrder,
  routes: {
    customerPolicy: string;
    paymentPolicy: string;
    returnPolicy: string;
    shippingPolicy: string;
    product: (slug: string) => string;
    orderDetail: (id: string) => string;
  },
): OrderActionPresentation[] {
  const status = getOrderStatusPresentation(order.order_status).filter;
  const firstProductSlug = order.items.find((item) => item.product_slug)?.product_slug;
  const reviewableItem = order.items.find(
    (item) => !item.has_review && Boolean(item.product_slug),
  );
  const isPaid = isPaidPaymentStatus(order.payment_status);

  if (status === "completed") {
    const actions: OrderActionPresentation[] = [];

    if (firstProductSlug) {
      actions.push({
        href: routes.product(firstProductSlug),
        label: "Mua lại",
        variant: "primary",
      });
    }

    if (reviewableItem?.product_slug) {
      actions.push({
        href: routes.product(reviewableItem.product_slug),
        label: "Đánh giá",
        variant: "secondary",
      });
    } else {
      actions.push({
        href: "#",
        label: "Xem đánh giá",
        variant: "secondary",
      });
    }

    return actions;
  }

  if (status === "shipping") {
    return [
      {
        href: routes.orderDetail(order.order_id.toString()),
        label: "Theo dõi đơn",
        variant: "secondary",
      },
    ];
  }

  if (status === "cancelled") {
    const actions: OrderActionPresentation[] = [];

    if (firstProductSlug) {
      actions.push({
        href: routes.product(firstProductSlug),
        label: "Mua lại",
        variant: "primary",
      });
    }

    actions.push({
      href: isPaid ? routes.paymentPolicy : routes.orderDetail(order.order_id.toString()),
      label: isPaid ? "Xem thông tin hoàn tiền" : "Xem chi tiết đơn hủy",
      variant: "secondary",
    });

    return actions;
  }

  if (status === "returned") {
    const actions: OrderActionPresentation[] = [];

    if (firstProductSlug) {
      actions.push({
        href: routes.product(firstProductSlug),
        label: "Mua lại",
        variant: "primary",
      });
    }

    actions.push({
      href: routes.orderDetail(order.order_id.toString()),
      label: "Xem chi tiết đơn hoàn trả",
      variant: "secondary",
    });

    return actions;
  }

  return [];
}
