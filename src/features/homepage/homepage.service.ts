import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getProductMediaPublicUrl,
  PRODUCT_MEDIA_BUCKET,
} from "@/lib/supabase/storage";
import type {
  HomepageCollectionRow,
  HomepageProductCardRow,
  HomepageProductSection,
} from "@/types/homepage.types";
import type { Collection, Product } from "@/types/product.types";

// Dữ liệu catalog/collection public, không phụ thuộc user hiện tại nên
// dùng admin client (không đọc cookies) + cache server-side 60s để tránh
// query lại Supabase mỗi lần chuyển qua lại giữa các trang catalog.
const CATALOG_CACHE_TTL_SECONDS = 60;

const DEFAULT_PRODUCT_SIZES = ["S", "M", "L", "XL"];
const COLLECTION_STORAGE_PREFIX = "collections/";
const COLLECTION_COVER_NGANG_PATTERN = /cover_ngang/i;

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

type CategoryRow = {
  category_id: number;
};

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

  return unstable_cache(
    () => fetchHomepageProductSections(categorySlugs, limit),
    ["homepage-product-sections", categorySlugs.join(","), String(limit)],
    { revalidate: CATALOG_CACHE_TTL_SECONDS, tags: ["catalog"] },
  )();
}

async function fetchHomepageProductSections(
  categorySlugs: string[],
  limit: number,
): Promise<HomepageProductSection[]> {
  const supabase = createAdminClient();
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
      categoryId: sectionRows[0]?.category_id ?? 0,
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

export async function getCategoryProductSections({
  department,
  limit = 4,
}: {
  department?: CatalogDepartment;
  limit?: number;
} = {}): Promise<HomepageProductSection[]> {
  return unstable_cache(
    () => fetchCategoryProductSections(department, limit),
    ["category-product-sections", department ?? "all", String(limit)],
    { revalidate: CATALOG_CACHE_TTL_SECONDS, tags: ["catalog"] },
  )();
}

async function fetchCategoryProductSections(
  department: CatalogDepartment | undefined,
  limit: number,
): Promise<HomepageProductSection[]> {
  const supabase = createAdminClient();
  let categoryIds: number[] | null = null;

  if (department) {
    const { data: categories, error: categoryError } = await supabase
      .schema("catalog")
      .from("category")
      .select("category_id")
      .eq("department", department)
      .eq("is_active", true);

    if (categoryError) {
      throw new Error(categoryError.message);
    }

    categoryIds = ((categories ?? []) as CategoryRow[]).map(
      (category) => category.category_id,
    );

    if (categoryIds.length === 0) {
      return [];
    }
  }

  let query = supabase
    .schema("catalog")
    .from("product_card_homepage")
    .select(PRODUCT_CARD_COLUMNS)
    .order("created_at", { ascending: false });

  if (categoryIds) {
    query = query.in("category_id", categoryIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as unknown) as HomepageProductCardRow[];
  const rowsByCategory = new Map<number, HomepageProductCardRow[]>();

  rows.forEach((row) => {
    const currentRows = rowsByCategory.get(row.category_id) ?? [];
    if (currentRows.length < limit) {
      currentRows.push(row);
      rowsByCategory.set(row.category_id, currentRows);
    }
  });

  return [...rowsByCategory.values()]
    .map((sectionRows) => {
      const firstRow = sectionRows[0];
      const gender = department ? GENDER_BY_DEPARTMENT[department] : "nu";

      return {
        categoryId: firstRow.category_id,
        categorySlug: firstRow.category_slug,
        categoryName: firstRow.category_name,
        products: sectionRows.map((row) =>
          mapHomepageRowToProduct(
            row,
            getProductMediaPublicUrl(supabase, row.main_storage_key),
            getProductMediaPublicUrl(supabase, row.hover_storage_key),
            gender,
          ),
        ),
      };
    })
    .sort((a, b) => a.categoryId - b.categoryId);
}

export async function getNewestDepartmentProducts({
  department,
  limit = 4,
}: {
  department: CatalogDepartment;
  limit?: number;
}): Promise<Product[]> {
  return unstable_cache(
    () => fetchNewestDepartmentProducts(department, limit),
    ["newest-department-products", department, String(limit)],
    { revalidate: CATALOG_CACHE_TTL_SECONDS, tags: ["catalog"] },
  )();
}

async function fetchNewestDepartmentProducts(
  department: CatalogDepartment,
  limit: number,
): Promise<Product[]> {
  const supabase = createAdminClient();

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
  return unstable_cache(
    () => fetchHomepageCollections(limit),
    ["homepage-collections", String(limit)],
    { revalidate: CATALOG_CACHE_TTL_SECONDS, tags: ["catalog"] },
  )();
}

async function fetchHomepageCollections(limit: number): Promise<Collection[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .schema("catalog")
    .from("collection")
    .select(
      "collection_id, collection_name, slug, description, launch_date, created_at, media:media_id(storage_key, alt_text)",
    )
    .eq("status", "ACTIVE")
    .order("launch_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(Math.max(limit, 50));

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as unknown) as (Omit<
    HomepageCollectionRow,
    "storage_key" | "alt_text"
  > & {
    media: { storage_key: string | null; alt_text: string | null } | null;
  })[];

  const coverStorageKeys = await Promise.all(
    rows.map((row) =>
      findCollectionCoverNgangStorageKey(supabase, row.media?.storage_key),
    ),
  );

  const collections = rows.map((row, index) => ({
    collection: {
      slug: row.slug,
      name: row.collection_name,
      subtitle: "Bộ sưu tập",
      coverImage:
        getProductMediaPublicUrl(
          supabase,
          coverStorageKeys[index] ?? row.media?.storage_key,
        ) ?? "/images/placeholder.png",
      description: row.description ?? "",
    },
    hasCoverNgang: Boolean(coverStorageKeys[index]),
  }));

  const prioritizedCollections = collections.some((item) => item.hasCoverNgang)
    ? [
        ...collections.filter((item) => item.hasCoverNgang),
        ...collections.filter((item) => !item.hasCoverNgang),
      ]
    : collections;

  return prioritizedCollections.slice(0, limit).map((item) => item.collection);
}

function getCollectionStorageFolder(storageKey: string | null | undefined) {
  if (!storageKey?.startsWith(COLLECTION_STORAGE_PREFIX)) {
    return null;
  }

  const [, folder] = storageKey.split("/");
  return folder ? `${COLLECTION_STORAGE_PREFIX}${folder}` : null;
}

async function findCollectionCoverNgangStorageKey(
  supabase: ReturnType<typeof createAdminClient>,
  storageKey: string | null | undefined,
) {
  const folder = getCollectionStorageFolder(storageKey);

  if (!folder) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .list(folder, { limit: 20 });

  if (error) {
    return null;
  }

  const coverNgangFile = data?.find((file) =>
    COLLECTION_COVER_NGANG_PATTERN.test(file.name),
  );

  return coverNgangFile ? `${folder}/${coverNgangFile.name}` : null;
}
