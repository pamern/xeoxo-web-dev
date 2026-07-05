import { z } from "zod";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { getFirstPasswordError } from "@/lib/auth-password";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập họ và tên.")
      .min(2, "Họ và tên phải có ít nhất 2 ký tự."),
    account: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email hoặc số điện thoại.")
      .refine(
        (value) => parseAuthIdentifier(value) !== null,
        "Email hoặc số điện thoại không hợp lệ.",
      ),
    password: z.string().min(1, "Vui lòng nhập mật khẩu."),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu."),
  })
  .superRefine((values, ctx) => {
    const passwordError = getFirstPasswordError(values.password);

    if (passwordError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: passwordError,
      });
    }

    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Mật khẩu nhập lại không khớp.",
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
