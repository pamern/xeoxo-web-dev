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
  "category_id",
  "category_name",
  "category_slug",
  "price",
  "main_storage_key",
  "main_image_alt",
  "hover_storage_key",
  "hover_image_alt",
].join(",");

type ProductLineCardViewRow = {
  product_line_id: number;
  line_name: string;
  primary_category_id: number | null;
  min_price: number | null;
  main_storage_key: string | null;
};

type CategoryMapRow = {
  category_id: number;
  category_name: string;
  slug: string;
};

function mapProductLineCardViewRow(
  row: ProductLineCardViewRow,
  categoryMap: Map<number, CategoryMapRow>,
  slugMap: Map<number, string>,
): HomepageProductCardRow | null {
  const categoryId = Number(row.primary_category_id ?? 0);
  const category = categoryMap.get(categoryId);
  const productLineId = Number(row.product_line_id);
  const productLineSlug = slugMap.get(productLineId);

  if (!category || !productLineSlug) {
    return null;
  }

  return {
    product_line_id: productLineId,
    line_name: String(row.line_name),
    product_line_slug: productLineSlug,
    category_id: Number(category.category_id),
    category_name: String(category.category_name),
    category_slug: String(category.slug),
    price: row.min_price != null ? Number(row.min_price) : null,
    main_storage_key: row.main_storage_key ?? null,
    main_image_alt: null,
    hover_storage_key: row.main_storage_key ?? null,
    hover_image_alt: null,
  };
}

async function getCategoryMapByIds(
  supabase: ReturnType<typeof createAdminClient>,
  categoryIds: number[],
) {
  if (categoryIds.length === 0) {
    return new Map<number, CategoryMapRow>();
  }

  const { data, error } = await supabase
    .schema("catalog")
    .from("category")
    .select("category_id, category_name, slug")
    .in("category_id", categoryIds)
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as unknown) as CategoryMapRow[];
  return new Map(rows.map((row) => [Number(row.category_id), row]));
}

async function getProductLineSlugMapByIds(
  supabase: ReturnType<typeof createAdminClient>,
  productLineIds: number[],
) {
  if (productLineIds.length === 0) {
    return new Map<number, string>();
  }

  const { data, error } = await supabase
    .schema("catalog")
    .from("product_line")
    .select("product_line_id, slug")
    .in("product_line_id", productLineIds);

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as Array<{
    product_line_id: number;
    slug: string | null;
  }>).filter((row) => row.slug);

  return new Map(
    rows.map((row) => [Number(row.product_line_id), String(row.slug)]),
  );
}

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
  const { data: categories, error: categoryError } = await supabase
    .schema("catalog")
    .from("category")
    .select("category_id, category_name, slug")
    .in("slug", categorySlugs)
    .eq("is_active", true);

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  const categoryRows = ((categories ?? []) as unknown) as CategoryMapRow[];
  const categoryIds = categoryRows.map((row) => row.category_id);
  const categoryMap = new Map(
    categoryRows.map((row) => [Number(row.category_id), row]),
  );

  if (categoryIds.length === 0) {
    return categorySlugs.map((categorySlug) => ({
      categoryId: 0,
      categorySlug,
      categoryName: categorySlug,
      products: [],
    }));
  }

  const { data, error } = await supabase
    .schema("catalog")
    .from("v_product_line_card")
    .select(
      "product_line_id, line_name, primary_category_id, min_price, main_storage_key",
    )
    .in("primary_category_id", categoryIds)
    .order("product_line_id", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rawRows = ((data ?? []) as unknown) as ProductLineCardViewRow[];
  const slugMap = await getProductLineSlugMapByIds(
    supabase,
    rawRows.map((row) => Number(row.product_line_id)),
  );
  const rows = rawRows
    .map((row) => mapProductLineCardViewRow(row, categoryMap, slugMap))
    .filter((row): row is HomepageProductCardRow => row !== null);
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
  parentCategorySlug,
  limit = 4,
}: {
  department?: CatalogDepartment;
  parentCategorySlug?: string;
  limit?: number;
} = {}): Promise<HomepageProductSection[]> {
  return unstable_cache(
    () => fetchCategoryProductSections(department, parentCategorySlug, limit),
    [
      "category-product-sections",
      department ?? "all",
      parentCategorySlug ?? "all",
      String(limit),
    ],
    { revalidate: CATALOG_CACHE_TTL_SECONDS, tags: ["catalog"] },
  )();
}

