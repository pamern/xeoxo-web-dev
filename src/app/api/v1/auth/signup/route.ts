import { fail, ok } from "@/lib/api-response";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { getAuthErrorMessage } from "@/lib/auth-error-message";
import { createClient } from "@/lib/supabase/server";
import {
  deleteAuthUserById,
  RegisterCredentialUserError,
  registerCredentialUser,
} from "@/features/auth/register-credential-user.service";
import { registerSchema } from "@/validations/auth/register.schema";

export async function POST(request: Request) {
  let identifierType: "email" | "phone" | undefined;
  let createdUserId: string | undefined;

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const parsed = registerSchema.safeParse(payload);

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

    identifierType = identifier.type;

    const supabase = await createClient();
    const { signInEmail, user } = await registerCredentialUser({
      fullName: parsed.data.fullName.trim(),
      identifier,
      password: parsed.data.password,
    });
    createdUserId = user.id;

    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: parsed.data.password,
    });

    if (error) {
      try {
        await deleteAuthUserById(createdUserId);
      } catch (rollbackError) {
        console.error(
          "[auth/signup] Failed to rollback auth user after sign-in failure.",
          rollbackError,
        );
      }

      throw error;
    }

    return ok(
      {
        hasSession: true,
      },
      "Đăng ký tài khoản thành công.",
      201,
    );
  } catch (error) {
    if (error instanceof RegisterCredentialUserError) {
      return fail(error.message, error.status);
    }

    return fail(
      getAuthErrorMessage(error, "Đăng ký thất bại.", {
        identifierType,
      }),
      400,
      error instanceof Error ? error.message : error,
    );
  }
}
