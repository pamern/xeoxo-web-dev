const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGIT_PATTERN = /^\d+$/;

export type AuthIdentifier =
  | { type: "email"; value: string }
  | { type: "phone"; value: string };

function normalizePhoneNumber(input: string) {
  const sanitized = input.replace(/[\s().-]/g, "");

  if (!sanitized) {
    return null;
  }

  if (sanitized.startsWith("+")) {
    const digits = sanitized.slice(1);

    if (
      !PHONE_DIGIT_PATTERN.test(digits) ||
      digits.length < 8 ||
      digits.length > 15
    ) {
      return null;
    }

    return `+${digits}`;
  }

  if (!PHONE_DIGIT_PATTERN.test(sanitized)) {
    return null;
  }

  if (
    sanitized.startsWith("0") &&
    sanitized.length >= 9 &&
    sanitized.length <= 11
  ) {
    return `+84${sanitized.slice(1)}`;
  }

  if (
    sanitized.startsWith("84") &&
    sanitized.length >= 10 &&
    sanitized.length <= 12
  ) {
    return `+${sanitized}`;
  }

  return null;
}

export function parseAuthIdentifier(account: string): AuthIdentifier | null {
  const trimmed = account.trim();

  if (!trimmed) {
    return null;
  }

  const normalizedEmail = trimmed.toLowerCase();
  if (EMAIL_PATTERN.test(normalizedEmail)) {
    return {
      type: "email",
      value: normalizedEmail,
    };
  }

  const normalizedPhone = normalizePhoneNumber(trimmed);
  if (normalizedPhone) {
    return {
      type: "phone",
      value: normalizedPhone,
    };
  }

  return null;
}
