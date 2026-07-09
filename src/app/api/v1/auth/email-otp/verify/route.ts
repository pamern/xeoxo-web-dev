import { fail, ok } from "@/lib/api-response";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
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

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: identifier.value,
      token,
      type: "email",
    });

    if (error) {
      console.error("[auth/email-otp/verify/POST]", error);
      return fail(
        error.message || "Không thể xác thực OTP email.",
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
