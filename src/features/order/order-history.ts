import type { AccountOrder } from "@/types/account-order.types";

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
  { label: "Hoàn hàng", value: "returned" },
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

  if (["COMPLETED", "DELIVERED", "SUCCESS"].includes(normalized)) {
    return { filter: "completed", label: "Hoàn thành", tone: "completed" };
  }

  if (["CANCELLED", "CANCELED", "FAILED"].includes(normalized)) {
    return { filter: "cancelled", label: "Đã hủy", tone: "cancelled" };
  }

  if (["RETURNED", "RETURNING", "REFUNDED", "RETURN_REQUESTED"].includes(normalized)) {
    return { filter: "returned", label: "Hoàn hàng", tone: "returned" };
  }

  return {
    filter: "shipping",
    label: "Đang vận chuyển",
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

export function getOrderActions(
  order: AccountOrder,
  routes: {
    customerPolicy: string;
    paymentPolicy: string;
    returnPolicy: string;
    shippingPolicy: string;
    product: (slug: string) => string;
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
    }

    actions.push({
      href: routes.returnPolicy,
      label: "Liên hệ đổi hàng",
      variant: "secondary",
    });

    return actions;
  }

  if (status === "shipping") {
    return [
      {
        href: routes.shippingPolicy,
        label: "Theo dõi đơn",
        variant: "secondary",
      },
      {
        href: routes.customerPolicy,
        label: "Liên hệ hỗ trợ",
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
      href: isPaid ? routes.paymentPolicy : routes.customerPolicy,
      label: isPaid ? "Xem thông tin hoàn tiền" : "Xem chi tiết đơn hủy",
      variant: "secondary",
    });

    return actions;
  }

  if (status === "returned") {
    const actions: OrderActionPresentation[] = [
      {
        href: routes.customerPolicy,
        label: "Liên hệ hỗ trợ",
        variant: "secondary",
      },
    ];

    if (firstProductSlug) {
      actions.unshift({
        href: routes.product(firstProductSlug),
        label: "Mua lại",
        variant: "primary",
      });
    }

    return actions;
  }

  return [
    {
      href: routes.customerPolicy,
      label: "Liên hệ hỗ trợ",
      variant: "secondary",
    },
  ];
}
