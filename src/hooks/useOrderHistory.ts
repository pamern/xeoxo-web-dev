"use client";

import { useCallback, useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import type { AccountOrder } from "@/types/account-order.types";
import type { OrderHistoryFilter } from "@/features/order/order-history";

export function useOrderHistory(
  statusGroup: OrderHistoryFilter,
  enabled = true,
  initialOrders?: AccountOrder[],
) {
  const [orders, setOrders] = useState<AccountOrder[]>(initialOrders ?? []);
  const [isLoading, setIsLoading] = useState(enabled && !initialOrders);
  const [errorMessage, setErrorMessage] = useState<string>();

  const refetch = useCallback(async () => {
    if (!enabled) {
      setOrders([]);
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const data = await orderService.getOrders(statusGroup);
      setOrders(data);
      return data;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải lịch sử đơn hàng.",
      );
      setOrders([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [enabled, statusGroup]);

  useEffect(() => {
    if (!enabled) {
      setOrders([]);
      setIsLoading(false);
      setErrorMessage(undefined);
      return;
    }

    if (initialOrders) {
      setOrders(initialOrders);
      setIsLoading(false);
      setErrorMessage(undefined);
    }
  }, [enabled, initialOrders]);

  useEffect(() => {
    if (!enabled || initialOrders) {
      return;
    }

    void refetch();
  }, [enabled, initialOrders, refetch]);

  return {
    orders,
    isLoading,
    errorMessage,
    refetch,
  };
}
