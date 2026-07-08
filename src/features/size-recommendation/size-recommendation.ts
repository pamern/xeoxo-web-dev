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
type Range = readonly [number, number];

export type SizeRow = {
  size: string;
  measurements: Partial<Record<MeasurementKey, Range>>;
  display: Record<string, string>;
};

export const MEASUREMENT_FIELDS: Array<{
  key: MeasurementKey;
  label: string;
  unit: "cm" | "kg";
  min: number;
  max: number;
  required: boolean;
}> = [
  { key: "height", label: "Chiều cao", unit: "cm", min: 120, max: 210, required: true },
  { key: "weight", label: "Cân nặng", unit: "kg", min: 30, max: 200, required: true },
  { key: "bust", label: "Vòng ngực", unit: "cm", min: 60, max: 160, required: false },
  { key: "waist", label: "Vòng eo", unit: "cm", min: 45, max: 160, required: false },
  { key: "hip", label: "Vòng mông", unit: "cm", min: 65, max: 180, required: false },
  { key: "shoulder", label: "Ngang vai", unit: "cm", min: 25, max: 70, required: false },
  { key: "neck", label: "Vòng cổ", unit: "cm", min: 20, max: 70, required: false },
  { key: "sleeve", label: "Dài tay", unit: "cm", min: 35, max: 90, required: false },
  { key: "upperArm", label: "Vòng bắp tay", unit: "cm", min: 15, max: 70, required: false },
];

export const SIZE_CHARTS: Record<"nam" | "nu", { columns: string[]; rows: SizeRow[] }> = {
  nam: {
    columns: ["Size", "Chiều cao", "Cân nặng", "Ngực", "Eo", "Mông", "Vai", "Cổ", "Dài tay", "Bắp tay"],
    rows: [
      { size: "S", measurements: { height: [165,168], weight: [55,60], bust: [86,88], waist: [70,72], hip: [85,89], shoulder: [43,44], neck: [38,38], sleeve: [60,60], upperArm: [28,28] }, display: { "Chiều cao":"165–168", "Cân nặng":"55–60", "Ngực":"86–88", "Eo":"70–72", "Mông":"85–89", "Vai":"43–44", "Cổ":"38", "Dài tay":"60", "Bắp tay":"28" } },
      { size: "M", measurements: { height: [169,170], weight: [61,65], bust: [90,92], waist: [74,76], hip: [90,94], shoulder: [45,45], neck: [40,40], sleeve: [62,62], upperArm: [30,30] }, display: { "Chiều cao":"169–170", "Cân nặng":"61–65", "Ngực":"90–92", "Eo":"74–76", "Mông":"90–94", "Vai":"45", "Cổ":"40", "Dài tay":"62", "Bắp tay":"30" } },
      { size: "L", measurements: { height: [172,175], weight: [66,70], bust: [94,96], waist: [78,80], hip: [96,98], shoulder: [46,46], neck: [41,42], sleeve: [64,64], upperArm: [32,32] }, display: { "Chiều cao":"172–175", "Cân nặng":"66–70", "Ngực":"94–96", "Eo":"78–80", "Mông":"96–98", "Vai":"46", "Cổ":"41–42", "Dài tay":"64", "Bắp tay":"32" } },
      { size: "XL", measurements: { height: [175,180], weight: [72,75], bust: [97,100], waist: [81,85], hip: [100,102], shoulder: [47,47], neck: [43,44], sleeve: [66,66], upperArm: [34,34] }, display: { "Chiều cao":"175–180", "Cân nặng":"72–75", "Ngực":"97–100", "Eo":"81–85", "Mông":"100–102", "Vai":"47", "Cổ":"43–44", "Dài tay":"66", "Bắp tay":"34" } },
    ],
  },
  nu: {
    columns: ["Size", "Cổ", "Vai", "Ngực", "Eo", "Mông", "Tay lửng", "Tay dài", "Dài áo", "Dài quần"],
    rows: [
      { size: "XS", measurements: { height: [145,155], weight: [38,45], neck: [30,30], shoulder: [34,34], bust: [80,80], waist: [60,60], hip: [84,84], sleeve: [67,67] }, display: { "Cổ":"30", "Vai":"34", "Ngực":"80", "Eo":"60", "Mông":"84", "Tay lửng":"52", "Tay dài":"67", "Dài áo":"126", "Dài quần":"96" } },
      { size: "S", measurements: { height: [150,160], weight: [44,50], neck: [32,32], shoulder: [36,36], bust: [84,84], waist: [64,64], hip: [88,88], sleeve: [68,68] }, display: { "Cổ":"32", "Vai":"36", "Ngực":"84", "Eo":"64", "Mông":"88", "Tay lửng":"53", "Tay dài":"68", "Dài áo":"130", "Dài quần":"100" } },
      { size: "M", measurements: { height: [155,165], weight: [49,56], neck: [34,34], shoulder: [38,38], bust: [88,88], waist: [68,68], hip: [92,92], sleeve: [69,69] }, display: { "Cổ":"34", "Vai":"38", "Ngực":"88", "Eo":"68", "Mông":"92", "Tay lửng":"54", "Tay dài":"69", "Dài áo":"135", "Dài quần":"104" } },
      { size: "L", measurements: { height: [160,170], weight: [55,62], neck: [36,36], shoulder: [40,40], bust: [92,92], waist: [72,72], hip: [96,96], sleeve: [70,70] }, display: { "Cổ":"36", "Vai":"40", "Ngực":"92", "Eo":"72", "Mông":"96", "Tay lửng":"55", "Tay dài":"70", "Dài áo":"140", "Dài quần":"108" } },
      { size: "XL", measurements: { height: [165,180], weight: [61,72], neck: [38,38], shoulder: [42,42], bust: [96,96], waist: [76,76], hip: [98,98], sleeve: [72,72] }, display: { "Cổ":"38", "Vai":"42", "Ngực":"96", "Eo":"76", "Mông":"98", "Tay lửng":"56", "Tay dài":"72", "Dài áo":"140", "Dài quần":"108" } },
    ],
  },
};

