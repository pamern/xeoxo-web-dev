import { z } from "zod";

export const createAppointmentSchema = z.object({
  full_name: z.string().min(1, "Ho ten khong duoc de trong.").max(200),
  phone: z.string().min(8, "So dien thoai khong hop le.").max(20),
  email: z.string().email("Email khong hop le.").optional().or(z.literal("")),
  branch_id: z.number().int().positive("Chi nhanh khong hop le."),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay hen khong hop le (YYYY-MM-DD)."),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Gio hen khong hop le (HH:MM)."),
  product_line_id: z.number().int().positive().optional(),
  customer_note: z.string().max(500).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
