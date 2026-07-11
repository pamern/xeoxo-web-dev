import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import { createCheckoutOrder } from "@/features/checkout/checkout-server.service";
import { getCustomerOrdersByCustomerId } from "@/features/order/account-order.service";
import {
  isOrderHistoryFilter,
  ORDERS_PAGE_SIZE,
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

    const offsetParam = Number(searchParams.get("offset") ?? "0");
    const limitParam = Number(searchParams.get("limit") ?? ORDERS_PAGE_SIZE);
    const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : ORDERS_PAGE_SIZE;

    const { orders, total } = await getCustomerOrdersByCustomerId(customerId, {
      statusGroup,
      offset,
      limit,
    });

    return ok({ orders, total, offset, limit }, "Lấy lịch sử đơn hàng thành công.");
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
