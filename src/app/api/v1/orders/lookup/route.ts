import { fail, ok } from "@/lib/api-response";
import { lookupOrderByContact } from "@/features/order/order-lookup.service";
import { orderLookupSchema } from "@/validations/order/order-lookup.schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawInput = {
      contact: searchParams.get("contact") ?? "",
      order_code: searchParams.get("order_code") ?? "",
    };

    if (!rawInput.order_code || !rawInput.contact) {
      return fail("Vui lòng nhập mã đơn hàng và SĐT/email.", 400);
    }

    const parsed = orderLookupSchema.safeParse(rawInput);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Dữ liệu tra cứu không hợp lệ.",
        400,
      );
    }

    const order = await lookupOrderByContact(parsed.data);

    if (!order) {
      return fail("Không tìm thấy đơn hàng.", 404);
    }

    return ok(order, "Tra cứu đơn hàng thành công.");
  } catch (error) {
    console.error("[orders/lookup/GET]", error);
    return fail(
      "Không thể tra cứu đơn hàng lúc này.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
