import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { syncCustomerProfile } from "@/features/auth/profile-sync.service";
import type { UpdateCustomerProfileInput } from "@/validations/customer/update-customer-profile.schema";

function toNullable(value: string) {
  return value.trim() ? value.trim() : null;
}

function normalizePhone(value: string) {
  if (!value.trim()) {
    return null;
  }

  const identifier = parseAuthIdentifier(value);
  return identifier?.type === "phone" ? identifier.value : null;
}

export async function ensureCustomerProfile(user: User) {
  return syncCustomerProfile(user);
}

export async function updateCustomerProfileByAccountId(
  accountId: string,
  values: UpdateCustomerProfileInput,
) {
  const admin = createAdminClient();
  const payload = {
    customer_name: toNullable(values.customer_name),
    phone: normalizePhone(values.phone),
    gender: values.gender || null,
    birthday: values.birthday || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin
    .schema("iam")
    .from("customer")
    .update(payload)
    .eq("account_id", accountId)
    .select(
      "customer_id, account_id, customer_name, email, phone, gender, birthday, customer_type, tier_id",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
