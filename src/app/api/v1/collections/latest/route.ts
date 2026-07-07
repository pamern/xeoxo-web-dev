import { ok, fail } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { getLatestCollectionHighlight } from "@/features/collections/collection-highlight.service";

export async function GET() {
  try {
    const supabase = await createClient();
    const highlight = await getLatestCollectionHighlight(supabase);

    if (!highlight) {
      return fail("Không tìm thấy bộ sưu tập nào.", 404);
    }

    return ok(highlight, "Lấy bộ sưu tập mới nhất thành công.");
  } catch (error) {
    console.error("[collections/latest] Failed to load latest collection.", error);

    return fail(
      "Không thể tải bộ sưu tập mới nhất.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
