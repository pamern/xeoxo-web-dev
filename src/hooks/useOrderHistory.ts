"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { orderService } from "@/services/order.service";
import type { AccountOrder } from "@/types/account-order.types";
import type { OrderHistoryFilter } from "@/features/order/order-history";
import { ORDERS_PAGE_SIZE } from "@/features/order/order-history";

export function useOrderHistory(
  statusGroup: OrderHistoryFilter,
  enabled = true,
  initialOrders?: AccountOrder[],
  initialTotal?: number,
) {
  const [orders, setOrders] = useState<AccountOrder[]>(initialOrders ?? []);
  const [total, setTotal] = useState(initialTotal ?? initialOrders?.length ?? 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(enabled && !initialOrders);
  const [errorMessage, setErrorMessage] = useState<string>();
  const hasHydratedFromInitial = useRef(false);

  const fetchPage = useCallback(
    async (page: number) => {
      if (!enabled) {
        setOrders([]);
        setTotal(0);
        setIsLoading(false);
        return [];
      }

      setIsLoading(true);
      setErrorMessage(undefined);

      try {
        const data = await orderService.getOrders(statusGroup, {
          offset: (page - 1) * ORDERS_PAGE_SIZE,
          limit: ORDERS_PAGE_SIZE,
        });
        setOrders(data.orders);
        setTotal(data.total);
        return data.orders;
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải lịch sử đơn hàng.",
        );
        setOrders([]);
        setTotal(0);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, statusGroup],
  );

  useEffect(() => {
    if (!enabled) {
      setOrders([]);
      setTotal(0);
      setIsLoading(false);
      setErrorMessage(undefined);
      return;
    }

    if (!hasHydratedFromInitial.current && initialOrders) {
      hasHydratedFromInitial.current = true;
      setOrders(initialOrders);
      setTotal(initialTotal ?? initialOrders.length);
      setIsLoading(false);
      setErrorMessage(undefined);
      return;
    }

    void fetchPage(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, statusGroup, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusGroup]);

  return {
    orders,
    total,
    currentPage,
    totalPages: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)),
    goToPage: setCurrentPage,
    isLoading,
    errorMessage,
    refetch: () => fetchPage(currentPage),
  };
}
