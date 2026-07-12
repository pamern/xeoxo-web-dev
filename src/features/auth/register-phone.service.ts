import { createAdminClient } from "@/lib/supabase/admin";

type RegisterPhoneInput = {
  fullName: string;
  phone: string;
  password: string;
};

export async function registerPhoneWithoutSms({
  fullName,
  phone,
  password,
}: RegisterPhoneInput) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    phone,
    password,
    phone_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}
