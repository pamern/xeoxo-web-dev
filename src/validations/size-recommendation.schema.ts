import {
  getMeasurementFields,
  type MeasurementComponentType,
  type MeasurementKey,
  type MeasurementValues,
} from "@/features/size-recommendation/size-recommendation";
import type { Gender } from "@/types/product.types";

export type MeasurementErrors = Partial<Record<MeasurementKey, string>>;

export function validateMeasurementField(
  key: MeasurementKey,
  rawValue: string,
  gender: Gender,
  componentType?: MeasurementComponentType,
  validateRequired = true,
): string | undefined {
  const field = getMeasurementFields(gender, componentType).find(
    (item) => item.key === key,
  );
  if (!field) return undefined;

  const raw = rawValue.trim();
  if (!raw) {
    return validateRequired && field.required
      ? `Vui lòng nhập ${field.label.toLowerCase()}`
      : undefined;
  }

  if (!/^\d+(?:[.,]\d+)?$/.test(raw)) {
    return "Vui lòng nhập số hợp lệ";
  }
  const value = Number(raw.replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) return "Vui lòng nhập số hợp lệ";
  return undefined;
}

export function validateMeasurements(
  values: MeasurementValues,
  gender: Gender,
  componentType?: MeasurementComponentType,
): MeasurementErrors {
  const errors: MeasurementErrors = {};
  for (const field of getMeasurementFields(gender, componentType)) {
    const error = validateMeasurementField(
      field.key,
      values[field.key],
      gender,
      componentType,
    );
    if (error) errors[field.key] = error;
  }
  return errors;
}
