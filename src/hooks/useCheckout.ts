"use client";

import { useCallback, useState } from "react";
import { orderService } from "@/services/order.service";
import type {
  CheckoutPreviewDto,
  CheckoutPreviewValues,
  CreateOrderValues,
  CreatedOrderDto,
} from "@/types/order.types";

export function useCheckout() {
  const [preview, setPreview] = useState<CheckoutPreviewDto | null>(null);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrderDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const previewCheckout = useCallback(async (values: CheckoutPreviewValues) => {
    setIsSubmitting(true);
    setErrorMessage(undefined);

    try {
      const data = await orderService.previewCheckout(values);
      setPreview(data);
      return { ok: true, preview: data };
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong the tinh tien.",
      );
      return { ok: false };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const createOrder = useCallback(async (values: CreateOrderValues) => {
    setIsSubmitting(true);
    setErrorMessage(undefined);

    try {
      const order = await orderService.createOrder(values);
      setCreatedOrder(order);
      return { ok: true, order };
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong the tao don hang.",
      );
      return { ok: false };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resetPreview = useCallback(() => setPreview(null), []);

  return {
    preview,
    createdOrder,
    isSubmitting,
    errorMessage,
    previewCheckout,
    createOrder,
    resetPreview,
  };
}