async function fetchCategoryProductSections(
  department: CatalogDepartment | undefined,
  parentCategorySlug: string | undefined,
  limit: number,
): Promise<HomepageProductSection[]> {
  const supabase = createAdminClient();
  let categoryIds: number[] | null = null;

  if (parentCategorySlug) {
    const { data: parentCategory, error: parentCategoryError } = await supabase
      .schema("catalog")
      .from("category")
      .select("category_id")
      .eq("slug", parentCategorySlug)
      .eq("is_active", true)
      .maybeSingle();

    if (parentCategoryError) {
      throw new Error(parentCategoryError.message);
    }

    if (!parentCategory) {
      return [];
    }

    const parentCategoryId = Number(parentCategory.category_id);

    const { data: childCategories, error: childCategoryError } = await supabase
      .schema("catalog")
      .from("category")
      .select("category_id")
      .eq("parent_id", parentCategoryId)
      .eq("is_active", true);

    if (childCategoryError) {
      throw new Error(childCategoryError.message);
    }

    categoryIds = [
      parentCategoryId,
      ...((childCategories ?? []) as CategoryRow[]).map(
        (category) => category.category_id,
      ),
    ];
  } else if (department) {
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
    .from("v_product_line_card")
    .select(
      "product_line_id, line_name, primary_category_id, min_price, main_storage_key",
    )
    .order("product_line_id", { ascending: false });

  if (categoryIds) {
    query = query.in("primary_category_id", categoryIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rawRows = ((data ?? []) as unknown) as ProductLineCardViewRow[];
  const resolvedCategoryIds =
    categoryIds ??
    Array.from(
      new Set(
        rawRows
          .map((row) => Number(row.primary_category_id ?? 0))
          .filter((categoryId) => categoryId > 0),
      ),
    );
  const categoryMap = await getCategoryMapByIds(supabase, resolvedCategoryIds);
  const slugMap = await getProductLineSlugMapByIds(
    supabase,
    rawRows.map((row) => Number(row.product_line_id)),
  );
  const rows = rawRows
    .map((row) => mapProductLineCardViewRow(row, categoryMap, slugMap))
    .filter((row): row is HomepageProductCardRow => row !== null);
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
      const gender = department
        ? GENDER_BY_DEPARTMENT[department]
        : inferGenderFromCategorySlug(firstRow.category_slug);

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

function inferGenderFromCategorySlug(categorySlug: string): Product["gender"] {
  return categorySlug.includes("nam") ? "nam" : "nu";
}

export type CategoryNavItem = {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
};

// Danh sách category thật theo department, dùng cho dropdown menu ở header
// (hover NAM/NỮ hiện category bên dưới).
export async function getCategoriesByDepartment(
  department: CatalogDepartment,
): Promise<CategoryNavItem[]> {
  return unstable_cache(
    () => fetchCategoriesByDepartment(department),
    ["categories-by-department", department],
    { revalidate: CATALOG_CACHE_TTL_SECONDS, tags: ["catalog"] },
  )();
}

async function fetchCategoriesByDepartment(
  department: CatalogDepartment,
): Promise<CategoryNavItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .schema("catalog")
    .from("category")
    .select("category_id, category_name, slug")
    .eq("department", department)
    .eq("is_active", true)
    .order("category_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((category) => ({
    categoryId: Number(category.category_id),
    categoryName: String(category.category_name),
    categorySlug: String(category.slug),
  }));
}

export type CategoryDetail = {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  department: CatalogDepartment | null;
};

// Tra category thật theo slug (dùng cho trang /categories/[slug]) — trước đây
// trang này chỉ nhận diện được slug mock, khiến banner/link dùng slug thật từ
// Supabase bị 404.
export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryDetail | null> {
  return unstable_cache(
    () => fetchCategoryBySlug(slug),
    ["category-by-slug", slug],
    { revalidate: CATALOG_CACHE_TTL_SECONDS, tags: ["catalog"] },
  )();
}

async function fetchCategoryBySlug(slug: string): Promise<CategoryDetail | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .schema("catalog")
    .from("category")
    .select("category_id, category_name, slug, department")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    categoryId: Number(data.category_id),
    categoryName: String(data.category_name),
    categorySlug: String(data.slug),
    department: (data.department as CatalogDepartment | null) ?? null,
  };
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
    .select("category_id, category_name, slug")
    .eq("department", department)
    .eq("is_active", true);

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  const categoryRows = ((categories ?? []) as unknown) as CategoryMapRow[];
  const categoryIds = categoryRows.map((category) => category.category_id);

  if (categoryIds.length === 0) {
    return [];
  }

  const categoryMap = new Map(
    categoryRows.map((row) => [Number(row.category_id), row]),
  );

  const { data, error } = await supabase
    .schema("catalog")
    .from("v_product_line_card")
    .select(
      "product_line_id, line_name, primary_category_id, min_price, main_storage_key",
    )
    .in("primary_category_id", categoryIds)
    .order("product_line_id", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rawRows = ((data ?? []) as unknown) as ProductLineCardViewRow[];
  const slugMap = await getProductLineSlugMapByIds(
    supabase,
    rawRows.map((row) => Number(row.product_line_id)),
  );
  const rows = rawRows
    .map((row) => mapProductLineCardViewRow(row, categoryMap, slugMap))
    .filter((row): row is HomepageProductCardRow => row !== null);
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

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "CUSTOM"];

