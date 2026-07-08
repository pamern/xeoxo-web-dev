import type { Season } from "./personal-color-quiz";

export type ColorTemperature = "WARM" | "COOL";
export type ColorValue = "LIGHT" | "DEEP";
export type ColorChroma = "CLEAR" | "SOFT" | "MUTED";

export type ColorClassification = {
  season: Season;
  temperature: ColorTemperature;
  value: ColorValue;
  chroma: ColorChroma;
};

// Phân loại personal color cho các màu thật trong `catalog.color` (37 màu, xem
// docs/database/database_schema.md#COLOR). Các cột personal_color_season /
// color_temperature / color_value / color_chroma trên bảng color hiện đang
// NULL hết (chưa từng được gán) và service_role không có quyền UPDATE bảng
// này qua API (chỉ role postgres/migration mới sửa được — xem
// schema_access_control.md), nên tạm map ở tầng code theo color_id thật.
// Nếu muốn đưa hẳn vào DB, chạy SQL update tương ứng qua Supabase SQL Editor.
export const COLOR_CLASSIFICATION: Record<number, ColorClassification> = {
  1: { season: "AUTUMN", temperature: "WARM", value: "LIGHT", chroma: "MUTED" }, // Be
  2: { season: "SPRING", temperature: "WARM", value: "LIGHT", chroma: "CLEAR" }, // Cam
  3: { season: "SUMMER", temperature: "COOL", value: "LIGHT", chroma: "SOFT" }, // Hồng
  4: { season: "SPRING", temperature: "WARM", value: "LIGHT", chroma: "CLEAR" }, // Hồng cam
  5: { season: "SUMMER", temperature: "COOL", value: "LIGHT", chroma: "SOFT" }, // Hồng nhạt
  6: { season: "SUMMER", temperature: "COOL", value: "LIGHT", chroma: "SOFT" }, // Hồng phấn
  7: { season: "SUMMER", temperature: "COOL", value: "LIGHT", chroma: "SOFT" }, // Hồng phấn nhạt
  8: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Hồng sen
  9: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Hồng tím
  10: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Hồng đậm
  11: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "MUTED" }, // Hồng đỗ
  12: { season: "SPRING", temperature: "WARM", value: "LIGHT", chroma: "SOFT" }, // Kem
  13: { season: "WINTER", temperature: "COOL", value: "LIGHT", chroma: "CLEAR" }, // Trắng
  14: { season: "SPRING", temperature: "WARM", value: "LIGHT", chroma: "SOFT" }, // Trắng kem
  15: { season: "SUMMER", temperature: "COOL", value: "LIGHT", chroma: "SOFT" }, // Trắng xám
  16: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Tím
  17: { season: "SUMMER", temperature: "COOL", value: "LIGHT", chroma: "SOFT" }, // Tím nhạt
  18: { season: "SPRING", temperature: "WARM", value: "LIGHT", chroma: "CLEAR" }, // Vàng
  19: { season: "SPRING", temperature: "WARM", value: "LIGHT", chroma: "SOFT" }, // Vàng kem
  20: { season: "SPRING", temperature: "WARM", value: "LIGHT", chroma: "CLEAR" }, // Vàng nhạt
  21: { season: "AUTUMN", temperature: "WARM", value: "DEEP", chroma: "MUTED" }, // Vàng nâu
  22: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Xanh
  23: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Xanh biển
  24: { season: "SUMMER", temperature: "COOL", value: "LIGHT", chroma: "SOFT" }, // Xanh biển nhạt
  25: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Xanh coban
  26: { season: "SPRING", temperature: "WARM", value: "LIGHT", chroma: "SOFT" }, // Xanh cốm
  27: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Xanh lam
  28: { season: "AUTUMN", temperature: "WARM", value: "DEEP", chroma: "MUTED" }, // Xanh lá
  29: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Xanh lục
  30: { season: "SUMMER", temperature: "COOL", value: "LIGHT", chroma: "SOFT" }, // Xanh ngọc
  31: { season: "AUTUMN", temperature: "WARM", value: "DEEP", chroma: "MUTED" }, // Xanh oliu
  32: { season: "SUMMER", temperature: "COOL", value: "LIGHT", chroma: "SOFT" }, // Xanh xám
  33: { season: "SUMMER", temperature: "COOL", value: "LIGHT", chroma: "SOFT" }, // Xám bạc
  34: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Đen
  35: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Đỏ
  36: { season: "WINTER", temperature: "COOL", value: "DEEP", chroma: "CLEAR" }, // Đỏ mận
  37: { season: "AUTUMN", temperature: "WARM", value: "DEEP", chroma: "MUTED" }, // Đỏ đậm
};

export const SEASON_DESCRIPTION: Record<Season, string> = {
  SPRING:
    "Bảng màu mùa Xuân rực rỡ và ấm áp, thiên về sắc vàng trong trẻo — tôn làn da rạng rỡ, tràn đầy sức sống.",
  SUMMER:
    "Bảng màu mùa Hạ dịu nhẹ và mát mẻ, thiên về tông pastel loang — tôn vẻ đẹp thanh thoát, nhẹ nhàng, tinh tế.",
  AUTUMN:
    "Bảng màu mùa Thu ấm áp và trầm lắng, thiên về sắc nâu đất, cam cháy — tôn vẻ đẹp sang trọng, cổ điển.",
  WINTER:
    "Bảng màu mùa Đông sắc sảo và tương phản cao, thiên về tông lạnh, đậm — tôn vẻ đẹp cá tính, cuốn hút.",
};
