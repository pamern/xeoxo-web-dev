import { z } from "zod";

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
}

function normalizePositiveInteger(
  value: unknown,
  fallback: number,
  max?: number,
) {
  const raw =
    typeof value === "string" || typeof value === "number"
      ? Number(value)
      : NaN;

  if (!Number.isInteger(raw) || raw <= 0) {
    return fallback;
  }

  if (typeof max === "number" && raw > max) {
    return max;
  }

  return raw;
}

export const ACCOUNT_APPOINTMENT_STATUS_VALUES = [
  "all",
  "upcoming",
  "completed",
  "cancelled",
] as const;

export const accountAppointmentQuerySchema = z.object({
  status_group: z
    .preprocess(normalizeOptionalText, z.enum(ACCOUNT_APPOINTMENT_STATUS_VALUES))
    .optional()
    .default("all"),
  page: z
    .preprocess((value) => normalizePositiveInteger(value, 1), z.number().int().positive())
    .default(1),
  limit: z
    .preprocess((value) => normalizePositiveInteger(value, 20, 50), z.number().int().positive().max(50))
    .default(20),
});

export type AccountAppointmentQueryInput = z.infer<
  typeof accountAppointmentQuerySchema
>;
