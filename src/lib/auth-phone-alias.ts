const PHONE_AUTH_EMAIL_DOMAIN = "phone-auth.xeoxo.local";

function normalizePhoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

export function getPhoneAuthAliasEmail(phone: string) {
  const digits = normalizePhoneDigits(phone);
  return `phone.${digits}@${PHONE_AUTH_EMAIL_DOMAIN}`;
}

export function isPhoneAuthAliasEmail(email: string | null | undefined) {
  if (typeof email !== "string") {
    return false;
  }

  return email.trim().toLowerCase().endsWith(`@${PHONE_AUTH_EMAIL_DOMAIN}`);
}
