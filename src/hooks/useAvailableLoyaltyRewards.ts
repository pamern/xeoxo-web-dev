"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { AvailableLoyaltyReward } from "@/types/loyalty.types";

type UseAvailableLoyaltyRewardsResult = {
  rewards: AvailableLoyaltyReward[];
  isMember: boolean;
  isLoading: boolean;
};

export function useAvailableLoyaltyRewards(): UseAvailableLoyaltyRewardsResult {
  const { customer, isLoading: isAuthLoading } = useAuth();
  const [rewards, setRewards] = useState<AvailableLoyaltyReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isMember = customer?.customer_type === "MEMBER";

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    // Reward list endpoint is not implemented in this app yet.
    // Keep the cart UI stable by exposing an empty list until the
    // backend/member rewards flow is wired in.
    setRewards([]);
    setIsLoading(false);
  }, [isAuthLoading, isMember]);

  return {
    rewards,
    isMember,
    isLoading,
  };
}
