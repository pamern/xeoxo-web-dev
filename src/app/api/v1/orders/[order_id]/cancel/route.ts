import { fail, ok } from "@/lib/api-response";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import {
  clearGuestOrderCancelOtpCookie,
  hasVerifiedGuestOrderCancelOtp,
} from "@/lib/guest-order-cancel-otp";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import {
  cancelCustomerOrder,
  cancelGuestLookupOrder,
} from "@/features/order/account-order.service";
import { guestOrderCancelSchema } from "@/validations/order/order-cancel-lookup.schema";

const DEMO_PHONE_CANCEL_OTP = "482774";

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

    if (customerId) {
      const result = await cancelCustomerOrder(customerId, orderId);

      if (!result.success) {
        return fail(result.message ?? "Không thể hủy đơn hàng.", 400);
      }

      return ok(null, "Hủy đơn hàng thành công.");
    }

    const rawBody = (await request.json().catch(() => null)) as
      | {
          contact?: string;
          order_code?: string;
          otp_token?: string;
        }
      | null;

    const parsed = guestOrderCancelSchema.safeParse(rawBody ?? {});

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Dữ liệu hủy đơn hàng không hợp lệ.",
        400,
      );
    }

    const identifier = parseAuthIdentifier(parsed.data.contact);
    if (!identifier) {
      return fail("SĐT hoặc email không hợp lệ.", 400);
    }

    if (identifier.type === "email") {
      const isVerified = await hasVerifiedGuestOrderCancelOtp({
        contact: identifier.value,
        orderCode: parsed.data.order_code,
        orderId,
        purpose: "cancel-order",
      });

      if (!isVerified) {
        return fail("Vui lòng xác thực OTP email trước khi hủy đơn hàng.", 403);
      }
    }

    if (
      identifier.type === "phone" &&
      String(parsed.data.otp_token ?? "") !== DEMO_PHONE_CANCEL_OTP
    ) {
      return fail("OTP hủy đơn hàng không hợp lệ.", 403);
    }

    const result = await cancelGuestLookupOrder({
      contact: parsed.data.contact,
      order_code: parsed.data.order_code,
      orderId,
    });

    if (!result.success) {
      return fail(result.message ?? "Không thể hủy đơn hàng.", 400);
    }

    if (identifier.type === "email") {
      await clearGuestOrderCancelOtpCookie();
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
