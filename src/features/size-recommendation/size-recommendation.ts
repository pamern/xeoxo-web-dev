import type { Gender } from "@/types/product.types";

export type MeasurementKey =
  | "height"
  | "weight"
  | "bust"
  | "waist"
  | "hip"
  | "shoulder"
  | "neck"
  | "sleeve"
  | "upperArm";

export type MeasurementValues = Record<MeasurementKey, string>;
export type MeasurementComponentType = "AO" | "QUAN" | "SET" | string | null | undefined;

export type SizeRecommendationResult = {
  result_type: "STANDARD_SIZE" | "CUSTOM_SIZE" | "VALIDATION_ERROR" | "CONFIRMATION_REQUIRED";
  recommended_size: string | null;
  base_size: string | null;
  requires_customization: boolean;
  measurement_sizes: Record<string, string>;
  customized_fields: string[];
  message: string;
  size?: string | null; // Compatibility
  confidence?: "high" | "reference"; // Compatibility
};

export const MEASUREMENT_FIELDS: Array<{
  key: MeasurementKey;
  label: string;
  unit: "cm" | "kg";
  min: number;
  max: number;
  required: boolean;
}> = [
  { key: "height", label: "Chiều cao", unit: "cm", min: 140, max: 200, required: true },
  { key: "weight", label: "Cân nặng", unit: "kg", min: 38, max: 120, required: true },
  { key: "bust", label: "Vòng ngực", unit: "cm", min: 72, max: 130, required: false },
  { key: "waist", label: "Vòng eo", unit: "cm", min: 50, max: 110, required: false },
  { key: "hip", label: "Vòng mông", unit: "cm", min: 78, max: 125, required: false },
  { key: "shoulder", label: "Ngang vai", unit: "cm", min: 33, max: 60, required: false },
  { key: "neck", label: "Vòng cổ", unit: "cm", min: 27, max: 50, required: false },
  { key: "sleeve", label: "Dài tay", unit: "cm", min: 48, max: 75, required: false },
  { key: "upperArm", label: "Vòng bắp tay", unit: "cm", min: 21, max: 48, required: false },
];

