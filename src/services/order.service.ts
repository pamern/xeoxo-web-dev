import { API } from "@/constants/routes";
import { getApiErrorMessage, type ApiResponse } from "@/types/api.types";
import type { AccountOrder } from "@/types/account-order.types";
import type { OrderHistoryFilter } from "@/features/order/order-history";
import type {
  OrderLookupDto,
  OrderLookupValues,
} from "@/types/order-lookup.types";
import type {
  CheckoutPreviewDto,
  CheckoutPreviewValues,
  CreatedOrderDto,
  CreateOrderValues,
} from "@/types/order.types";

async function readApi<T>(response: Response, fallback: string) {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(getApiErrorMessage(payload, fallback));
  }

  return payload.data;
}

export const orderService = {
  async getOrders(statusGroup: OrderHistoryFilter) {
    const query =
      statusGroup === "all"
        ? API.ORDERS
        : `${API.ORDERS}?status_group=${encodeURIComponent(statusGroup)}`;
    const response = await fetch(query, {
      credentials: "include",
    });

    return readApi<AccountOrder[]>(response, "Không thể tải lịch sử đơn hàng.");
  },

  async lookupOrder(values: OrderLookupValues) {
    const query = new URLSearchParams({
      contact: values.contact,
      order_code: values.order_code,
    });

    const response = await fetch(`${API.ORDER_LOOKUP}?${query.toString()}`, {
      credentials: "include",
    });

    return readApi<OrderLookupDto>(response, "Không thể tra cứu đơn hàng.");
  },

  async previewCheckout(values: CheckoutPreviewValues) {
    const response = await fetch(API.CHECKOUT_PREVIEW, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    return readApi<CheckoutPreviewDto>(
      response,
      "Khong the tinh tien thanh toan.",
    );
  },

  async createOrder(values: CreateOrderValues) {
    const response = await fetch(API.ORDERS, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    return readApi<CreatedOrderDto>(response, "Khong the tao don hang.");
  },

  async createPayment(orderId: number) {
    const response = await fetch(API.ORDER_PAYMENTS(orderId), {
      method: "POST",
      credentials: "include",
    });

    return readApi<CreatedOrderDto>(
      response,
      "Khong the tao thanh toan cho don hang.",
    );
  },
};
