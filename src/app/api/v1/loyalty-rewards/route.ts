import { fail, ok } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/features/auth/auth.service";
import { getAvailableLoyaltyRewardsByAccountId } from "@/features/loyalty/loyalty-reward.service";

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return fail("Bạn cần đăng nhập để xem mã ưu đãi.", 401);
    }

    const rewards = await getAvailableLoyaltyRewardsByAccountId(user.id);
    return ok(rewards, "Lấy danh sách mã ưu đãi thành công.");
  } catch (error) {
    console.error("[loyalty-rewards/GET] Failed to load loyalty rewards.", error);

    return fail(
      "Không thể tải danh sách mã ưu đãi.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