// DB size charts mapped out as target garment measurements
const DB_SIZE_CHARTS: Record<string, Array<{ size: string; values: Partial<Record<MeasurementKey, number>> }>> = {
  AO: [
    { size: "XS", values: { bust: 80, waist: 60, shoulder: 34, sleeve: 55, upperArm: 26, neck: 30 } },
    { size: "S", values: { bust: 88, waist: 84, shoulder: 37, sleeve: 56, upperArm: 28, neck: 34 } },
    { size: "M", values: { bust: 92, waist: 88, shoulder: 38, sleeve: 57, upperArm: 29.5, neck: 35 } },
    { size: "L", values: { bust: 96, waist: 92, shoulder: 39, sleeve: 58, upperArm: 31, neck: 36 } },
    { size: "XL", values: { bust: 100, waist: 96, shoulder: 40, sleeve: 59, upperArm: 32.5, neck: 37 } }
  ],
  DAM: [
    { size: "XS", values: { bust: 80, waist: 60, hip: 84, shoulder: 34, sleeve: 55, upperArm: 26, neck: 30 } },
    { size: "S", values: { bust: 88, waist: 84, hip: 88, shoulder: 37, sleeve: 56, upperArm: 28, neck: 34 } },
    { size: "M", values: { bust: 92, waist: 88, hip: 92, shoulder: 38, sleeve: 57, upperArm: 29.5, neck: 35 } },
    { size: "L", values: { bust: 96, waist: 92, hip: 96, shoulder: 39, sleeve: 58, upperArm: 31, neck: 36 } },
    { size: "XL", values: { bust: 100, waist: 96, hip: 100, shoulder: 40, sleeve: 59, upperArm: 32.5, neck: 37 } }
  ],
  QUAN: [
    { size: "XS", values: { waist: 60, hip: 84 } },
    { size: "S", values: { waist: 64, hip: 90 } },
    { size: "M", values: { waist: 68, hip: 94 } },
    { size: "L", values: { waist: 72, hip: 98 } },
    { size: "XL", values: { waist: 76, hip: 102 } }
  ],
  VY: [
    { size: "XS", values: { waist: 60, hip: 84 } },
    { size: "S", values: { waist: 64, hip: 90 } },
    { size: "M", values: { waist: 68, hip: 94 } },
    { size: "L", values: { waist: 72, hip: 98 } },
    { size: "XL", values: { waist: 76, hip: 102 } }
  ],
  NAM: [
    { size: "S", values: { bust: 88, waist: 72, hip: 88, shoulder: 43.5, sleeve: 60, upperArm: 28, neck: 38, height: 166.5, weight: 57.5 } },
    { size: "M", values: { bust: 92, waist: 76, hip: 92, shoulder: 45, sleeve: 62, upperArm: 30, neck: 40, height: 170, weight: 65 } },
    { size: "L", values: { bust: 96, waist: 80, hip: 98, shoulder: 46, sleeve: 64, upperArm: 32, neck: 41.5, height: 175, weight: 72 } },
    { size: "XL", values: { bust: 100, waist: 84, hip: 101, shoulder: 47, sleeve: 66, upperArm: 34, neck: 43.5, height: 177.5, weight: 73.5 } }
  ]
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export const SIZE_CHARTS = {
  nam: {
    columns: ["Size", "Chiều cao", "Cân nặng", "Ngực", "Eo", "Mông", "Vai", "Cổ", "Dài tay", "Bắp tay"],
    rows: [
      { size: "S", display: { "Chiều cao":"165–168", "Cân nặng":"55–60", "Ngực":"86–88", "Eo":"70–72", "Mông":"85–89", "Vai":"43–44", "Cổ":"38", "Dài tay":"60", "Bắp tay":"28" } },
      { size: "M", display: { "Chiều cao":"169–170", "Cân nặng":"61–65", "Ngực":"90–92", "Eo":"74–76", "Mông":"90–94", "Vai":"45", "Cổ":"40", "Dài tay":"62", "Bắp tay":"30" } },
      { size: "L", display: { "Chiều cao":"172–175", "Cân nặng":"66–70", "Ngực":"94–96", "Eo":"78–80", "Mông":"96–98", "Vai":"46", "Cổ":"41–42", "Dài tay":"64", "Bắp tay":"32" } },
      { size: "XL", display: { "Chiều cao":"175–180", "Cân nặng":"72–75", "Ngực":"97–100", "Eo":"81–85", "Mông":"100–102", "Vai":"47", "Cổ":"43–44", "Dài tay":"66", "Bắp tay":"34" } },
    ],
  },
  nu: {
    columns: ["Size", "Cổ", "Vai", "Ngực", "Eo", "Mông", "Tay lửng", "Tay dài", "Dài áo", "Dài quần"],
    rows: [
      { size: "XS", display: { "Cổ":"30", "Vai":"34", "Ngực":"80", "Eo":"60", "Mông":"84", "Tay lửng":"52", "Tay dài":"67", "Dài áo":"126", "Dài quần":"96" } },
      { size: "S", display: { "Cổ":"32", "Vai":"36", "Ngực":"84", "Eo":"64", "Mông":"88", "Tay lửng":"53", "Tay dài":"68", "Dài áo":"130", "Dài quần":"100" } },
      { size: "M", display: { "Cổ":"34", "Vai":"38", "Ngực":"88", "Eo":"68", "Mông":"92", "Tay lửng":"54", "Tay dài":"69", "Dài áo":"135", "Dài quần":"104" } },
      { size: "L", display: { "Cổ":"36", "Vai":"40", "Ngực":"92", "Eo":"72", "Mông":"96", "Tay lửng":"55", "Tay dài":"70", "Dài áo":"140", "Dài quần":"108" } },
      { size: "XL", display: { "Cổ":"38", "Vai":"42", "Ngực":"96", "Eo":"76", "Mông":"98", "Tay lửng":"56", "Tay dài":"72", "Dài áo":"140", "Dài quần":"108" } },
    ],
  },
};

export function getSizeChart(gender: Gender) {
  return SIZE_CHARTS[gender === "nam" ? "nam" : "nu"];
}

export function getMeasurementFields(
  gender: Gender,
  componentType?: MeasurementComponentType,
) {
  const normType = componentType?.trim().toUpperCase();

  if (gender === "nam") {
    // Return all fields for male
    return MEASUREMENT_FIELDS.map((f) => ({ ...f, required: true }));
  }

  // female
  if (normType === "QUAN" || normType === "VY") {
    return MEASUREMENT_FIELDS.filter((f) => ["waist", "hip"].includes(f.key)).map((f) => ({
      ...f,
      required: true,
    }));
  }

  // Women tops/dress (default or AO/DAM)
  return MEASUREMENT_FIELDS.filter((f) => ["neck", "shoulder", "bust", "waist"].includes(f.key)).map((f) => ({
    ...f,
    required: true,
  }));
}

export function recommendSize(
  gender: Gender,
  values: MeasurementValues,
  componentType?: MeasurementComponentType,
): SizeRecommendationResult {
  const normType = componentType?.trim().toUpperCase() || (gender === "nam" ? "NAM" : "AO");

  // Load relevant size chart
  const chart = DB_SIZE_CHARTS[normType] || DB_SIZE_CHARTS["AO"];

  // 1. Parse and apply Ease Allowance
  const bodyMeasurements: Partial<Record<MeasurementKey, number>> = {};
  Object.entries(values).forEach(([k, v]) => {
    const parsedVal = Number(String(v).trim().replace(",", "."));
    if (!isNaN(parsedVal) && parsedVal > 0) {
      bodyMeasurements[k as MeasurementKey] = parsedVal;
    }
  });

  const requiredGarmentMeasurements: Partial<Record<MeasurementKey, number>> = {};

  if (gender === "nam") {
    if (bodyMeasurements.height) requiredGarmentMeasurements.height = bodyMeasurements.height;
    if (bodyMeasurements.weight) requiredGarmentMeasurements.weight = bodyMeasurements.weight;
    if (bodyMeasurements.bust) requiredGarmentMeasurements.bust = bodyMeasurements.bust + 6;
    if (bodyMeasurements.waist) requiredGarmentMeasurements.waist = bodyMeasurements.waist + 4;
    if (bodyMeasurements.hip) requiredGarmentMeasurements.hip = bodyMeasurements.hip + 4;
    if (bodyMeasurements.shoulder) requiredGarmentMeasurements.shoulder = bodyMeasurements.shoulder;
    if (bodyMeasurements.neck) requiredGarmentMeasurements.neck = bodyMeasurements.neck + 2;
    if (bodyMeasurements.sleeve) requiredGarmentMeasurements.sleeve = bodyMeasurements.sleeve;
    if (bodyMeasurements.upperArm) requiredGarmentMeasurements.upperArm = bodyMeasurements.upperArm + 4;
  } else {
    // female
    if (normType === "QUAN" || normType === "VY") {
      if (bodyMeasurements.waist) requiredGarmentMeasurements.waist = bodyMeasurements.waist + 2;
      if (bodyMeasurements.hip) requiredGarmentMeasurements.hip = bodyMeasurements.hip + 4;
    } else {
      // Top or Dress
      if (bodyMeasurements.neck) requiredGarmentMeasurements.neck = bodyMeasurements.neck + 2;
      if (bodyMeasurements.shoulder) requiredGarmentMeasurements.shoulder = bodyMeasurements.shoulder;
      if (bodyMeasurements.bust) requiredGarmentMeasurements.bust = bodyMeasurements.bust + 4;
      if (bodyMeasurements.waist) requiredGarmentMeasurements.waist = bodyMeasurements.waist + 4;
    }
  }

  // 2. Map each measurement to closest size
  const measurementSizes: Record<string, string> = {};
  const customizedFields: string[] = [];

  const fieldsToCheck = getMeasurementFields(gender, componentType).map((f) => f.key);

  fieldsToCheck.forEach((key) => {
    const reqValue = requiredGarmentMeasurements[key];
    if (reqValue === undefined) return;

    // Get all valid values for this field from the chart
    const validRows = chart.filter((row) => row.values[key] !== undefined && row.values[key] !== null);
    if (validRows.length === 0) return;

    // Sort rows by size order
    validRows.sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));

    const minRow = validRows[0];
    const maxRow = validRows[validRows.length - 1];

    const minChartVal = minRow.values[key]!;
    const maxChartVal = maxRow.values[key]!;

    if (reqValue < minChartVal) {
      measurementSizes[key] = minRow.size;
      customizedFields.push(key);
    } else if (reqValue > maxChartVal) {
      measurementSizes[key] = maxRow.size;
      customizedFields.push(key);
    } else {
      // Find closest size
      let bestRow = minRow;
      let minDistance = Math.abs(reqValue - minChartVal);

      for (const row of validRows) {
        const val = row.values[key]!;
        const distance = Math.abs(reqValue - val);

        if (distance < minDistance) {
          minDistance = distance;
          bestRow = row;
        } else if (distance === minDistance) {
          // Tie-breaking rule: choose larger size
          if (SIZE_ORDER.indexOf(row.size) > SIZE_ORDER.indexOf(bestRow.size)) {
            bestRow = row;
          }
        }
      }
      measurementSizes[key] = bestRow.size;
    }
  });

  const sizesMapped = Object.values(measurementSizes);
  const distinctSizes = Array.from(new Set(sizesMapped));

  // Determine Base Size
  let baseSize: string | null = null;
  const primaryKeys =
    gender === "nam"
      ? ["bust", "waist", "hip", "shoulder"]
      : normType === "QUAN" || normType === "VY"
        ? ["waist", "hip"]
        : ["neck", "shoulder", "bust", "waist"];

  const primarySizes = Object.entries(measurementSizes)
    .filter(([k]) => primaryKeys.includes(k))
    .map(([, size]) => size);

  if (primarySizes.length > 0) {
    primarySizes.sort((a, b) => SIZE_ORDER.indexOf(b) - SIZE_ORDER.indexOf(a)); // sort descending
    baseSize = primarySizes[0];
  } else if (sizesMapped.length > 0) {
    sizesMapped.sort((a, b) => SIZE_ORDER.indexOf(b) - SIZE_ORDER.indexOf(a));
    baseSize = sizesMapped[0];
  }

  // 3. Determine result type
  if (distinctSizes.length === 1 && customizedFields.length === 0) {
    const standardSize = distinctSizes[0];
    return {
      result_type: "STANDARD_SIZE",
      recommended_size: standardSize,
      base_size: standardSize,
      requires_customization: false,
      measurement_sizes: measurementSizes,
      customized_fields: [],
      message: `Các số đo của bạn phù hợp với size ${standardSize}.`,
      size: standardSize,
      confidence: "high"
    };
  } else {
    // Collect customize fields (which either differ from baseSize or are out of range)
    const customFieldsSet = new Set(customizedFields);
    Object.entries(measurementSizes).forEach(([k, s]) => {
      if (s !== baseSize) {
        customFieldsSet.add(k);
      }
    });

    return {
      result_type: "CUSTOM_SIZE",
      recommended_size: null,
      base_size: baseSize,
      requires_customization: true,
      measurement_sizes: measurementSizes,
      customized_fields: Array.from(customFieldsSet),
      message: `Các số đo thuộc nhiều size khác nhau. Sản phẩm cần customize từ size nền ${baseSize}.`,
      size: "CUSTOM",
      confidence: "high"
    };
  }
}
