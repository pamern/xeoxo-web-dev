import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import {
  cancelCustomerOrder,
  cancelLookupOrder,
} from "@/features/order/account-order.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ order_id: string }> },
) {
  try {
    const customerId = await getCurrentCustomerId();
    const { order_id } = await params;
    const orderId = Number(order_id);

    if (isNaN(orderId)) {
      return fail("Mã đơn hàng không hợp lệ.", 400);
    }

    const payload = await request.json().catch(() => null);
    const lookupContact =
      payload && typeof payload.contact === "string"
        ? payload.contact.trim()
        : "";
    const lookupOrderCode =
      payload && typeof payload.order_code === "string"
        ? payload.order_code.trim().toUpperCase()
        : "";

    const result = customerId
      ? await cancelCustomerOrder(customerId, orderId)
      : await cancelLookupOrder(orderId, lookupOrderCode, lookupContact);

    if (!result.success) {
      return fail(result.message ?? "Không thể hủy đơn hàng.", 400);
    }

    return ok(
      {
        order_status: result.order_status ?? "CANCELLED",
        payment_status: result.payment_status ?? null,
        refund_status: result.refund_status ?? null,
      },
      result.message ?? "Hủy đơn hàng thành công.",
    );
  } catch (error) {
    console.error("[orders/[order_id]/cancel/POST]", error);
    return fail(
      "Không thể hủy đơn hàng.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
