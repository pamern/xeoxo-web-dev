import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import { getAvailableLoyaltyRewardsByCustomerId } from "@/features/loyalty/loyalty-reward.service";
import { fail, ok } from "@/lib/api-response";

export async function GET() {
  try {
    const customerId = await getCurrentCustomerId();

    if (!customerId) {
      return fail("Bạn cần đăng nhập để xem mã ưu đãi thành viên.", 401);
    }

    const rewards = await getAvailableLoyaltyRewardsByCustomerId(customerId);
    return ok(rewards, "Lấy danh sách mã ưu đãi thành công.");
  } catch (error) {
    console.error("[loyalty-rewards/GET]", error);

    return fail(
      "Không thể tải mã ưu đãi thành viên.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
