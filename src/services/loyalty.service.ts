import { API } from "@/constants/routes";
import { getApiErrorMessage, type ApiResponse } from "@/types/api.types";
import type { AvailableLoyaltyReward } from "@/types/loyalty.types";

async function readApi<T>(response: Response, fallback: string) {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(getApiErrorMessage(payload, fallback));
  }

  return payload.data;
}

export const loyaltyService = {
  async getAvailableRewards() {
    const response = await fetch(API.LOYALTY_REWARDS, {
      credentials: "include",
    });

    return readApi<AvailableLoyaltyReward[]>(
      response,
      "Không thể tải danh sách mã ưu đãi.",
    );
  },
};
