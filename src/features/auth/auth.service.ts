import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isPhoneAuthAliasEmail } from "@/lib/auth-phone-alias";
import { createAdminClient } from "@/lib/supabase/admin";

export function isIamSchemaUnavailable(error: unknown) {
  return (
    error instanceof Error && error.message.includes("Invalid schema: iam")
  );
}

export function isAuthSessionMissing(error: unknown) {
  return (
    error instanceof Error && error.message.includes("Auth session missing")
  );
}

export function isRefreshTokenNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "refresh_token_not_found"
  );
}

export function isAuthUserMissing(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("User from sub claim in JWT does not exist")
  );
}

export async function getAuthenticatedUser(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (
      isAuthSessionMissing(error) ||
      isAuthUserMissing(error) ||
      isRefreshTokenNotFound(error)
    ) {
      return null;
    }

    throw new Error(error.message);
  }

  return data.user;
}

export function mapAuthUser(user: User | null) {
  if (!user) {
    return null;
  }

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  return {
    id: user.id,
    email: isPhoneAuthAliasEmail(user.email) ? null : user.email ?? null,
    fullName,
  };
}

export async function getCustomerProfileByAccountId(accountId: string) {
  const admin = createAdminClient();

  try {
    const { data, error } = await admin
      .schema("iam")
      .from("customer")
      .select(
        "customer_id, account_id, customer_name, email, phone, gender, birthday, customer_type, tier_id",
      )
      .eq("account_id", accountId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    if (isIamSchemaUnavailable(error)) {
      return null;
    }

    throw error;
  }
}
