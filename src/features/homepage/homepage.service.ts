import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-policy";
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
const PRODUCT_CARD_VIEW_NAME = "v_product_line_card";
const COLLECTION_VERTICAL_COVER_FILE = "cover.webp";

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
  "slug",
  "primary_category_id",
  "primary_category_name",
  "min_price",
  "main_storage_key",
].join(",");

type ProductCardViewRow = {
  product_line_id: number;
  line_name: string;
  slug: string;
  primary_category_id: number | null;
  primary_category_name: string | null;
  min_price: number | null;
  main_storage_key: string | null;
};
export type CatalogDepartment = "WOMEN" | "MEN" | "KIDS";

type CategoryRow = {
  category_id: number;
  category_name: string;
  slug: string;
};

const GENDER_BY_DEPARTMENT: Record<CatalogDepartment, Product["gender"]> = {
  WOMEN: "nu",
  MEN: "nam",
  KIDS: "tre-em",
};

async function getCategoryLookupByIds(
  supabase: ReturnType<typeof createAdminClient>,
  categoryIds: number[],
) {
  if (categoryIds.length === 0) {
    return new Map<number, CategoryRow>();
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

  return new Map(
    ((data ?? []) as CategoryRow[]).map((category) => [
      category.category_id,
      category,
    ]),
  );
}

async function getHomepageProductCardRows(
  supabase: ReturnType<typeof createAdminClient>,
  categoryIds?: number[],
): Promise<HomepageProductCardRow[]> {
  let query = supabase
    .schema("catalog")
    .from(PRODUCT_CARD_VIEW_NAME)
    .select(PRODUCT_CARD_COLUMNS)
    .order("product_line_id", { ascending: false });

  if (categoryIds && categoryIds.length > 0) {
    query = query.in("primary_category_id", categoryIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as unknown) as ProductCardViewRow[];
  const categoryLookup = await getCategoryLookupByIds(
    supabase,
    rows
      .map((row) => row.primary_category_id)
      .filter((categoryId): categoryId is number => categoryId !== null),
  );

  return rows
    .map((row): HomepageProductCardRow | null => {
      if (row.primary_category_id === null) {
        return null;
      }

      const category = categoryLookup.get(row.primary_category_id);
      if (!category) {
        return null;
      }

      return {
        product_line_id: row.product_line_id,
        line_name: row.line_name,
        product_line_slug: row.slug,
        category_id: category.category_id,
        category_name: category.category_name,
        category_slug: category.slug,
        price: row.min_price,
        main_storage_key: row.main_storage_key,
        hover_storage_key: row.main_storage_key
          ? row.main_storage_key.substring(0, row.main_storage_key.lastIndexOf("/") + 1) +
            "gallery-01" +
            row.main_storage_key.substring(row.main_storage_key.lastIndexOf("."))
          : null,
      };
    })
    .filter((row): row is HomepageProductCardRow => row !== null);
}

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
    {
      revalidate: CATALOG_CACHE_TTL_SECONDS,
      tags: [CACHE_TAGS.homepage, CACHE_TAGS.categories, CACHE_TAGS.products],
    },
  )();
}

