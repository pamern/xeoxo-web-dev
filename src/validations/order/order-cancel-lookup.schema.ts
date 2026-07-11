import { z } from "zod";
import { parseAuthIdentifier } from "@/lib/auth-identifier";

function normalizeRequiredText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export const guestOrderCancelSchema = z.object({
  contact: z
    .preprocess(
      normalizeRequiredText,
      z.string().min(1, "Vui lòng nhập SĐT hoặc email."),
    )
    .refine(
      (value: string) => parseAuthIdentifier(value) !== null,
      "SĐT hoặc email không hợp lệ.",
    ),
  order_code: z
    .preprocess(
      normalizeRequiredText,
      z.string().min(1, "Vui lòng nhập mã đơn hàng."),
    )
    .transform((value: string) => value.toUpperCase()),
  otp_token: z.preprocess(normalizeRequiredText, z.string().optional()),
});

export type GuestOrderCancelInput = z.infer<typeof guestOrderCancelSchema>;
