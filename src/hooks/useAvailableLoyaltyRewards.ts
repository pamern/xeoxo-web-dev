"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { loyaltyService } from "@/services/loyalty.service";
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

    if (!isMember) {
      setRewards([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadRewards() {
      setIsLoading(true);

      try {
        const nextRewards = await loyaltyService.getAvailableRewards();

        if (!cancelled) {
          setRewards(nextRewards);
        }
      } catch (error) {
        console.error("[useAvailableLoyaltyRewards]", error);

        if (!cancelled) {
          setRewards([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRewards();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isMember]);

  return {
    rewards,
    isMember,
    isLoading,
  };
}
