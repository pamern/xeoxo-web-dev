import { z } from "zod";
import { parseAuthIdentifier } from "@/lib/auth-identifier";

export const loginSchema = z.object({
  account: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email hoặc số điện thoại.")
    .refine(
      (value) => parseAuthIdentifier(value) !== null,
      "Email hoặc số điện thoại không hợp lệ.",
    ),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export type LoginInput = z.infer<typeof loginSchema>;
