import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerProfileByAccountId } from "@/features/auth/auth.service";
import type { AvailableLoyaltyReward } from "@/types/loyalty.types";

type LoyaltyRewardRow = {
  reward_id: number | string;
  reward_name: string | null;
  reward_type: string | null;
  reward_value: number | string | null;
  voucher_code: string | null;
  expired_at: string | null;
  loyalty_tier_id: string | null;
};

function toNumber(value: number | string | null | undefined) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

export async function getAvailableLoyaltyRewardsByAccountId(accountId: string) {
  const customer = await getCustomerProfileByAccountId(accountId);

  if (!customer?.customer_id || customer.customer_type !== "MEMBER") {
    return [] satisfies AvailableLoyaltyReward[];
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await admin
    .schema("iam")
    .from("loyalty_reward")
    .select(
      "reward_id, reward_name, reward_type, reward_value, voucher_code, expired_at, loyalty_tier_id",
    )
    .eq("customer_id", Number(customer.customer_id))
    .eq("status", "AVAILABLE")
    .not("voucher_code", "is", null)
    .or(`expired_at.is.null,expired_at.gt.${now}`)
    .order("expired_at", { ascending: true, nullsFirst: false })
    .order("issued_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((reward) => mapLoyaltyRewardRow(reward as LoyaltyRewardRow));
}

function mapLoyaltyRewardRow(reward: LoyaltyRewardRow): AvailableLoyaltyReward {
  return {
    reward_id: Number(reward.reward_id),
    reward_name: reward.reward_name?.trim() || "Quyền lợi thành viên",
    reward_type: reward.reward_type?.trim() || "UNKNOWN",
    reward_value: toNumber(reward.reward_value),
    voucher_code: reward.voucher_code?.trim() || null,
    expired_at: reward.expired_at,
    tier_id: reward.loyalty_tier_id?.trim() || null,
  };
}
