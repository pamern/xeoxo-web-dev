import {
  getMeasurementFields,
  type MeasurementComponentType,
  type MeasurementKey,
  type MeasurementValues,
} from "@/features/size-recommendation/size-recommendation";
import type { Gender } from "@/types/product.types";

export type MeasurementErrors = Partial<Record<MeasurementKey, string>>;

const FIELD_NAMES: Record<MeasurementKey, string> = {
  height: "Chiều cao",
  weight: "Cân nặng",
  bust: "Vòng ngực",
  waist: "Vòng eo",
  hip: "Vòng mông",
  shoulder: "Ngang vai",
  neck: "Vòng cổ",
  sleeve: "Dài tay",
  upperArm: "Vòng bắp tay",
};

function getMinMaxLimits(
  key: MeasurementKey,
  gender: Gender,
  componentType?: MeasurementComponentType,
) {
  if (gender === "nam") {
    switch (key) {
      case "height": return { min: 150, max: 200 };
      case "weight": return { min: 45, max: 120 };
      case "bust": return { min: 82, max: 130 };
      case "waist": return { min: 60, max: 110 };
      case "hip": return { min: 82, max: 125 };
      case "shoulder": return { min: 38, max: 60 };
      case "neck": return { min: 33, max: 50 };
      case "sleeve": return { min: 53, max: 75 };
      case "upperArm": return { min: 26, max: 48 };
    }
  } else {
    // female / nu
    switch (key) {
      case "height": return { min: 140, max: 185 };
      case "weight": return { min: 40, max: 100 };
      case "bust": return { min: 72, max: 120 };
      case "waist": return { min: 50, max: 100 };
      case "hip": return { min: 78, max: 125 };
      case "shoulder": return { min: 33, max: 50 };
      case "neck": return { min: 27, max: 42 };
      case "sleeve": return { min: 48, max: 70 };
      case "upperArm": return { min: 21, max: 38 };
    }
  }
  return { min: 0, max: 999 };
}

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

  const rawTrimmed = rawValue.trim();

  if (!rawTrimmed) {
    return validateRequired && field.required
      ? `Vui lòng nhập ${FIELD_NAMES[key].toLowerCase()}.`
      : undefined;
  }

  // Chặn đơn vị cm, kg
  if (/(?:cm|kg)$/i.test(rawValue.trim())) {
    return "Vui lòng chỉ nhập giá trị số, không nhập đơn vị.";
  }

  // Chặn chữ, ký tự đặc biệt, số khoa học (như e)
  if (!/^[-,.\d]+$/.test(rawTrimmed) || /[a-zA-Z]/.test(rawTrimmed)) {
    return `${FIELD_NAMES[key]} chỉ được nhập bằng số.`;
  }

  const numStr = rawTrimmed.replace(",", ".");
  const num = Number(numStr);

  if (isNaN(num) || num <= 0) {
    return `${FIELD_NAMES[key]} phải lớn hơn 0.`;
  }

  // Tối đa 1 chữ số thập phân
  if (numStr.includes(".") && numStr.split(".")[1].length > 1) {
    return `${FIELD_NAMES[key]} chỉ được có tối đa 1 chữ số thập phân.`;
  }

  // Kiểm tra Min-Max
  const limits = getMinMaxLimits(key, gender, componentType);
  if (num < limits.min || num > limits.max) {
    return "Giá trị có thể chưa chính xác. Vui lòng kiểm tra lại số đo và đơn vị.";
  }

  return undefined;
}

export function detectMeasurementWarnings(
  values: MeasurementValues,
  gender: Gender,
  componentType?: MeasurementComponentType,
): string | undefined {
    const activeKeys = new Set(getMeasurementFields(gender, componentType).map((f) => f.key));

    const neck = activeKeys.has("neck") && values.neck ? Number(values.neck.replace(",", ".")) : 0;
    const bust = activeKeys.has("bust") && values.bust ? Number(values.bust.replace(",", ".")) : 0;
    const upperArm = activeKeys.has("upperArm") && values.upperArm ? Number(values.upperArm.replace(",", ".")) : 0;
    const sleeve = activeKeys.has("sleeve") && values.sleeve ? Number(values.sleeve.replace(",", ".")) : 0;
    const height = activeKeys.has("height") && values.height ? Number(values.height.replace(",", ".")) : 0;
    const weight = activeKeys.has("weight") && values.weight ? Number(values.weight.replace(",", ".")) : 0;
    const waist = activeKeys.has("waist") && values.waist ? Number(values.waist.replace(",", ".")) : 0;
    const hip = activeKeys.has("hip") && values.hip ? Number(values.hip.replace(",", ".")) : 0;
    const shoulder = activeKeys.has("shoulder") && values.shoulder ? Number(values.shoulder.replace(",", ".")) : 0;

    // 1. Logic warnings
    if (activeKeys.has("neck") && activeKeys.has("bust") && neck && bust && neck >= bust) {
      return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
    }
    if (activeKeys.has("upperArm") && activeKeys.has("bust") && upperArm && bust && upperArm >= bust) {
      return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
    }
    if (activeKeys.has("sleeve") && activeKeys.has("height") && sleeve && height && sleeve >= height) {
      return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
    }
    if (activeKeys.has("height") && activeKeys.has("weight") && height && weight && height < weight) {
      return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
    }

    // 2. Rare ranges check (shows confirmation warning box)
    if (gender === "nam") {
      if (activeKeys.has("weight") && weight > 115) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("bust") && bust > 125) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("waist") && waist > 105) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("hip") && hip > 120) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("shoulder") && shoulder > 57) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("neck") && neck > 47) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("sleeve") && sleeve > 72) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("upperArm") && upperArm > 44) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
    } else {
      // female
      if (activeKeys.has("height") && height > 180) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("weight") && weight > 95) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("bust") && bust > 115) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("waist") && waist > 95) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("hip") && hip > 120) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("shoulder") && shoulder > 47) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("neck") && neck > 40) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("sleeve") && sleeve > 68) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
      if (activeKeys.has("upperArm") && upperArm > 35) return "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.";
    }

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