async function getProductLinesStockStatus(
  supabase: ReturnType<typeof createAdminClient>,
  productLineIds: number[],
): Promise<Map<number, boolean>> {
  const stockStatusMap = new Map<number, boolean>();
  if (productLineIds.length === 0) return stockStatusMap;

  // Set default to false for all input IDs
  productLineIds.forEach((id) => stockStatusMap.set(id, false));

  // 1. Get components for these product lines
  const { data: components, error: compError } = await supabase
    .schema("catalog")
    .from("product_component")
    .select("component_id, product_line_id")
    .in("product_line_id", productLineIds);

  if (compError || !components || components.length === 0) {
    return stockStatusMap;
  }

  const componentIds = components.map((c) => Number(c.component_id));

  // 2. Get active variants for these components
  const { data: variants, error: varError } = await supabase
    .schema("catalog")
    .from("product_variant")
    .select("variant_id, component_id, size_option_id")
    .eq("status", "ACTIVE")
    .in("component_id", componentIds);

  if (varError || !variants || variants.length === 0) {
    return stockStatusMap;
  }

  const variantIds = variants.map((v) => Number(v.variant_id));

  // 3. Get total inventory quantity per variant (sum across branches)
  const { data: inventory, error: invError } = await supabase
    .schema("inventory")
    .from("inventory")
    .select("variant_id, quantity")
    .in("variant_id", variantIds);

  if (invError || !inventory) {
    return stockStatusMap;
  }

  // Map variant_id to total quantity
  const variantQuantities = new Map<number, number>();
  for (const item of inventory) {
    const vId = Number(item.variant_id);
    variantQuantities.set(vId, (variantQuantities.get(vId) ?? 0) + Number(item.quantity));
  }

  // Map component_id to product_line_id
  const compToLine = new Map<number, number>();
  for (const c of components) {
    compToLine.set(Number(c.component_id), Number(c.product_line_id));
  }

  // List of required components for each product line
  const lineComponents = new Map<number, Set<number>>();
  for (const c of components) {
    const pId = Number(c.product_line_id);
    if (!lineComponents.has(pId)) {
      lineComponents.set(pId, new Set());
    }
    lineComponents.get(pId)!.add(Number(c.component_id));
  }

  // Group variants by product line and size_option_id
  const lineSizeStock = new Map<number, Map<number, Set<number>>>();

  for (const v of variants) {
    const compId = Number(v.component_id);
    const pId = compToLine.get(compId);
    if (pId === undefined) continue;

    const sizeOptId = v.size_option_id ? Number(v.size_option_id) : 0;
    const qty = variantQuantities.get(Number(v.variant_id)) ?? 0;

    if (qty > 0) {
      if (!lineSizeStock.has(pId)) {
        lineSizeStock.set(pId, new Map());
      }
      const sizeMap = lineSizeStock.get(pId)!;
      if (!sizeMap.has(sizeOptId)) {
        sizeMap.set(sizeOptId, new Set());
      }
      sizeMap.get(sizeOptId)!.add(compId);
    }
  }

  // Check if at least one size has ALL required components in stock
  for (const pId of productLineIds) {
    const requiredComps = lineComponents.get(pId) ?? new Set<number>();
    const sizeMap = lineSizeStock.get(pId);
    let inStock = false;

    if (sizeMap && requiredComps.size > 0) {
      for (const stockedComps of sizeMap.values()) {
        let allRequiredStocked = true;
        for (const reqCompId of requiredComps) {
          if (!stockedComps.has(reqCompId)) {
            allRequiredStocked = false;
            break;
          }
        }
        if (allRequiredStocked) {
          inStock = true;
          break;
        }
      }
    }

    stockStatusMap.set(pId, inStock);
  }

  return stockStatusMap;
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

  const categoryRows = ((categories ?? []) as unknown) as CategoryRow[];
  
  if (categoryRows.length === 0) {
    return categorySlugs.map((categorySlug) => ({
      categoryId: 0,
      categorySlug,
      categoryName: categorySlug,
      products: [],
    }));
  }

  // Build a map of categoryId -> parent requested slug, expanding descendants recursively up to 3 levels
  const categoryToParentSlug = new Map<number, string>();
  for (const cat of categoryRows) {
    categoryToParentSlug.set(cat.category_id, cat.slug);
    
    // Level 1 subcategories
    const { data: sub1 } = await supabase
      .schema("catalog")
      .from("category")
      .select("category_id")
      .eq("parent_id", cat.category_id)
      .eq("is_active", true);
    
    const sub1Ids = (sub1 ?? []).map((c) => c.category_id);
    for (const id of sub1Ids) {
      categoryToParentSlug.set(id, cat.slug);
    }
    
    if (sub1Ids.length > 0) {
      // Level 2 subcategories
      const { data: sub2 } = await supabase
        .schema("catalog")
        .from("category")
        .select("category_id")
        .in("parent_id", sub1Ids)
        .eq("is_active", true);
      
      const sub2Ids = (sub2 ?? []).map((c) => c.category_id);
      for (const id of sub2Ids) {
        categoryToParentSlug.set(id, cat.slug);
      }
    }
  }

  const expandedCategoryIds = Array.from(categoryToParentSlug.keys());

  const rows = await getHomepageProductCardRows(supabase, expandedCategoryIds);
  const productLineIds = [...new Set(rows.map((row) => Number(row.product_line_id)))];
  const stockStatusMap = await getProductLinesStockStatus(supabase, productLineIds);

  const sortedRows = [...rows].sort((a, b) => {
    const aStock = stockStatusMap.get(Number(a.product_line_id)) ? 1 : 0;
    const bStock = stockStatusMap.get(Number(b.product_line_id)) ? 1 : 0;
    return bStock - aStock;
  });
  
  const rowsByCategory = new Map<string, HomepageProductCardRow[]>();

  sortedRows.forEach((row) => {
    const parentSlug = categoryToParentSlug.get(row.category_id) ?? row.category_slug;
    const currentRows = rowsByCategory.get(parentSlug) ?? [];
    if (currentRows.length < limit) {
      currentRows.push(row);
      rowsByCategory.set(parentSlug, currentRows);
    }
  });

  console.info("[homepage] product sections rows", {
    categorySlugs,
    slugs: rows.map((row) => row.product_line_slug),
  });

  return categorySlugs.map((categorySlug) => {
    const sectionRows = rowsByCategory.get(categorySlug) ?? [];
    const category = categoryRows.find((item) => item.slug === categorySlug);

    return {
      categoryId: category?.category_id ?? sectionRows[0]?.category_id ?? 0,
      categorySlug,
      categoryName:
        categorySlug === "ao-dai-doi-cuoi"
          ? "Áo dài đôi - Cưới"
          : category?.category_name ?? sectionRows[0]?.category_name ?? categorySlug,
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

export type HomepageCustomSectionDto = {
  categorySlug: string;
  categoryName: string;
  bannerImage: string;
  products: Product[];
};

export async function getHomepageCustomSections({
  limit = 4,
}: {
  limit?: number;
} = {}): Promise<HomepageCustomSectionDto[]> {
  return unstable_cache(
    () => fetchHomepageCustomSections(limit),
    ["homepage-custom-sections", String(limit)],
    { revalidate: CATALOG_CACHE_TTL_SECONDS, tags: ["catalog"] }
  )();
}

async function fetchHomepageCustomSections(limit: number): Promise<HomepageCustomSectionDto[]> {
  const supabase = createAdminClient();
  const { data: allCategories, error: categoryError } = await supabase
    .schema("catalog")
    .from("category")
    .select("category_id, category_name, slug, parent_id")
    .eq("is_active", true);

  if (categoryError || !allCategories) {
    throw new Error(categoryError?.message ?? "Failed to fetch categories");
  }

  const getDescendantsAndSelf = (rootSlug: string) => {
    const root = allCategories.find((c) => c.slug === rootSlug);
    if (!root) return [];
    const result = [root];
    let searchIds = [root.category_id];
    while (searchIds.length > 0) {
      const children = allCategories.filter((c) => c.parent_id && searchIds.includes(c.parent_id));
      if (children.length === 0) break;
      result.push(...children);
      searchIds = children.map((c) => c.category_id);
    }
    return result;
  };

  const damVayCats = getDescendantsAndSelf("ao-dam-chan-vay");
  const damVayIds = damVayCats.map((c) => c.category_id);

  const doiCuoiCats = [
    ...getDescendantsAndSelf("ao-dai-doi"),
    ...getDescendantsAndSelf("ao-dai-cuoi-nu"),
    ...getDescendantsAndSelf("ao-dai-cuoi-nam"),
  ];
  const doiCuoiIds = doiCuoiCats.map((c) => c.category_id);

  const allAoDaiCats = getDescendantsAndSelf("ao-dai");
  const aoDaiCats = allAoDaiCats.filter((c) => !doiCuoiIds.includes(c.category_id));
  const aoDaiIds = aoDaiCats.map((c) => c.category_id);

  const sectionsDefine = [
    {
      categorySlug: "ao-dam-chan-vay",
      categoryName: "Áo đầm - Váy",
      bannerImage: "/images/home-page/ÁO ĐẦM - VÁY.png",
      categoryIds: damVayIds,
    },
    {
      categorySlug: "ao-dai",
      categoryName: "Áo dài",
      bannerImage: "/images/home-page/ÁO DÀI.png",
      categoryIds: aoDaiIds,
    },
    {
      categorySlug: "ao-dai-doi-cuoi",
      categoryName: "Áo dài đôi - Cưới",
      bannerImage: "/images/home-page/ÁO DÀI ĐÔI - ÁO DÀI CƯỚI.png",
      categoryIds: doiCuoiIds,
    },
  ];

  const result: HomepageCustomSectionDto[] = [];

  for (const def of sectionsDefine) {
    if (def.categoryIds.length === 0) {
      result.push({
        categorySlug: def.categorySlug,
        categoryName: def.categoryName,
        bannerImage: def.bannerImage,
        products: [],
      });
      continue;
    }

    const rows = await getHomepageProductCardRows(supabase, def.categoryIds);
    const productLineIds = [...new Set(rows.map((row) => Number(row.product_line_id)))];
    const stockStatusMap = await getProductLinesStockStatus(supabase, productLineIds);

    const sortedRows = [...rows].sort((a, b) => {
      return Number(b.product_line_id) - Number(a.product_line_id);
    });

    const products = sortedRows.slice(0, limit).map((row) =>
      mapHomepageRowToProduct(
        row,
        getProductMediaPublicUrl(supabase, row.main_storage_key),
        getProductMediaPublicUrl(supabase, row.hover_storage_key),
        row.category_slug.includes("nam") ? "nam" : "nu"
      )
    );

    result.push({
      categorySlug: def.categorySlug,
      categoryName: def.categoryName,
      bannerImage: def.bannerImage,
      products,
    });
  }

  return result;
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
    {
      revalidate: CATALOG_CACHE_TTL_SECONDS,
      tags: [CACHE_TAGS.categories, CACHE_TAGS.products],
    },
  )();
}

async function fetchCategoryProductSections(
  department: CatalogDepartment | undefined,
  parentCategorySlug: string | undefined,
  limit: number,
): Promise<HomepageProductSection[]> {
  const supabase = createAdminClient();
  let categoryRows: CategoryRow[] | null = null;

  if (parentCategorySlug) {
    const { data: parentCategory, error: parentCategoryError } = await supabase
      .schema("catalog")
      .from("category")
      .select("category_id, category_name, slug")
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
      .select("category_id, category_name, slug")
      .eq("parent_id", parentCategoryId)
      .eq("is_active", true);

    if (childCategoryError) {
      throw new Error(childCategoryError.message);
    }

    categoryRows = [
      parentCategory as CategoryRow,
      ...((childCategories ?? []) as CategoryRow[]),
    ];
  } else if (department) {
    const { data: categories, error: categoryError } = await supabase
      .schema("catalog")
      .from("category")
      .select("category_id, category_name, slug")
      .eq("department", department)
      .eq("is_active", true);

    if (categoryError) {
      throw new Error(categoryError.message);
    }

    categoryRows = (categories ?? []) as CategoryRow[];

    if (categoryRows.length === 0) {
      return [];
    }
  }

  const rows = await getHomepageProductCardRows(
    supabase,
    categoryRows?.map((category) => category.category_id),
  );
  const productLineIds = [...new Set(rows.map((row) => Number(row.product_line_id)))];
  const stockStatusMap = await getProductLinesStockStatus(supabase, productLineIds);

  const sortedRows = [...rows].sort((a, b) => {
    const aStock = stockStatusMap.get(Number(a.product_line_id)) ? 1 : 0;
    const bStock = stockStatusMap.get(Number(b.product_line_id)) ? 1 : 0;
    return bStock - aStock;
  });
  const rowsByCategory = new Map<number, HomepageProductCardRow[]>();

  sortedRows.forEach((row) => {
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
  parentId?: number | null;
};

// Danh sách category thật theo department, dùng cho dropdown menu ở header
// (hover NAM/NỮ hiện category bên dưới).
export async function getCategoriesByDepartment(
  department: CatalogDepartment,
): Promise<CategoryNavItem[]> {
  return unstable_cache(
    () => fetchCategoriesByDepartment(department),
    ["categories-by-department", department],
    { revalidate: CATALOG_CACHE_TTL_SECONDS, tags: [CACHE_TAGS.categories] },
  )();
}

async function fetchCategoriesByDepartment(
  department: CatalogDepartment,
): Promise<CategoryNavItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .schema("catalog")
    .from("category")
    .select("category_id, category_name, slug, parent_id")
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
    parentId: category.parent_id ? Number(category.parent_id) : null,
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
    { revalidate: CATALOG_CACHE_TTL_SECONDS, tags: [CACHE_TAGS.categories] },
  )();
}

async function fetchCategoryBySlug(slug: string): Promise<CategoryDetail | null> {
  if (slug === "nu" || slug === "nam" || slug === "tre-em") {
    const dept = slug === "tre-em" ? "KIDS" : slug === "nam" ? "MEN" : "WOMEN";
    return {
      categoryId: dept === "WOMEN" ? 8888 : dept === "MEN" ? 8889 : 8890,
      categoryName: dept === "WOMEN" ? "Đồ Nữ" : dept === "MEN" ? "Đồ Nam" : "Đồ Trẻ Em",
      categorySlug: slug,
      department: dept,
    };
  }
  if (slug === "ao-dai-doi-cuoi") {
    return {
      categoryId: 9999,
      categoryName: "Áo dài đôi - Cưới",
      categorySlug: "ao-dai-doi-cuoi",
      department: null,
    };
  }
  const supabase = createAdminClient();
  const dbSlug = slug === "ao-dam-vay" ? "ao-dam-chan-vay" : slug;
  const { data, error } = await supabase
    .schema("catalog")
    .from("category")
    .select("category_id, category_name, slug, department")
    .eq("slug", dbSlug)
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
    {
      revalidate: CATALOG_CACHE_TTL_SECONDS,
      tags: [CACHE_TAGS.products, CACHE_TAGS.categories],
    },
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

  const categoryRows = ((categories ?? []) as unknown) as CategoryRow[];
  const categoryIds = categoryRows.map((category) => category.category_id);

  if (categoryIds.length === 0) {
    return [];
  }

  const rows = await getHomepageProductCardRows(supabase, categoryIds);
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

async function resolveCatalogCategoryIds(
  supabase: ReturnType<typeof createAdminClient>,
  department: CatalogDepartment | undefined,
  parentCategorySlug: string | undefined,
): Promise<number[]> {
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

    return [parentCategoryId, ...(childCategories ?? []).map((c) => Number(c.category_id))];
  }

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

    return (categories ?? []).map((c) => Number(c.category_id));
  }

  return [];
}

async function getUniqueProductCardRows(
  supabase: ReturnType<typeof createAdminClient>,
  categoryIds: number[],
): Promise<HomepageProductCardRow[]> {
  const rows = await getHomepageProductCardRows(supabase, categoryIds);
  const uniqueRowsMap = new Map<number, HomepageProductCardRow>();
  for (const row of rows) {
    if (!uniqueRowsMap.has(row.product_line_id)) {
      uniqueRowsMap.set(row.product_line_id, row);
    }
  }
  return [...uniqueRowsMap.values()];
}

// "Sản phẩm mới" thật sự dựa theo product_line.created_at, quét toàn bộ
// department/danh mục thay vì chỉ trong tập sản phẩm đã bị giới hạn sẵn.
export async function getCatalogNewestProducts({
  department,
  parentCategorySlug,
  limit = 4,
}: {
  department?: CatalogDepartment;
  parentCategorySlug?: string;
  limit?: number;
}): Promise<Product[]> {
  return unstable_cache(
    () => fetchCatalogNewestProducts(department, parentCategorySlug, limit),
    ["catalog-newest-products", department ?? "all", parentCategorySlug ?? "all", String(limit)],
    {
      revalidate: CATALOG_CACHE_TTL_SECONDS,
      tags: [CACHE_TAGS.categories, CACHE_TAGS.products],
    },
  )();
}

async function fetchCatalogNewestProducts(
  department: CatalogDepartment | undefined,
  parentCategorySlug: string | undefined,
  limit: number,
): Promise<Product[]> {
  const supabase = createAdminClient();
  const categoryIds = await resolveCatalogCategoryIds(supabase, department, parentCategorySlug);
  if (categoryIds.length === 0) {
    return [];
  }

  const uniqueRows = await getUniqueProductCardRows(supabase, categoryIds);
  const productLineIds = uniqueRows.map((row) => Number(row.product_line_id));
  if (productLineIds.length === 0) {
    return [];
  }

  const { data: lineRows, error: lineError } = await supabase
    .schema("catalog")
    .from("product_line")
    .select("product_line_id, created_at")
    .in("product_line_id", productLineIds);

  if (lineError) {
    throw new Error(lineError.message);
  }

  const createdAtMap = new Map(
    (lineRows ?? []).map((row) => [Number(row.product_line_id), String(row.created_at)]),
  );

  const sortedRows = [...uniqueRows].sort((a, b) => {
    const aTime = new Date(createdAtMap.get(Number(a.product_line_id)) ?? 0).getTime();
    const bTime = new Date(createdAtMap.get(Number(b.product_line_id)) ?? 0).getTime();
    return bTime - aTime;
  });

  return sortedRows.slice(0, limit).map((row) =>
    mapHomepageRowToProduct(
      row,
      getProductMediaPublicUrl(supabase, row.main_storage_key),
      getProductMediaPublicUrl(supabase, row.hover_storage_key),
      department ? GENDER_BY_DEPARTMENT[department] : inferGenderFromCategorySlug(row.category_slug),
    ),
  );
}

// "Bán chạy nhất" thật sự dựa theo tổng số lượng bán từ đơn COMPLETED
// (catalog.v_product_line_sales), quét toàn bộ department/danh mục.
export async function getCatalogBestSellingProducts({
  department,
  parentCategorySlug,
  limit = 4,
}: {
  department?: CatalogDepartment;
  parentCategorySlug?: string;
  limit?: number;
}): Promise<Product[]> {
  return unstable_cache(
    () => fetchCatalogBestSellingProducts(department, parentCategorySlug, limit),
    ["catalog-bestselling-products", department ?? "all", parentCategorySlug ?? "all", String(limit)],
    {
      revalidate: CATALOG_CACHE_TTL_SECONDS,
      tags: [CACHE_TAGS.categories, CACHE_TAGS.products],
    },
  )();
}

async function fetchCatalogBestSellingProducts(
  department: CatalogDepartment | undefined,
  parentCategorySlug: string | undefined,
  limit: number,
): Promise<Product[]> {
  const supabase = createAdminClient();
  const categoryIds = await resolveCatalogCategoryIds(supabase, department, parentCategorySlug);
  if (categoryIds.length === 0) {
    return [];
  }

  const uniqueRows = await getUniqueProductCardRows(supabase, categoryIds);
  const productLineIds = uniqueRows.map((row) => Number(row.product_line_id));
  if (productLineIds.length === 0) {
    return [];
  }

  const { data: salesRows, error: salesError } = await supabase
    .schema("catalog")
    .from("v_product_line_sales")
    .select("product_line_id, sold_quantity")
    .in("product_line_id", productLineIds);

  if (salesError) {
    throw new Error(salesError.message);
  }

  const soldQuantityMap = new Map(
    (salesRows ?? []).map((row) => [Number(row.product_line_id), Number(row.sold_quantity ?? 0)]),
  );

  const sortedRows = uniqueRows
    .filter((row) => (soldQuantityMap.get(Number(row.product_line_id)) ?? 0) > 0)
    .sort((a, b) => {
      const diff =
        (soldQuantityMap.get(Number(b.product_line_id)) ?? 0) -
        (soldQuantityMap.get(Number(a.product_line_id)) ?? 0);
      return diff !== 0 ? diff : Number(b.product_line_id) - Number(a.product_line_id);
    });

  return sortedRows.slice(0, limit).map((row) =>
    mapHomepageRowToProduct(
      row,
      getProductMediaPublicUrl(supabase, row.main_storage_key),
      getProductMediaPublicUrl(supabase, row.hover_storage_key),
      department ? GENDER_BY_DEPARTMENT[department] : inferGenderFromCategorySlug(row.category_slug),
    ),
  );
}

export async function getHomepageCollections({
  limit = 5,
  coverVariant = "horizontal",
}: {
  limit?: number;
  coverVariant?: "horizontal" | "vertical";
} = {}): Promise<Collection[]> {
  return unstable_cache(
    () => fetchHomepageCollections(limit, coverVariant),
    ["homepage-collections", String(limit), coverVariant],
    {
      revalidate: CATALOG_CACHE_TTL_SECONDS,
      tags: [CACHE_TAGS.homepage, CACHE_TAGS.collections],
    },
  )();
}

async function fetchHomepageCollections(
  limit: number,
  coverVariant: "horizontal" | "vertical",
): Promise<Collection[]> {
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
      coverVariant === "vertical"
        ? findCollectionVerticalCoverStorageKey(supabase, row.media?.storage_key)
        : findCollectionCoverNgangStorageKey(supabase, row.media?.storage_key),
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
    hasPreferredCover: Boolean(coverStorageKeys[index]),
  }));

  const prioritizedCollections = collections.some((item) => item.hasPreferredCover)
    ? [
        ...collections.filter((item) => item.hasPreferredCover),
        ...collections.filter((item) => !item.hasPreferredCover),
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

async function findCollectionVerticalCoverStorageKey(
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

  const verticalCoverFile = data?.find(
    (file) => file.name.toLowerCase() === COLLECTION_VERTICAL_COVER_FILE,
  );

  return verticalCoverFile ? `${folder}/${verticalCoverFile.name}` : null;
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
  categories: { name: string; slug: string }[];
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
    {
      revalidate: CATALOG_CACHE_TTL_SECONDS,
      tags: [CACHE_TAGS.categories, CACHE_TAGS.products],
    },
  )();
}

