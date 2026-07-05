import { z } from "zod";
import { parseAuthIdentifier } from "@/lib/auth-identifier";

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidOptionalPhone(value: string) {
  if (!value) {
    return true;
  }

  return parseAuthIdentifier(value)?.type === "phone";
}

export const updateCustomerProfileSchema = z.object({
  customer_name: z
    .preprocess(normalizeOptionalText, z.string())
    .refine((value) => value.length === 0 || value.length >= 2, {
      message: "Họ và tên phải có ít nhất 2 ký tự.",
    }),
  email: z.preprocess(
    normalizeOptionalText,
    z
      .string()
      .refine(
        (value) => value.length === 0 || z.string().email().safeParse(value).success,
        "Email không hợp lệ.",
      ),
  ),
  phone: z
    .preprocess(normalizeOptionalText, z.string())
    .refine(isValidOptionalPhone, "Số điện thoại không hợp lệ."),
  gender: z.enum(["MALE", "FEMALE", "OTHER", ""]).optional().default(""),
  birthday: z
    .preprocess(normalizeOptionalText, z.string())
    .refine(
      (value) =>
        value.length === 0 ||
        /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Ngày sinh phải đúng định dạng YYYY-MM-DD.",
    ),
});

export type UpdateCustomerProfileInput = z.infer<
  typeof updateCustomerProfileSchema
>;
