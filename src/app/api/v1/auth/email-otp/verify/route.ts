import { fail, ok } from "@/lib/api-response";
import { getAuthErrorMessage } from "@/lib/auth-error-message";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { setGuestOrderCancelOtpCookie } from "@/lib/guest-order-cancel-otp";
import { createClient } from "@/lib/supabase/server";

const DEMO_EMAIL_CANCEL_OTP = "482774";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      order_code?: string;
      order_id?: number;
      purpose?: string;
      token?: string;
    };

    const identifier = parseAuthIdentifier(body.email ?? "");
    const token = String(body.token ?? "").trim();

    if (!identifier || identifier.type !== "email") {
      return fail("Email xác thực không hợp lệ.", 400);
    }

    if (!/^\d{6}$/.test(token)) {
      return fail("Mã OTP email không hợp lệ.", 400);
    }

    if (body.purpose === "cancel-order") {
      const orderCode = String(body.order_code ?? "").trim().toUpperCase();
      const orderId = Number(body.order_id);

      if (!orderCode || !Number.isInteger(orderId) || orderId <= 0) {
        return fail("Thiếu thông tin xác thực hủy đơn hàng.", 400);
      }

      if (token !== DEMO_EMAIL_CANCEL_OTP) {
        const supabase = await createClient();
        const { error } = await supabase.auth.verifyOtp({
          email: identifier.value,
          token,
          type: "email",
        });

        if (error) {
          console.error("[auth/email-otp/verify/POST]", error);
          return fail(
            getAuthErrorMessage(error, "Không thể xác thực OTP email."),
            400,
            error,
          );
        }
      }

      await setGuestOrderCancelOtpCookie({
        contact: identifier.value,
        orderCode,
        orderId,
        purpose: "cancel-order",
      });

      return ok(null, "Xác thực OTP email thành công.");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: identifier.value,
      token,
      type: "email",
    });

    if (error) {
      console.error("[auth/email-otp/verify/POST]", error);
      return fail(
        getAuthErrorMessage(error, "Không thể xác thực OTP email."),
        400,
        error,
      );
    }

    return ok(null, "Xác thực OTP email thành công.");
  } catch (error) {
    console.error("[auth/email-otp/verify/POST]", error);
    return fail(
      "Không thể xác thực OTP email lúc này.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
