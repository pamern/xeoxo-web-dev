export type AvailableLoyaltyReward = {
  reward_id: number;
  reward_name: string;
  reward_type: string;
  reward_value: number;
  voucher_code: string | null;
  expired_at: string | null;
  tier_id: string | null;
};
