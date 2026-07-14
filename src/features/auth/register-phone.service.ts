import { createAdminClient } from "@/lib/supabase/admin";
import { getPhoneAuthAliasEmail } from "@/lib/auth-phone-alias";

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
    email: getPhoneAuthAliasEmail(phone),
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
      auth_identifier_type: "phone",
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}
