import { fail, ok } from "@/lib/api-response";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { getAuthErrorMessage } from "@/lib/auth-error-message";
import { createClient } from "@/lib/supabase/server";
import { registerPhoneWithoutSms } from "@/features/auth/register-phone.service";
import { registerSchema } from "@/validations/auth/register.schema";

function normalizePath(path?: string) {
  if (!path || !path.startsWith("/")) {
    return "/";
  }

  return path;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const { nextPath, ...rawValues } = payload;
    const parsed = registerSchema.safeParse(rawValues);

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

    if (identifier.type === "phone") {
      await registerPhoneWithoutSms({
        fullName: parsed.data.fullName.trim(),
        phone: identifier.value,
        password: parsed.data.password,
      });

      return ok(
        {
          hasSession: false,
        },
        "Đăng ký tài khoản bằng số điện thoại thành công.",
        201,
      );
    }

    const supabase = await createClient();
    const origin = new URL(request.url).origin;
    const redirectTo = `${origin}/api/v1/auth/callback?next=${encodeURIComponent(
      normalizePath(typeof nextPath === "string" ? nextPath : undefined),
    )}`;

    const { data, error } = await supabase.auth.signUp({
      email: identifier.value,
      password: parsed.data.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: parsed.data.fullName.trim(),
        },
      },
    });

    if (error) {
      throw new Error(getAuthErrorMessage(error, "Đăng ký thất bại."));
    }

    return ok(
      {
        hasSession: Boolean(data.session),
      },
      "Đăng ký tài khoản thành công.",
      201,
    );
  } catch (error) {
    return fail(
      getAuthErrorMessage(error, "Đăng ký thất bại."),
      400,
      error instanceof Error ? error.message : error,
    );
  }
}
