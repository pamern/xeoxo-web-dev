import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

function deriveCustomerName(user: User) {
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";

  if (fullName.trim()) {
    return fullName.trim();
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "Khách hàng Xéo Xọ";
}

function derivePhone(user: User) {
  const phone =
    typeof user.phone === "string" && user.phone.trim()
      ? user.phone.trim()
      : typeof user.user_metadata?.phone === "string" &&
          user.user_metadata.phone.trim()
        ? user.user_metadata.phone.trim()
        : null;

  return phone;
}

function deriveEmail(user: User) {
  return typeof user.email === "string" && user.email.trim()
    ? user.email.trim()
    : null;
}

export async function syncCustomerProfile(user: User) {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { error: accountError } = await admin
    .schema("iam")
    .from("account")
    .upsert(
      {
        account_id: user.id,
        role: "CUSTOMER",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        onConflict: "account_id",
      },
    );

  if (accountError) {
    throw new Error(accountError.message);
  }

  const email = deriveEmail(user);
  const phone = derivePhone(user);

  const customerPayload = {
    account_id: user.id,
    customer_name: deriveCustomerName(user),
    email,
    phone,
    customer_type: "MEMBER",
    total_spent: 0,
    spent_in_year: 0,
    created_at: now,
    updated_at: now,
  };

  const { data: customer, error: customerError } = await admin
    .schema("iam")
    .from("customer")
    .upsert(customerPayload, {
      onConflict: "account_id",
    })
    .select(
      "customer_id, account_id, customer_name, email, phone, gender, birthday, customer_type, tier_id",
    )
    .single();

  if (customerError) {
    throw new Error(customerError.message);
  }

  return customer;
}
