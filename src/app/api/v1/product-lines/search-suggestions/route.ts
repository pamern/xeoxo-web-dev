import { fail, ok } from "@/lib/api-response";
import { getProductSearchSuggestions } from "@/features/product/product-search.service";
import { productSearchSuggestionsQuerySchema } from "@/validations/product/product-search.schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = productSearchSuggestionsQuerySchema.safeParse({
      q: searchParams.get("q") ?? "",
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Từ khóa tìm kiếm không hợp lệ.", 400);
    }

    const suggestions = await getProductSearchSuggestions(parsed.data);

    return ok(suggestions, "Lấy gợi ý tìm kiếm thành công.");
  } catch (error) {
    console.error("[product-lines/search-suggestions/GET]", error);
    return fail(
      "Không thể lấy gợi ý tìm kiếm lúc này.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
