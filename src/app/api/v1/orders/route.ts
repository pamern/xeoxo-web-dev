import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import { createCheckoutOrder } from "@/features/checkout/checkout-server.service";
import { getCustomerOrdersByCustomerId } from "@/features/order/account-order.service";
import {
  filterOrdersByStatus,
  isOrderHistoryFilter,
} from "@/features/order/order-history";

export async function GET(request: Request) {
  try {
    const customerId = await getCurrentCustomerId();
    if (!customerId) {
      return fail("Bạn cần đăng nhập để xem lịch sử đơn hàng.", 401);
    }

    const { searchParams } = new URL(request.url);
    const statusGroupParam = searchParams.get("status_group") ?? "all";
    const statusGroup = isOrderHistoryFilter(statusGroupParam)
      ? statusGroupParam
      : "all";

    const orders = await getCustomerOrdersByCustomerId(customerId);
    const filteredOrders = filterOrdersByStatus(orders, statusGroup);

    return ok(filteredOrders, "Lấy lịch sử đơn hàng thành công.");
  } catch (error) {
    console.error("[orders/GET]", error);
    return fail(
      "Không thể tải lịch sử đơn hàng.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await createCheckoutOrder(body);

    return ok(order, "Tao don hang thanh cong.", 201);
  } catch (error) {
    console.error("[orders/POST]", error);
    return fail(
      error instanceof Error ? error.message : "Khong the tao don hang.",
      400,
    );
  }
}
