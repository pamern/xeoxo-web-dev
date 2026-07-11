import { z } from "zod";
import { parseAuthIdentifier } from "@/lib/auth-identifier";

export const createAppointmentSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự.")
    .max(200, "Họ tên không được vượt quá 200 ký tự."),
  phone: z
    .string()
    .trim()
    .refine((value) => parseAuthIdentifier(value)?.type === "phone", {
      message: "Số điện thoại không hợp lệ.",
    }),
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ.")
    .optional()
    .or(z.literal("")),
  branch_id: z.number().int().positive("Chi nhánh không hợp lệ."),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày hẹn không hợp lệ (YYYY-MM-DD)."),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Giờ hẹn không hợp lệ (HH:MM)."),
  product_line_id: z.number().int().positive().optional(),
  customer_note: z.string().trim().max(500).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
