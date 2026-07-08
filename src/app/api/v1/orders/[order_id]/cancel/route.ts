import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import { cancelCustomerOrder } from "@/features/order/account-order.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ order_id: string }> },
) {
  try {
    const customerId = await getCurrentCustomerId();
    if (!customerId) {
      return fail("Bạn cần đăng nhập để thực hiện hành động này.", 401);
    }

    const { order_id } = await params;
    const orderId = Number(order_id);

    if (isNaN(orderId)) {
      return fail("Mã đơn hàng không hợp lệ.", 400);
    }

    const result = await cancelCustomerOrder(customerId, orderId);

    if (!result.success) {
      return fail(result.message ?? "Không thể hủy đơn hàng.", 400);
    }

    return ok(null, "Hủy đơn hàng thành công.");
  } catch (error) {
    console.error("[orders/[order_id]/cancel/POST]", error);
    return fail(
      "Không thể hủy đơn hàng.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
