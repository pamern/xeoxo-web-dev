import { fail, ok } from "@/lib/api-response";
import { searchProductCatalog } from "@/features/product/product-search.service";
import { productSearchQuerySchema } from "@/validations/product/product-search.schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = productSearchQuerySchema.safeParse({
      q: searchParams.get("q") ?? "",
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Từ khóa tìm kiếm không hợp lệ.", 400);
    }

    const result = await searchProductCatalog(parsed.data);

    return ok(result, "Lấy danh sách sản phẩm thành công.");
  } catch (error) {
    console.error("[product-lines/GET]", error);
    return fail(
      "Không thể tìm kiếm sản phẩm lúc này.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
