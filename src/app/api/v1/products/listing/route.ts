import { fail, ok } from "@/lib/api-response";
import { getCategoryListing } from "@/features/homepage/homepage.service";
import { filterAndSortProducts } from "@/features/catalog/product-filtering";

const DEFAULT_LIMIT = 12;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category_slug");

    if (!categorySlug) {
      return fail("Thiếu category_slug.", 400);
    }

    const offsetParam = Number(searchParams.get("offset") ?? "0");
    const limitParam = Number(searchParams.get("limit") ?? String(DEFAULT_LIMIT));
    const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : DEFAULT_LIMIT;

    const priceMinParam = searchParams.get("price_min");
    const priceMaxParam = searchParams.get("price_max");

    const { products, filterOptions } = await getCategoryListing(categorySlug);

    const filtered = filterAndSortProducts(products, filterOptions, {
      category: searchParams.getAll("category"),
      size: searchParams.getAll("size"),
      color: searchParams.getAll("color"),
      material: searchParams.getAll("material"),
      collection: searchParams.getAll("collection"),
      gender: searchParams.getAll("gender"),
      season: searchParams.getAll("season"),
      priceMin: priceMinParam !== null ? Number(priceMinParam) : undefined,
      priceMax: priceMaxParam !== null ? Number(priceMaxParam) : undefined,
      sort: searchParams.get("sort") ?? undefined,
    });

    const total = filtered.length;
    const page = filtered.slice(offset, offset + limit);

    return ok(
      { products: page, total, offset, limit, filterOptions },
      "Lấy danh sách sản phẩm thành công.",
    );
  } catch (error) {
    console.error("[products/listing/GET]", error);
    return fail(
      "Không thể tải danh sách sản phẩm.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
