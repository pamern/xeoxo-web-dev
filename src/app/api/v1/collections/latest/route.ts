import { unstable_cache } from "next/cache";
import { CACHE_TAGS, CACHE_TTL_SECONDS } from "@/lib/cache-policy";
import { ok, fail } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLatestCollectionHighlight } from "@/features/collections/collection-highlight.service";

const getCachedLatestCollectionHighlight = unstable_cache(
  async () => getLatestCollectionHighlight(createAdminClient()),
  ["latest-collection-highlight"],
  {
    revalidate: CACHE_TTL_SECONDS.latestCollectionHighlight,
    tags: [CACHE_TAGS.homepage, CACHE_TAGS.collections],
  },
);

export async function GET() {
  try {
    const highlight = await getCachedLatestCollectionHighlight();

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
