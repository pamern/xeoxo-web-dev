"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { loyaltyRewardService } from "@/services/loyalty-reward.service";
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
    let isCancelled = false;

    if (isAuthLoading) {
      return;
    }

    if (!isMember) {
      setRewards([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    void loyaltyRewardService
      .getAvailableRewards()
      .then((nextRewards) => {
        if (!isCancelled) {
          setRewards(nextRewards);
        }
      })
      .catch((error) => {
        console.warn("[useAvailableLoyaltyRewards]", error);

        if (!isCancelled) {
          setRewards([]);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, isMember]);

  return {
    rewards,
    isMember,
    isLoading,
  };
}
