import { fail, ok } from "@/lib/api-response";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import {
  getAuthErrorMessage,
  isInvalidCredentialsAuthError,
} from "@/lib/auth-error-message";
import { getPhoneAuthAliasEmail } from "@/lib/auth-phone-alias";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/validations/auth/login.schema";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
        parsed.error.flatten(),
      );
    }

    const identifier = parseAuthIdentifier(parsed.data.account);

    if (!identifier) {
      return fail("Email hoặc số điện thoại không hợp lệ.", 422);
    }

    const supabase = await createClient();
    const credentials =
      identifier.type === "email"
        ? { email: identifier.value, password: parsed.data.password }
        : {
            email: getPhoneAuthAliasEmail(identifier.value),
            password: parsed.data.password,
          };

    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      throw error;
    }

    return ok(
      {
        authenticated: true,
      },
      "Đăng nhập thành công.",
    );
  } catch (error) {
    return fail(
      getAuthErrorMessage(error, "Đăng nhập thất bại."),
      isInvalidCredentialsAuthError(error) ? 401 : 400,
      error instanceof Error ? error.message : error,
    );
  }
}
