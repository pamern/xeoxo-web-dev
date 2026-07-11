import { fail, ok } from "@/lib/api-response";
import { searchProductLines } from "@/features/product/product-server.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (!query) {
      return ok([], "Thành công.");
    }

    const products = await searchProductLines(query, 6);
    return ok(products, "Thành công.");
  } catch (error) {
    console.error("[api/products/search] error", error);
    return fail(
      "Không thể tìm kiếm sản phẩm.",
      500,
      error instanceof Error ? error.message : error
    );
  }
}
