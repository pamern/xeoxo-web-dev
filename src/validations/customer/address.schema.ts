import { z } from "zod";
import { parseAuthIdentifier } from "@/lib/auth-identifier";

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true";
  }

  return false;
}

function normalizeProvinceId(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return Number(value);
  }

  return value;
}

function isValidPhone(value: string) {
  return parseAuthIdentifier(value)?.type === "phone";
}

export const customerAddressSchema = z.object({
  recipient_name: z.preprocess(
    normalizeText,
    z.string().min(2, "Tên người nhận phải có ít nhất 2 ký tự."),
  ),
  recipient_phone: z.preprocess(
    normalizeText,
    z.string().refine(isValidPhone, "Số điện thoại không hợp lệ."),
  ),
  province_id: z.preprocess(
    normalizeProvinceId,
    z
      .number({
        invalid_type_error: "Vui lòng chọn tỉnh / thành phố.",
      })
      .int("Tỉnh / thành phố không hợp lệ.")
      .positive("Vui lòng chọn tỉnh / thành phố."),
  ),
  district_name: z.preprocess(
    normalizeText,
    z.string().min(2, "Vui lòng nhập phường / xã."),
  ),
  address_detail: z.preprocess(
    normalizeText,
    z.string().min(5, "Vui lòng nhập địa chỉ cụ thể."),
  ),
  is_default: z.preprocess(normalizeBoolean, z.boolean()).optional().default(false),
});

export type CustomerAddressInput = z.infer<typeof customerAddressSchema>;
