import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductSearchSuggestionDto } from "@/types/product-api.types";
import type { Product } from "@/types/product.types";

const FALLBACK_IMAGE = "/images/placeholder.png";
const CURRENCY = "VND" as const;
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "CUSTOM"];

type SearchableProductLineRow = {
  product_line_id: number;
  slug: string;
  line_name: string;
  description: string | null;
  color_id: number | null;
  material_id: number | null;
  collection_id: number | null;
  created_at: string | null;
};

type SearchMatch = SearchableProductLineRow & {
  relevance: number;
  createdAtMs: number;
};

type SearchCatalogEntry = {
  id: number;
  slug: string;
  name: string;
  thumbnail: string;
  price: number;
  categorySlug: string;
  gender: Product["gender"];
  description: string;
  sizes: string[];
  colors: Product["colors"];
  materialName?: string;
  collectionSlug?: string;
  collectionName?: string;
};

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenizeQuery(query: string) {
  return normalizeSearchText(query)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function computeRelevanceScore(
  productLine: SearchableProductLineRow,
  normalizedQuery: string,
  queryTokens: string[],
) {
  const normalizedName = normalizeSearchText(productLine.line_name);
  const normalizedDescription = normalizeSearchText(productLine.description ?? "");

  if (!normalizedName && !normalizedDescription) {
    return 0;
  }

  let score = 0;

  if (normalizedName === normalizedQuery) {
    score += 1_000;
  }
  if (normalizedName.startsWith(normalizedQuery)) {
    score += 700;
  }
  if (normalizedName.includes(normalizedQuery)) {
    score += 400;
  }
  if (normalizedDescription.includes(normalizedQuery)) {
    score += 180;
  }

  const matchedNameTokens = queryTokens.filter((token) =>
    normalizedName.includes(token),
  ).length;
  const matchedDescriptionTokens = queryTokens.filter((token) =>
    normalizedDescription.includes(token),
  ).length;

  if (matchedNameTokens === queryTokens.length && queryTokens.length > 0) {
    score += 320;
  }
  if (matchedDescriptionTokens === queryTokens.length && queryTokens.length > 0) {
    score += 120;
  }

  score += matchedNameTokens * 90;
  score += matchedDescriptionTokens * 25;

  return score;
}

function mediaUrl(storageKey?: string | null, bucketName?: string | null) {
  if (!storageKey) {
    return FALLBACK_IMAGE;
  }

  if (
    storageKey.startsWith("http://") ||
    storageKey.startsWith("https://") ||
    storageKey.startsWith("/")
  ) {
    return storageKey;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return FALLBACK_IMAGE;
  }

  const normalizedKey = storageKey.replace(/^\/+/, "");
  const normalizedBucket = bucketName?.replace(/^\/+|\/+$/g, "");

  if (normalizedBucket && !normalizedKey.startsWith(`${normalizedBucket}/`)) {
    return `${supabaseUrl}/storage/v1/object/public/${normalizedBucket}/${normalizedKey}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/${normalizedKey}`;
}

function sizeRank(sizeName: string) {
  const normalized = sizeName.trim().toUpperCase();
  const index = SIZE_ORDER.indexOf(normalized);
  return index === -1 ? SIZE_ORDER.length : index;
}

function departmentToGender(department?: string | null): Product["gender"] {
  switch ((department ?? "").toUpperCase()) {
    case "MEN":
      return "nam";
    case "KIDS":
      return "tre-em";
    default:
      return "nu";
  }
}

async function loadMatchedProductLines(query: string) {
  const admin = createAdminClient();
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = tokenizeQuery(query);

  if (!normalizedQuery || queryTokens.length === 0) {
    return [];
  }

  const { data, error } = await admin
    .schema("catalog")
    .from("product_line")
    .select(
      "product_line_id, slug, line_name, description, color_id, material_id, collection_id, created_at",
    )
    .eq("status", "ACTIVE");

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SearchableProductLineRow[])
    .map((productLine) => {
      const relevance = computeRelevanceScore(
        productLine,
        normalizedQuery,
        queryTokens,
      );

      return {
        ...productLine,
        relevance,
        createdAtMs: productLine.created_at
          ? new Date(productLine.created_at).getTime()
          : 0,
      };
    })
    .filter((productLine) => productLine.relevance > 0)
    .sort((left, right) => {
      if (right.relevance !== left.relevance) {
        return right.relevance - left.relevance;
      }

      return right.createdAtMs - left.createdAtMs;
    });
}

async function enrichSearchEntries(
  matches: SearchMatch[],
): Promise<SearchCatalogEntry[]> {
  if (matches.length === 0) {
    return [];
  }

  const admin = createAdminClient();
  const productLineIds = matches.map((item) => item.product_line_id);

  const [
    lineMediaResult,
    componentsResult,
    lineCategoryResult,
    colorsResult,
    materialsResult,
    collectionsResult,
  ] = await Promise.all([
    admin
      .schema("catalog")
      .from("product_line_media")
      .select("product_line_id, media_id, media_role, display_order")
      .in("product_line_id", productLineIds)
      .order("display_order", { ascending: true }),
    admin
      .schema("catalog")
      .from("product_component")
      .select("component_id, product_line_id")
      .in("product_line_id", productLineIds),
    admin
      .schema("catalog")
      .from("line_category")
      .select("product_line_id, category_id")
      .in("product_line_id", productLineIds),
    admin
      .schema("catalog")
      .from("color")
      .select("color_id, color_name, color_code"),
    admin
      .schema("catalog")
      .from("material")
      .select("material_id, material_name"),
    admin
      .schema("catalog")
      .from("collection")
      .select("collection_id, collection_name, slug"),
  ]);

  for (const result of [
    lineMediaResult,
    componentsResult,
    lineCategoryResult,
    colorsResult,
    materialsResult,
    collectionsResult,
  ]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const lineMediaRows = lineMediaResult.data ?? [];
  const componentRows = componentsResult.data ?? [];
  const lineCategoryRows = lineCategoryResult.data ?? [];
  const componentIds = componentRows.map((item) => Number(item.component_id));
  const mediaIds = lineMediaRows.map((item) => Number(item.media_id));
  const categoryIds = lineCategoryRows.map((item) => Number(item.category_id));

  const [mediaResult, variantsResult, categoryResult] = await Promise.all([
    mediaIds.length
      ? admin
          .schema("catalog")
          .from("media")
          .select("media_id, storage_key, bucket_name")
          .in("media_id", mediaIds)
      : Promise.resolve({ data: [], error: null }),
    componentIds.length
      ? admin
          .schema("catalog")
          .from("product_variant")
          .select("component_id, size_option_id, price, status")
          .eq("status", "ACTIVE")
          .in("component_id", componentIds)
      : Promise.resolve({ data: [], error: null }),
    categoryIds.length
      ? admin
          .schema("catalog")
          .from("category")
          .select("category_id, slug, department")
          .in("category_id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  for (const result of [mediaResult, variantsResult, categoryResult]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const sizeOptionIds = Array.from(
    new Set(
      (variantsResult.data ?? [])
        .map((item) => item.size_option_id)
        .filter((value): value is string | number => value !== null && value !== undefined)
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  );

  const sizeOptionsResult = sizeOptionIds.length
    ? await admin
        .schema("catalog")
        .from("size_option")
        .select("size_option_id, size_name")
        .in("size_option_id", sizeOptionIds)
    : { data: [], error: null };

  if (sizeOptionsResult.error) {
    throw new Error(sizeOptionsResult.error.message);
  }

  const mediaMap = new Map(
    (mediaResult.data ?? []).map((item) => [Number(item.media_id), item]),
  );
  const colorMap = new Map(
    (colorsResult.data ?? []).map((item) => [Number(item.color_id), item]),
  );
  const materialMap = new Map(
    (materialsResult.data ?? []).map((item) => [Number(item.material_id), item]),
  );
  const collectionMap = new Map(
    (collectionsResult.data ?? []).map((item) => [Number(item.collection_id), item]),
  );
  const categoryMap = new Map(
    (categoryResult.data ?? []).map((item) => [Number(item.category_id), item]),
  );
  const sizeOptionMap = new Map(
    (sizeOptionsResult.data ?? []).map((item) => [
      Number(item.size_option_id),
      item.size_name,
    ]),
  );

  const componentsByLine = new Map<number, number[]>();
  for (const row of componentRows) {
    const productLineId = Number(row.product_line_id);
    const current = componentsByLine.get(productLineId) ?? [];
    current.push(Number(row.component_id));
    componentsByLine.set(productLineId, current);
  }

  const categoryByLine = new Map<number, number[]>();
  for (const row of lineCategoryRows) {
    const productLineId = Number(row.product_line_id);
    const current = categoryByLine.get(productLineId) ?? [];
    current.push(Number(row.category_id));
    categoryByLine.set(productLineId, current);
  }

  const thumbnailByLine = new Map<number, string>();
  const mediaRoleRank = {
    MAIN: 0,
    GALLERY: 1,
    DETAIL: 2,
    LOOKBOOK: 3,
  } as const;

  const sortedMediaRows = [...lineMediaRows].sort((left, right) => {
    const leftRank =
      mediaRoleRank[String(left.media_role) as keyof typeof mediaRoleRank] ?? 99;
    const rightRank =
      mediaRoleRank[String(right.media_role) as keyof typeof mediaRoleRank] ?? 99;

    return (
      leftRank - rightRank ||
      Number(left.display_order ?? 0) - Number(right.display_order ?? 0)
    );
  });

  for (const row of sortedMediaRows) {
    const productLineId = Number(row.product_line_id);
    if (thumbnailByLine.has(productLineId)) {
      continue;
    }

    const media = mediaMap.get(Number(row.media_id));
    thumbnailByLine.set(
      productLineId,
      mediaUrl(media?.storage_key, media?.bucket_name),
    );
  }

  const variantsByComponent = new Map<number, Array<{ size_option_id: number | null; price: number }>>();
  for (const row of variantsResult.data ?? []) {
    const componentId = Number(row.component_id);
    const current = variantsByComponent.get(componentId) ?? [];
    current.push({
      size_option_id:
        row.size_option_id === null ? null : Number(row.size_option_id),
      price: Number(row.price ?? 0),
    });
    variantsByComponent.set(componentId, current);
  }

  return matches.map((match) => {
    const componentIdsForLine = componentsByLine.get(match.product_line_id) ?? [];
    const prices = componentIdsForLine.flatMap((componentId) =>
      (variantsByComponent.get(componentId) ?? []).map((variant) => variant.price),
    );
    const sizeNames = Array.from(
      new Set(
        componentIdsForLine.flatMap((componentId) =>
          (variantsByComponent.get(componentId) ?? [])
            .map((variant) =>
              variant.size_option_id === null
                ? null
                : sizeOptionMap.get(variant.size_option_id),
            )
            .filter((sizeName): sizeName is string => Boolean(sizeName)),
        ),
      ),
    ).sort((left, right) => sizeRank(left) - sizeRank(right));

    const categoryIdsForLine = categoryByLine.get(match.product_line_id) ?? [];
    const primaryCategory = categoryIdsForLine
      .map((categoryId) => categoryMap.get(categoryId))
      .find(Boolean);
    const color = match.color_id ? colorMap.get(match.color_id) : undefined;
    const material = match.material_id
      ? materialMap.get(match.material_id)
      : undefined;
    const collection = match.collection_id
      ? collectionMap.get(match.collection_id)
      : undefined;

    return {
      id: match.product_line_id,
      slug: match.slug,
      name: match.line_name,
      thumbnail: thumbnailByLine.get(match.product_line_id) ?? FALLBACK_IMAGE,
      price: prices.length > 0 ? Math.min(...prices) : 0,
      categorySlug: primaryCategory?.slug ?? "san-pham",
      gender: departmentToGender(primaryCategory?.department),
      description: match.description ?? "",
      sizes: sizeNames,
      colors: color
        ? [{ name: color.color_name, hex: color.color_code }]
        : [],
      materialName: material?.material_name ?? undefined,
      collectionSlug: collection?.slug ?? undefined,
      collectionName: collection?.collection_name ?? undefined,
    };
  });
}

function mapSearchEntryToProduct(
  entry: SearchCatalogEntry,
): Product {
  return {
    id: String(entry.id),
    slug: entry.slug,
    name: entry.name,
    price: entry.price,
    images: [entry.thumbnail],
    categorySlug: entry.categorySlug,
    gender: entry.gender,
    collectionSlug: entry.collectionSlug,
    description: entry.description,
    sizes: entry.sizes,
    colors: entry.colors,
    materialName: entry.materialName,
    collectionName: entry.collectionName,
  };
}

function mapSearchEntryToSuggestion(
  entry: SearchCatalogEntry,
): ProductSearchSuggestionDto {
  return {
    product_line_id: String(entry.id),
    slug: entry.slug,
    name: entry.name,
    thumbnail: entry.thumbnail,
    price: entry.price,
    currency: CURRENCY,
  };
}

export async function searchProductCatalog({
  q,
  page = 1,
  limit = 20,
}: {
  q: string;
  page?: number;
  limit?: number;
}) {
  const matches = await loadMatchedProductLines(q);
  const total = matches.length;
  const offset = (page - 1) * limit;
  const pagedMatches = matches.slice(offset, offset + limit);
  const entries = await enrichSearchEntries(pagedMatches);

  return {
    query: q,
    products: entries.map(mapSearchEntryToProduct),
    suggestions: entries.map(mapSearchEntryToSuggestion),
    pagination: {
      page,
      limit,
      total,
    },
  };
}

export async function getProductSearchSuggestions({
  q,
  limit = 4,
}: {
  q: string;
  limit?: number;
}) {
  const matches = await loadMatchedProductLines(q);
  const entries = await enrichSearchEntries(matches.slice(0, limit));
  return entries.map(mapSearchEntryToSuggestion);
}

export async function getAllActiveProducts(): Promise<Product[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("catalog")
    .from("product_line")
    .select("product_line_id, slug, line_name, description, color_id, material_id, collection_id, created_at")
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const matches = (data ?? []).map((row) => ({
    ...row,
    relevance: 1,
    createdAtMs: row.created_at ? new Date(row.created_at).getTime() : 0,
  }));

  const entries = await enrichSearchEntries(matches);
  return entries.map(mapSearchEntryToProduct);
}
