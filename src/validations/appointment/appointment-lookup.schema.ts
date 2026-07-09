import { z } from "zod";
import { parseAuthIdentifier } from "@/lib/auth-identifier";

function normalizeRequiredText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export const appointmentLookupSchema = z.object({
  appointment_id: z
    .preprocess((value) => Number(value),
      z.number().int().positive({ message: "Mã lịch hẹn không hợp lệ." }),
    ),
  contact: z
    .preprocess(normalizeRequiredText, z.string().min(1, "Vui lòng nhập mã lịch hẹn và SĐT/email."))
    .refine(
      (value: string) => parseAuthIdentifier(value) !== null,
      "SĐT hoặc email không hợp lệ.",
    ),
});

export type AppointmentLookupInput = z.infer<typeof appointmentLookupSchema>;
