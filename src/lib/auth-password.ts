export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRule = {
  id: "length" | "lowercase" | "uppercase" | "number" | "special";
  label: string;
  passed: boolean;
};

export function getPasswordRules(password: string): PasswordRule[] {
  return [
    {
      id: "length",
      label: `Ít nhất ${PASSWORD_MIN_LENGTH} ký tự`,
      passed: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      id: "lowercase",
      label: "Có ít nhất 1 chữ thường",
      passed: /[a-z]/.test(password),
    },
    {
      id: "uppercase",
      label: "Có ít nhất 1 chữ hoa",
      passed: /[A-Z]/.test(password),
    },
    {
      id: "number",
      label: "Có ít nhất 1 chữ số",
      passed: /\d/.test(password),
    },
    {
      id: "special",
      label: "Có ít nhất 1 ký tự đặc biệt",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export function getFirstPasswordError(password: string) {
  const unmetRule = getPasswordRules(password).find((rule) => !rule.passed);
  return unmetRule?.label ?? null;
}
