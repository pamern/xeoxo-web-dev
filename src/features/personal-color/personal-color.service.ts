import { createAdminClient } from "@/lib/supabase/admin";
import { getProductMediaPublicUrl } from "@/lib/supabase/storage";
import type { Product } from "@/types/product.types";
import type { Season, Temperature, Value } from "./personal-color-quiz";

export type PersonalColorSwatch = {
  colorId: number;
  name: string;
  hex: string;
};

type PersonalColorOwner = {
  customerId: number | null;
  sessionId: string | null;
};

export type SavePersonalColorResultValues = {
  owner: PersonalColorOwner;
  temperature: Temperature;
  value: Value;
  season: Season;
  palette: PersonalColorSwatch[];
};

// Lấy bảng màu thật (catalog.color) khớp với season, query trực tiếp cột
// personal_color_season (đã được phân loại và ghi vào DB qua
// docs/database/personal-color-classification.sql).
export async function getPersonalColorPalette(
  season: Season,
): Promise<PersonalColorSwatch[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .schema("catalog")
    .from("color")
    .select("color_id, color_name, color_code")
    .eq("personal_color_season", season);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    colorId: Number(row.color_id),
    name: String(row.color_name),
    hex: String(row.color_code),
  }));
}

// Gợi ý sản phẩm thật có màu chủ đạo khớp bảng màu personal color của season.
export async function getPersonalColorProducts(
  season: Season,
  limit = 4,
): Promise<Product[]> {
  const palette = await getPersonalColorPalette(season);
  const colorIds = palette.map((color) => color.colorId);
  if (colorIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data: lineRows, error: lineError } = await supabase
    .schema("catalog")
    .from("product_line")
    .select("product_line_id, slug, line_name, color_id, created_at")
    .in("color_id", colorIds)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  if (lineError) {
    throw new Error(lineError.message);
  }

  const lines = lineRows ?? [];
  if (lines.length === 0) return [];

  const lineIds = lines.map((row) => Number(row.product_line_id));

  const [mediaLinksResult, componentsResult] = await Promise.all([
    supabase
      .schema("catalog")
      .from("product_line_media")
      .select("product_line_id, media_id")
      .in("product_line_id", lineIds)
      .eq("media_role", "MAIN"),
    supabase
      .schema("catalog")
      .from("product_component")
      .select("component_id, product_line_id")
      .in("product_line_id", lineIds),
  ]);

  if (mediaLinksResult.error) throw new Error(mediaLinksResult.error.message);
  if (componentsResult.error) throw new Error(componentsResult.error.message);

  const mediaLinks = mediaLinksResult.data ?? [];
  const mediaIds = [...new Set(mediaLinks.map((row) => Number(row.media_id)))];
  const mediaResult = mediaIds.length
    ? await supabase
        .schema("catalog")
        .from("media")
        .select("media_id, storage_key")
        .in("media_id", mediaIds)
    : { data: [], error: null };

  if (mediaResult.error) throw new Error(mediaResult.error.message);

  const storageKeyByMediaId = new Map(
    (mediaResult.data ?? []).map((row) => [
      Number(row.media_id),
      row.storage_key as string | null,
    ]),
  );
  const storageKeyByLine = new Map<number, string | null>();
  for (const link of mediaLinks) {
    const lineId = Number(link.product_line_id);
    if (!storageKeyByLine.has(lineId)) {
      storageKeyByLine.set(
        lineId,
        storageKeyByMediaId.get(Number(link.media_id)) ?? null,
      );
    }
  }

  const components = componentsResult.data ?? [];
  const componentToLine = new Map(
    components.map((row) => [
      Number(row.component_id),
      Number(row.product_line_id),
    ]),
  );
  const componentIds = components.map((row) => Number(row.component_id));

  const variantsResult = componentIds.length
    ? await supabase
        .schema("catalog")
        .from("product_variant")
        .select("component_id, price")
        .in("component_id", componentIds)
    : { data: [], error: null };

  if (variantsResult.error) throw new Error(variantsResult.error.message);

  const pricesByLine = new Map<number, number[]>();
  for (const variant of variantsResult.data ?? []) {
    const lineId = componentToLine.get(Number(variant.component_id));
    if (lineId === undefined) continue;
    const list = pricesByLine.get(lineId) ?? [];
    list.push(Number(variant.price));
    pricesByLine.set(lineId, list);
  }

  const colorByLine = new Map(
    lines.map((row) => [
      Number(row.product_line_id),
      palette.find((color) => color.colorId === Number(row.color_id)),
    ]),
  );

  return lines
    .map((row) => {
      const lineId = Number(row.product_line_id);
      const prices = pricesByLine.get(lineId) ?? [];
      const image =
        getProductMediaPublicUrl(supabase, storageKeyByLine.get(lineId)) ??
        "/images/placeholder.png";
      const color = colorByLine.get(lineId);

      const product: Product = {
        id: String(lineId),
        slug: row.slug,
        name: row.line_name,
        price: prices.length > 0 ? Math.min(...prices) : 0,
        images: [image, image],
        categorySlug: "",
        gender: "nu",
        description: "",
        sizes: [],
        colors: color ? [{ name: color.name, hex: color.hex }] : [],
      };
      return product;
    })
    .filter((product) => product.price > 0)
    .slice(0, limit);
}

export async function savePersonalColorResult({
  owner,
  temperature,
  value,
  season,
  palette,
}: SavePersonalColorResultValues) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: result, error: resultError } = await supabase
    .schema("catalog")
    .from("personal_color_result")
    .insert({
      customer_id: owner.customerId,
      guest_session_id: owner.sessionId,
      temperature_result: temperature,
      value_result: value,
      season_result: season,
      recommended_at: now,
      created_at: now,
    })
    .select("result_id")
    .single();

  if (resultError) {
    throw new Error(resultError.message);
  }

  const resultId = Number(result.result_id);
  const colorRows = palette.map((color, index) => ({
    result_id: resultId,
    color_id: color.colorId,
    display_order: index + 1,
    created_at: now,
  }));

  if (colorRows.length > 0) {
    const { error: colorError } = await supabase
      .schema("catalog")
      .from("personal_color_result_color")
      .insert(colorRows);

    if (colorError) {
      throw new Error(colorError.message);
    }
  }

  return { resultId };
}
