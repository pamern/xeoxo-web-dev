import { createClient } from "@/lib/supabase/server";
import { getProductMediaPublicUrl } from "@/lib/supabase/storage";
import type {
  HomepageCollectionRow,
  HomepageProductCardRow,
  HomepageProductSection,
} from "@/types/homepage.types";
import type { Collection, Product } from "@/types/product.types";

const DEFAULT_PRODUCT_SIZES = ["S", "M", "L", "XL"];

const EMPTY_PRODUCT_COLORS = [] as Product["colors"];

function mapHomepageRowToProduct(
  row: HomepageProductCardRow,
  mainImageUrl: string | null,
  hoverImageUrl: string | null,
  gender: Product["gender"] = "nu",
): Product {
  const fallbackImage = "/images/placeholder.png";
  const mainImage = mainImageUrl ?? fallbackImage;

  return {
    id: String(row.product_line_id),
    slug: row.product_line_slug,
    name: row.line_name,
    price: row.price ?? 0,
    images: [mainImage, hoverImageUrl ?? mainImage],
    categorySlug: row.category_slug,
    gender,
    description: "",
    sizes: DEFAULT_PRODUCT_SIZES,
    colors: EMPTY_PRODUCT_COLORS,
  };
}

const PRODUCT_CARD_COLUMNS = [
  "product_line_id",
  "line_name",
  "product_line_slug",
  "created_at",
  "category_id",
  "category_name",
  "category_slug",
  "price",
  "main_storage_key",
  "main_image_alt",
  "hover_storage_key",
  "hover_image_alt",
].join(",");

export type CatalogDepartment = "WOMEN" | "MEN" | "KIDS";

const GENDER_BY_DEPARTMENT: Record<CatalogDepartment, Product["gender"]> = {
  WOMEN: "nu",
  MEN: "nam",
  KIDS: "tre-em",
};

export async function getHomepageProductSections({
  categorySlugs,
  limit = 4,
}: {
  categorySlugs: string[];
  limit?: number;
}): Promise<HomepageProductSection[]> {
  if (categorySlugs.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("catalog")
    .from("product_card_homepage")
    .select(PRODUCT_CARD_COLUMNS)
    .in("category_slug", categorySlugs)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as unknown) as HomepageProductCardRow[];
  const rowsByCategory = new Map<string, HomepageProductCardRow[]>();

  rows.forEach((row) => {
    const currentRows = rowsByCategory.get(row.category_slug) ?? [];
    if (currentRows.length < limit) {
      currentRows.push(row);
      rowsByCategory.set(row.category_slug, currentRows);
    }
  });

  return categorySlugs.map((categorySlug) => {
    const sectionRows = rowsByCategory.get(categorySlug) ?? [];

    return {
      categorySlug,
      categoryName: sectionRows[0]?.category_name ?? categorySlug,
      products: sectionRows.map((row) =>
        mapHomepageRowToProduct(
          row,
          getProductMediaPublicUrl(supabase, row.main_storage_key),
          getProductMediaPublicUrl(supabase, row.hover_storage_key),
        ),
      ),
    };
  });
}

export async function getNewestDepartmentProducts({
  department,
  limit = 4,
}: {
  department: CatalogDepartment;
  limit?: number;
}): Promise<Product[]> {
  const supabase = await createClient();

  const { data: categories, error: categoryError } = await supabase
    .schema("catalog")
    .from("category")
    .select("category_id")
    .eq("department", department)
    .eq("is_active", true);

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  const categoryIds = (categories ?? []).map(
    (category) => (category as { category_id: number }).category_id,
  );

  if (categoryIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .schema("catalog")
    .from("product_card_homepage")
    .select(PRODUCT_CARD_COLUMNS)
    .in("category_id", categoryIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as unknown) as HomepageProductCardRow[];
  const seenProductLineIds = new Set<number>();
  const uniqueRows: HomepageProductCardRow[] = [];

  for (const row of rows) {
    if (seenProductLineIds.has(row.product_line_id)) continue;
    seenProductLineIds.add(row.product_line_id);
    uniqueRows.push(row);
    if (uniqueRows.length >= limit) break;
  }

  return uniqueRows.map((row) =>
    mapHomepageRowToProduct(
      row,
      getProductMediaPublicUrl(supabase, row.main_storage_key),
      getProductMediaPublicUrl(supabase, row.hover_storage_key),
      GENDER_BY_DEPARTMENT[department],
    ),
  );
}

export async function getHomepageCollections({
  limit = 5,
}: { limit?: number } = {}): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("catalog")
    .from("collection")
    .select(
      "collection_id, collection_name, slug, description, launch_date, created_at, media:media_id(storage_key, alt_text)",
    )
    .eq("status", "ACTIVE")
    .order("launch_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as unknown) as (Omit<
    HomepageCollectionRow,
    "storage_key" | "alt_text"
  > & {
    media: { storage_key: string | null; alt_text: string | null } | null;
  })[];

  return rows.map((row) => ({
    slug: row.slug,
    name: row.collection_name,
    subtitle: "Bộ sưu tập",
    coverImage:
      getProductMediaPublicUrl(supabase, row.media?.storage_key) ??
      "/images/placeholder.png",
    description: row.description ?? "",
  }));
}
