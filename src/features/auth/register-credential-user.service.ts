import type { User } from "@supabase/supabase-js";
import type { AuthIdentifier } from "@/lib/auth-identifier";
import {
  getAuthErrorMessage,
  isDuplicateAuthError,
} from "@/lib/auth-error-message";
import { getPhoneAuthAliasEmail } from "@/lib/auth-phone-alias";
import { createAdminClient } from "@/lib/supabase/admin";

type RegisterCredentialUserInput = {
  fullName: string;
  identifier: AuthIdentifier;
  password: string;
};

type RegisterCredentialUserResult = {
  user: User;
  signInEmail: string;
};

export class RegisterCredentialUserError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "RegisterCredentialUserError";
  }
}

export async function deleteAuthUserById(userId: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function registerCredentialUser({
  fullName,
  identifier,
  password,
}: RegisterCredentialUserInput): Promise<RegisterCredentialUserResult> {
  const admin = createAdminClient();
  const signInEmail =
    identifier.type === "phone"
      ? getPhoneAuthAliasEmail(identifier.value)
      : identifier.value;

  const { data, error } = await admin.auth.admin.createUser({
    email: signInEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      auth_identifier_type: identifier.type,
      ...(identifier.type === "phone" ? { phone: identifier.value } : {}),
    },
  });

  if (error || !data.user) {
    const message = getAuthErrorMessage(error, "Không thể tạo tài khoản.", {
      identifierType: identifier.type,
    });

    throw new RegisterCredentialUserError(
      message,
      isDuplicateAuthError(error) ? 409 : 400,
    );
  }

  return {
    user: data.user,
    signInEmail,
  };
}
