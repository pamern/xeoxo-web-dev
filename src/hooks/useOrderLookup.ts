"use client";

import { useCallback, useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import type {
  OrderLookupDto,
  OrderLookupValues,
} from "@/types/order-lookup.types";

export function useOrderLookup(initialValues?: Partial<OrderLookupValues>) {
  const [result, setResult] = useState<OrderLookupDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [hasSearched, setHasSearched] = useState(false);

  const lookup = useCallback(async (values: OrderLookupValues) => {
    setIsLoading(true);
    setErrorMessage(undefined);
    setHasSearched(true);

    try {
      const data = await orderService.lookupOrder(values);
      setResult(data);
      return data;
    } catch (error) {
      setResult(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể tra cứu đơn hàng.",
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setIsLoading(false);
    setErrorMessage(undefined);
    setHasSearched(false);
  }, []);

  useEffect(() => {
    const orderCode = initialValues?.order_code?.trim();
    const contact = initialValues?.contact?.trim();

    if (!orderCode || !contact) {
      return;
    }

    void lookup({
      contact,
      order_code: orderCode,
    });
  }, [initialValues?.contact, initialValues?.order_code, lookup]);

  return {
    errorMessage,
    hasSearched,
    isLoading,
    lookup,
    reset,
    result,
  };
}
