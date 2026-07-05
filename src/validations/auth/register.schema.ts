import { z } from "zod";

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
      .min(1, "Vui lòng nhập email của bạn.")
      .email("Email không hợp lệ."),
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng nhập lại mật khẩu."),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Mật khẩu nhập lại không khớp.",
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
