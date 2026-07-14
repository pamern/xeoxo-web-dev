import { fail, ok } from "@/lib/api-response";
import { getAuthErrorMessage } from "@/lib/auth-error-message";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
    };

    const identifier = parseAuthIdentifier(body.email ?? "");

    if (!identifier || identifier.type !== "email") {
      return fail("Email xác thực không hợp lệ.", 400);
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: identifier.value,
    });

    if (error) {
      console.error("[auth/email-otp/send/POST]", error);
      return fail(
        getAuthErrorMessage(error, "Không thể gửi OTP email."),
        400,
        error,
      );
    }

    return ok(null, "Đã gửi OTP email thành công.");
  } catch (error) {
    console.error("[auth/email-otp/send/POST]", error);
    return fail(
      "Không thể gửi OTP email lúc này.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
