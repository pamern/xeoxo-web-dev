import { z } from "zod";
import { parseAuthIdentifier } from "@/lib/auth-identifier";

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export const cancelAppointmentSchema = z.object({
  contact: z
    .preprocess(normalizeOptionalText, z.string().optional())
    .refine(
      (value) => value === undefined || parseAuthIdentifier(value) !== null,
      "SĐT hoặc email không hợp lệ.",
    ),
  cancel_reason: z
    .preprocess(
      normalizeOptionalText,
      z.string().max(500, "Lý do hủy quá dài.").optional(),
    ),
});

export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