function sizeRank(sizeName: string) {
  const normalized = sizeName.trim().toUpperCase();
  const index = SIZE_ORDER.indexOf(normalized);
  return index === -1 ? SIZE_ORDER.length : index;
}

export type CategoryFilterOptions = {
  sizes: string[];
  colors: { name: string; hex: string }[];
  materials: string[];
  collections: { name: string; slug: string }[];
  priceMin: number;
  priceMax: number;
};

export type CategoryListing = {
  products: Product[];
  filterOptions: CategoryFilterOptions;
};

// Lấy sản phẩm thật của 1 category kèm bộ lọc (size/màu/chất liệu/bộ sưu tập/giá)
// tổng hợp từ chính dữ liệu thật của các sản phẩm đó — dùng cho trang danh sách
// sản phẩm (/categories/[slug]) để bộ lọc luôn khớp dữ liệu trong DB.
export async function getCategoryListing(
  categorySlug: string,
): Promise<CategoryListing> {
  return unstable_cache(
    () => fetchCategoryListing(categorySlug),
    ["category-listing", categorySlug],
    { revalidate: CATALOG_CACHE_TTL_SECONDS, tags: ["catalog"] },
  )();
}

async function fetchCategoryListing(
  categorySlug: string,
): Promise<CategoryListing> {
  const emptyResult: CategoryListing = {
    products: [],
    filterOptions: {
      sizes: [],
      colors: [],
      materials: [],
      collections: [],
      priceMin: 0,
      priceMax: 0,
    },
  };

  const [section] = await getHomepageProductSections({
    categorySlugs: [categorySlug],
    limit: 200,
  });
  const products = section?.products ?? [];

  if (products.length === 0) {
    return emptyResult;
  }

  const supabase = createAdminClient();
  const productLineIds = products.map((product) => Number(product.id));

  const { data: lineRows, error: lineError } = await supabase
    .schema("catalog")
    .from("product_line")
    .select("product_line_id, color_id, material_id, collection_id")
    .in("product_line_id", productLineIds);

  if (lineError) {
    throw new Error(lineError.message);
  }

  const colorIds = [
    ...new Set(
      (lineRows ?? [])
        .map((row) => row.color_id)
        .filter((id): id is number => typeof id === "number"),
    ),
  ];
  const materialIds = [
    ...new Set(
      (lineRows ?? [])
        .map((row) => row.material_id)
        .filter((id): id is number => typeof id === "number"),
    ),
  ];
  const collectionIds = [
    ...new Set(
      (lineRows ?? [])
        .map((row) => row.collection_id)
        .filter((id): id is number => typeof id === "number"),
    ),
  ];

  const [colorsResult, materialsResult, collectionsResult, componentsResult] =
    await Promise.all([
      colorIds.length
        ? supabase
            .schema("catalog")
            .from("color")
            .select("color_id, color_name, color_code")
            .in("color_id", colorIds)
        : Promise.resolve({ data: [], error: null }),
      materialIds.length
        ? supabase
            .schema("catalog")
            .from("material")
            .select("material_id, material_name")
            .in("material_id", materialIds)
        : Promise.resolve({ data: [], error: null }),
      collectionIds.length
        ? supabase
            .schema("catalog")
            .from("collection")
            .select("collection_id, collection_name, slug")
            .in("collection_id", collectionIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .schema("catalog")
        .from("product_component")
        .select("component_id, product_line_id")
        .in("product_line_id", productLineIds),
    ]);

  if (colorsResult.error) throw new Error(colorsResult.error.message);
  if (materialsResult.error) throw new Error(materialsResult.error.message);
  if (collectionsResult.error) throw new Error(collectionsResult.error.message);
  if (componentsResult.error) throw new Error(componentsResult.error.message);

  const colorMap = new Map(
    (colorsResult.data ?? []).map((row) => [
      Number(row.color_id),
      { name: String(row.color_name), hex: String(row.color_code) },
    ]),
  );
  const materialMap = new Map(
    (materialsResult.data ?? []).map((row) => [
      Number(row.material_id),
      String(row.material_name),
    ]),
  );
  const collectionMap = new Map(
    (collectionsResult.data ?? []).map((row) => [
      Number(row.collection_id),
      { name: String(row.collection_name), slug: String(row.slug) },
    ]),
  );

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
        .select("component_id, size_option_id, price")
        .in("component_id", componentIds)
    : { data: [], error: null };

  if (variantsResult.error) throw new Error(variantsResult.error.message);

  const variants = variantsResult.data ?? [];
  const sizeOptionIds = [
    ...new Set(
      variants
        .map((variant) => variant.size_option_id)
        .filter((id): id is number => typeof id === "number"),
    ),
  ];

  const sizeOptionsResult = sizeOptionIds.length
    ? await supabase
        .schema("catalog")
        .from("size_option")
        .select("size_option_id, size_name")
        .in("size_option_id", sizeOptionIds)
    : { data: [], error: null };

  if (sizeOptionsResult.error) throw new Error(sizeOptionsResult.error.message);

  const sizeNameMap = new Map(
    (sizeOptionsResult.data ?? []).map((row) => [
      Number(row.size_option_id),
      String(row.size_name),
    ]),
  );

  const sizesByLine = new Map<number, Set<string>>();
  const pricesByLine = new Map<number, number[]>();
  for (const variant of variants) {
    const lineId = componentToLine.get(Number(variant.component_id));
    if (lineId === undefined) continue;

    if (variant.size_option_id) {
      const sizeName = sizeNameMap.get(Number(variant.size_option_id));
      if (sizeName) {
        const sizeSet = sizesByLine.get(lineId) ?? new Set<string>();
        sizeSet.add(sizeName);
        sizesByLine.set(lineId, sizeSet);
      }
    }

    const priceList = pricesByLine.get(lineId) ?? [];
    priceList.push(Number(variant.price));
    pricesByLine.set(lineId, priceList);
  }

  const lineInfoMap = new Map(
    (lineRows ?? []).map((row) => [Number(row.product_line_id), row]),
  );

  const enrichedProducts: Product[] = products.map((product) => {
    const lineId = Number(product.id);
    const lineInfo = lineInfoMap.get(lineId);
    const color =
      lineInfo?.color_id !== null && lineInfo?.color_id !== undefined
        ? colorMap.get(Number(lineInfo.color_id))
        : undefined;
    const materialName =
      lineInfo?.material_id !== null && lineInfo?.material_id !== undefined
        ? materialMap.get(Number(lineInfo.material_id))
        : undefined;
    const collection =
      lineInfo?.collection_id !== null && lineInfo?.collection_id !== undefined
        ? collectionMap.get(Number(lineInfo.collection_id))
        : undefined;
    const sizes = [...(sizesByLine.get(lineId) ?? [])].sort(
      (a, b) => sizeRank(a) - sizeRank(b),
    );
    const prices = pricesByLine.get(lineId) ?? [];

    return {
      ...product,
      sizes: sizes.length > 0 ? sizes : product.sizes,
      colors: color ? [color] : product.colors,
      materialName,
      collectionSlug: collection?.slug ?? product.collectionSlug,
      collectionName: collection?.name,
      price: prices.length > 0 ? Math.min(...prices) : product.price,
    };
  });

  const allSizes = new Set<string>();
  const allColors = new Map<string, string>();
  const allMaterials = new Set<string>();
  const allCollections = new Map<string, string>();
  let priceMin = Infinity;
  let priceMax = 0;

  for (const product of enrichedProducts) {
    product.sizes.forEach((size) => allSizes.add(size));
    product.colors.forEach((color) => allColors.set(color.name, color.hex));
    if (product.materialName) allMaterials.add(product.materialName);
    if (product.collectionSlug && product.collectionName) {
      allCollections.set(product.collectionSlug, product.collectionName);
    }
    priceMin = Math.min(priceMin, product.price);
    priceMax = Math.max(priceMax, product.price);
  }

  return {
    products: enrichedProducts,
    filterOptions: {
      sizes: [...allSizes].sort((a, b) => sizeRank(a) - sizeRank(b)),
      colors: [...allColors].map(([name, hex]) => ({ name, hex })),
      materials: [...allMaterials],
      collections: [...allCollections].map(([slug, name]) => ({ name, slug })),
      priceMin: Number.isFinite(priceMin) ? priceMin : 0,
      priceMax,
    },
  };
}

// Tổng hợp filter options trực tiếp từ 1 danh sách Product đã có sẵn (không
// query lại DB) — dùng cho các trang không đi qua getCategoryListing (vd:
// /products khi lọc theo bộ sưu tập).
export function deriveFilterOptionsFromProducts(
  products: Product[],
): CategoryFilterOptions {
  const allSizes = new Set<string>();
  const allColors = new Map<string, string>();
  const allMaterials = new Set<string>();
  const allCollections = new Map<string, string>();
  let priceMin = Infinity;
  let priceMax = 0;

  for (const product of products) {
    product.sizes.forEach((size) => allSizes.add(size));
    product.colors.forEach((color) => allColors.set(color.name, color.hex));
    if (product.materialName) allMaterials.add(product.materialName);
    if (product.collectionSlug && product.collectionName) {
      allCollections.set(product.collectionSlug, product.collectionName);
    }
    priceMin = Math.min(priceMin, product.price);
    priceMax = Math.max(priceMax, product.price);
  }

  return {
    sizes: [...allSizes].sort((a, b) => sizeRank(a) - sizeRank(b)),
    colors: [...allColors].map(([name, hex]) => ({ name, hex })),
    materials: [...allMaterials],
    collections: [...allCollections].map(([slug, name]) => ({ name, slug })),
    priceMin: Number.isFinite(priceMin) ? priceMin : 0,
    priceMax,
  };
}
