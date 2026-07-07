import {
  getHomepageCollections,
  getHomepageProductSections,
} from "@/features/homepage/homepage.service";
import { fail, ok } from "@/lib/api-response";

const DEFAULT_PRODUCT_LIMIT = 4;
const DEFAULT_COLLECTION_LIMIT = 5;
const MAX_LIMIT = 12;

function parseCategorySlugs(searchParams: URLSearchParams) {
  return (
    searchParams
      .get("category_slugs")
      ?.split(",")
      .map((slug) => slug.trim())
      .filter(Boolean) ?? []
  );
}

function parseLimit(searchParams: URLSearchParams, param: string, fallback: number) {
  const rawLimit = searchParams.get(param);

  if (!rawLimit) {
    return fallback;
  }

  const limit = Number(rawLimit);

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return null;
  }

  return limit;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlugs = parseCategorySlugs(searchParams);
  const productLimit = parseLimit(
    searchParams,
    "product_limit",
    DEFAULT_PRODUCT_LIMIT,
  );
  const collectionLimit = parseLimit(
    searchParams,
    "collection_limit",
    DEFAULT_COLLECTION_LIMIT,
  );

  if (productLimit === null || collectionLimit === null) {
    return fail(`limit phải là số nguyên từ 1 đến ${MAX_LIMIT}`, 422);
  }

  try {
    const [productSections, collections] = await Promise.all([
      categorySlugs.length > 0
        ? getHomepageProductSections({
            categorySlugs,
            limit: productLimit,
          })
        : Promise.resolve([]),
      getHomepageCollections({ limit: collectionLimit }),
    ]);

    return ok({ productSections, collections }, "Thành công");
  } catch {
    return fail("Không thể tải dữ liệu trang chủ", 500);
  }
}
