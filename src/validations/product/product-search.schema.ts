import { z } from "zod";

function normalizeSearchText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  const nextValue =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value ?? ""), 10);

  if (!Number.isFinite(nextValue) || nextValue <= 0) {
    return fallback;
  }

  return nextValue;
}

export const productSearchSuggestionsQuerySchema = z.object({
  q: z
    .preprocess(
      normalizeSearchText,
      z
        .string()
        .min(2, "Vui lòng nhập ít nhất 2 ký tự để tìm kiếm.")
        .max(100, "Từ khóa tìm kiếm quá dài."),
    ),
  limit: z
    .preprocess((value) => normalizePositiveInteger(value, 4), z.number().int().min(1).max(10))
    .default(4),
});

export const productSearchQuerySchema = z.object({
  q: z
    .preprocess(
      normalizeSearchText,
      z
        .string()
        .min(2, "Vui lòng nhập ít nhất 2 ký tự để tìm kiếm.")
        .max(100, "Từ khóa tìm kiếm quá dài."),
    ),
  page: z
    .preprocess((value) => normalizePositiveInteger(value, 1), z.number().int().min(1))
    .default(1),
  limit: z
    .preprocess((value) => normalizePositiveInteger(value, 20), z.number().int().min(1).max(50))
    .default(20),
});

export type ProductSearchSuggestionsQueryInput = z.infer<
  typeof productSearchSuggestionsQuerySchema
>;
export type ProductSearchQueryInput = z.infer<typeof productSearchQuerySchema>;
