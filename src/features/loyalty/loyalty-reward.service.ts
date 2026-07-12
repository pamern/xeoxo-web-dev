import { createAdminClient } from "@/lib/supabase/admin";
import type { AvailableLoyaltyReward } from "@/types/loyalty.types";

type CustomerTierRecord = {
  tier_id: string | null;
};

type LoyaltyRewardRecord = {
  reward_id: number;
  reward_name: string;
  reward_type: string;
  reward_value: number | string | null;
  voucher_code: string | null;
  expired_at: string | null;
  loyalty_tier_id: string | null;
};

function toNumber(value: number | string | null) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

async function getCurrentTierId(customerId: number) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("iam")
    .from("customer")
    .select("tier_id")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? null) as CustomerTierRecord | null)?.tier_id ?? null;
}

export async function getAvailableLoyaltyRewardsByCustomerId(
  customerId: number,
): Promise<AvailableLoyaltyReward[]> {
  const currentTierId = await getCurrentTierId(customerId);

  if (!currentTierId) {
    return [];
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await admin
    .schema("iam")
    .from("loyalty_reward")
    .select(
      "reward_id, reward_name, reward_type, reward_value, voucher_code, expired_at, loyalty_tier_id",
    )
    .eq("customer_id", customerId)
    .eq("status", "AVAILABLE")
    .eq("loyalty_tier_id", currentTierId)
    .or(`expired_at.is.null,expired_at.gt.${now}`)
    .order("expired_at", { ascending: true })
    .order("reward_id", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as LoyaltyRewardRecord[]).map((reward) => ({
    reward_id: reward.reward_id,
    reward_name: reward.reward_name,
    reward_type: reward.reward_type,
    reward_value: toNumber(reward.reward_value),
    voucher_code: reward.voucher_code,
    expired_at: reward.expired_at,
    tier_id: reward.loyalty_tier_id,
    quantity: 1,
  }));
}
