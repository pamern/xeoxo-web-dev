"use client";

import { useCallback, useEffect, useState } from "react";
import { paymentService } from "@/services/payment.service";
import type { PaymentMethodDto } from "@/types/payment.types";

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const data = await paymentService.getPaymentMethods();
      setPaymentMethods(data);
      return data;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Khong the tai phuong thuc thanh toan.",
      );
      setPaymentMethods([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    paymentMethods,
    isLoading,
    errorMessage,
    refetch,
  };
}