const WEIGHTS: Partial<Record<MeasurementKey, number>> = {
  height: 1,
  weight: 1.2,
  bust: 2,
  waist: 2,
  hip: 2,
  shoulder: 1.2,
  neck: 0.8,
  sleeve: 0.8,
  upperArm: 0.8,
};

export function getSizeChart(gender: Gender) {
  return SIZE_CHARTS[gender === "nam" ? "nam" : "nu"];
}

export function getMeasurementFields(gender: Gender) {
  const chart = getSizeChart(gender);
  const visibleFields =
    gender === "nam"
      ? MEASUREMENT_FIELDS
      : (["neck", "shoulder", "bust", "waist", "hip"] as MeasurementKey[])
          .map((key) => MEASUREMENT_FIELDS.find((field) => field.key === key))
          .filter((field): field is (typeof MEASUREMENT_FIELDS)[number] => Boolean(field));

  return visibleFields.map((field) => {
    const ranges = chart.rows
      .map((row) => row.measurements[field.key])
      .filter((range): range is readonly [number, number] => Boolean(range));

    const required = true;

    if (ranges.length === 0) return { ...field, required };
    return {
      ...field,
      required,
      min: Math.min(...ranges.map((range) => range[0])),
      max: Math.max(...ranges.map((range) => range[1])),
    };
  });
}

export function recommendSize(
  gender: Gender,
  values: MeasurementValues,
): { size: string | null; confidence: "high" | "reference" } {
  const chart = getSizeChart(gender);
  const entered = Object.entries(values).filter(([, value]) => value !== "") as Array<[MeasurementKey, string]>;
  const scored = chart.rows.map((row, index) => {
    let score = 0;
    let totalWeight = 0;
    for (const [key, raw] of entered) {
      const range = row.measurements[key];
      if (!range) continue;
      const value = Number(raw.replace(",", "."));
      const distance = value < range[0] ? range[0] - value : value > range[1] ? value - range[1] : 0;
      const scale = Math.max(range[1] - range[0], key === "weight" ? 5 : 4);
      const weight = WEIGHTS[key] ?? 1;
      score += (distance / scale) * weight;
      totalWeight += weight;
    }
    return { size: row.size, score: totalWeight ? score / totalWeight : Number.POSITIVE_INFINITY, index };
  });

  scored.sort((a, b) => a.score - b.score || b.index - a.index);
  const optionalCount = entered.filter(([key]) => key !== "height" && key !== "weight").length;
  const bestMatch = scored[0];
  return {
    size: bestMatch && bestMatch.score <= 1.75 ? bestMatch.size : null,
    confidence: optionalCount >= 3 ? "high" : "reference",
  };
}
