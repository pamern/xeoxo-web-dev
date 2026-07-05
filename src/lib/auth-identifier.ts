const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGIT_PATTERN = /^\d+$/;
const VIETNAM_MOBILE_PREFIX_PATTERN = /^[35789]\d{8}$/;

export type AuthIdentifier =
  | { type: "email"; value: string }
  | { type: "phone"; value: string };

function normalizePhoneNumber(input: string) {
  const trimmed = input.trim();
  const sanitized = trimmed.startsWith("+")
    ? `+${trimmed.slice(1).replace(/\D/g, "")}`
    : trimmed.replace(/\D/g, "");

  if (!sanitized) {
    return null;
  }

  let normalized = sanitized;

  if (normalized.startsWith("00")) {
    normalized = `+${normalized.slice(2)}`;
  }

  if (normalized.startsWith("+840")) {
    normalized = `+84${normalized.slice(4)}`;
  }

  if (normalized.startsWith("840")) {
    normalized = `+84${normalized.slice(3)}`;
  }

  if (normalized.startsWith("+")) {
    const digits = normalized.slice(1);

    if (
      !PHONE_DIGIT_PATTERN.test(digits) ||
      digits.length < 8 ||
      digits.length > 15
    ) {
      return null;
    }

    return `+${digits}`;
  }

  if (!PHONE_DIGIT_PATTERN.test(normalized)) {
    return null;
  }

  if (
    normalized.startsWith("0") &&
    normalized.length >= 9 &&
    normalized.length <= 11
  ) {
    return `+84${normalized.slice(1)}`;
  }

  if (
    normalized.startsWith("84") &&
    normalized.length >= 10 &&
    normalized.length <= 12
  ) {
    return `+${normalized}`;
  }

  if (VIETNAM_MOBILE_PREFIX_PATTERN.test(normalized)) {
    return `+84${normalized}`;
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