async function fetchCategoryListing(
  categorySlug: string,
): Promise<CategoryListing> {
  const emptyResult: CategoryListing = {
    products: [],
    filterOptions: {
      categories: [],
      sizes: [],
      colors: [],
      materials: [],
      collections: [],
      priceMin: 0,
      priceMax: 0,
    },
  };

  const normalizedSlug = categorySlug === "ao-dam-vay" ? "ao-dam-chan-vay" : categorySlug;
  let products: Product[] = [];
  if (normalizedSlug === "nu" || normalizedSlug === "nam" || normalizedSlug === "tre-em") {
    const dept = normalizedSlug === "tre-em" ? "KIDS" : normalizedSlug === "nam" ? "MEN" : "WOMEN";
    const supabase = createAdminClient();
    const { data: deptCats } = await supabase
      .schema("catalog")
      .from("category")
      .select("slug")
      .eq("department", dept)
      .eq("is_active", true);

    const slugs = (deptCats ?? []).map((c) => c.slug);
    const sections = await getHomepageProductSections({
      categorySlugs: slugs,
      limit: 200,
    });
    products = sections.flatMap((s) => s.products);
  } else if (normalizedSlug === "ao-dai-doi-cuoi" || normalizedSlug === "ao-dam-chan-vay" || normalizedSlug === "ao-dai") {
    const customSections = await fetchHomepageCustomSections(200);
    const section = customSections.find((s) => s.categorySlug === normalizedSlug);
    products = section?.products ?? [];
  } else {
    const [section] = await getHomepageProductSections({
      categorySlugs: [normalizedSlug],
      limit: 200,
    });
    products = section?.products ?? [];
  }

  console.info("[category-listing] products", {
    categorySlug,
    productSlugs: products.map((product) => product.slug),
  });

  if (products.length === 0) {
    return emptyResult;
  }

  const supabase = createAdminClient();
  const productLineIds = products.map((product) => Number(product.id));

  const { data: lineRows, error: lineError } = await supabase
    .schema("catalog")
    .from("product_line")
    .select("product_line_id, color_id, material_id, collection_id, created_at")
    .in("product_line_id", productLineIds);

  if (lineError) {
    throw new Error(lineError.message);
  }

  const { data: salesRows, error: salesError } = await supabase
    .schema("catalog")
    .from("v_product_line_sales")
    .select("product_line_id, sold_quantity")
    .in("product_line_id", productLineIds);

  if (salesError) {
    throw new Error(salesError.message);
  }

  const soldQuantityMap = new Map(
    (salesRows ?? []).map((row) => [Number(row.product_line_id), Number(row.sold_quantity ?? 0)]),
  );

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
      createdAt: lineInfo?.created_at ? String(lineInfo.created_at) : undefined,
      soldQuantity: soldQuantityMap.get(lineId) ?? 0,
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

  const { data: catList } = await supabase
    .schema("catalog")
    .from("category")
    .select("category_name, slug")
    .eq("is_active", true);

  const catMap = new Map((catList ?? []).map((c) => [c.slug, c.category_name]));
  const uniqueCategorySlugs = new Set(
    enrichedProducts.map((p) => p.categorySlug).filter(Boolean),
  );
  const categoriesList = [...uniqueCategorySlugs]
    .map((slug) => ({
      slug,
      name: catMap.get(slug) ?? slug,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    products: enrichedProducts,
    filterOptions: {
      categories: categoriesList,
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
  const allCategories = new Map<string, string>();
  let priceMin = Infinity;
  let priceMax = 0;

  const categoryNameMap: Record<string, string> = {
    "ao-dam-vay": "Áo đầm - Váy",
    "ao-dam-chan-vay": "Áo đầm - Váy",
    "ao-dai-nu": "Áo dài nữ",
    "ao-cuoi-nu": "Áo cưới nữ",
    "ao-dai-doi-cuoi": "Áo dài đôi - Cưới",
    "ao-nam": "Áo nam",
    "ao-dai-nam": "Áo dài nam",
    "ao-cuoi-nam": "Áo cưới nam",
    "ao-dai": "Áo dài",
    "nu": "Đồ Nữ",
    "nam": "Đồ Nam",
    "tre-em": "Đồ Trẻ Em",

    // Các slug từ Database
    "ao-dai-suong-tay-loe-dai": "Áo dài suông tay loe dài",
    "ao-dai-4-ta": "Áo dài 4 tà",
    "ao-so-mi": "Áo sơ mi",
    "ao-choang": "Áo choàng",
    "quan": "Quần",
    "dam-da-hoi": "Đầm dạ hội",
    "dam-dao-pho": "Đầm dạo phố",
    "dam-2-day": "Đầm 2 dây",
    "ao-dai-cuoi-nu": "Áo dài cưới nữ",
    "ao-dai-cuoi-nam": "Áo dài cưới nam",
    "ao-yem": "Áo yếm",
    "dam-dai": "Đầm dài",
    "chan-vay": "Chân váy",
    "ao-dai-cuc-lech": "Áo dài cúc lệch",
    "ao-dai-ngan-cuc-lech": "Áo dài ngắn cúc lệch",
    "ao-dai-ngan-cuc-lenh": "Áo dài ngắn cúc lệch",
    "ao-dai-ngan-cuc-thang": "Áo dài ngắn cúc thẳng",
    "ao-dai-vat-cheo": "Áo dài vạt chéo",
    "ao-khoac": "Áo khoác",
    "ao-phong": "Áo phông",
    "vay-cuoi": "Váy cưới"
  };

  for (const product of products) {
    product.sizes.forEach((size) => allSizes.add(size));
    product.colors.forEach((color) => allColors.set(color.name, color.hex));
    if (product.materialName) allMaterials.add(product.materialName);
    if (product.collectionSlug && product.collectionName) {
      allCollections.set(product.collectionSlug, product.collectionName);
    }
    const slug = product.categorySlug;
    if (slug) {
      const name = categoryNameMap[slug] || (slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "));
      allCategories.set(slug, name);
    }
    priceMin = Math.min(priceMin, product.price);
    priceMax = Math.max(priceMax, product.price);
  }

  return {
    categories: [...allCategories].map(([slug, name]) => ({ slug, name })),
    sizes: [...allSizes].sort((a, b) => sizeRank(a) - sizeRank(b)),
    colors: [...allColors].map(([name, hex]) => ({ name, hex })),
    materials: [...allMaterials],
    collections: [...allCollections].map(([slug, name]) => ({ name, slug })),
    priceMin: Number.isFinite(priceMin) ? priceMin : 0,
    priceMax,
  };
}
