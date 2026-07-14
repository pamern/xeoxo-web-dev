"use client";

import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { orderService } from "@/services/order.service";
import type {
  CheckoutPreviewDto,
  CheckoutPreviewValues,
  CreateOrderValues,
  CreatedOrderDto,
} from "@/types/order.types";

function isStaleCheckoutCartError(message: string) {
  const normalized = message.trim().toLowerCase();

  return (
    normalized.includes("gio hang khong ton tai") ||
    normalized.includes("giỏ hàng không tồn tại") ||
    normalized.includes("khong thuoc tai khoan") ||
    normalized.includes("không thuộc tài khoản") ||
    normalized.includes("da checkout") ||
    normalized.includes("đã checkout")
  );
}

type CheckoutState = ReturnType<typeof useCheckoutValue>;

const CheckoutContext = createContext<CheckoutState | null>(null);

function useCheckoutValue() {
  const [preview, setPreview] = useState<CheckoutPreviewDto | null>(null);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrderDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const previewRequestRef = useRef<Promise<
    | { ok: true; preview: CheckoutPreviewDto }
    | { ok: false; staleCart: true }
    | { ok: false }
  > | null>(null);
  const createOrderRequestRef = useRef<Promise<
    | { ok: true; order: CreatedOrderDto }
    | { ok: false }
  > | null>(null);

  const previewCheckout = useCallback(async (values: CheckoutPreviewValues) => {
    if (previewRequestRef.current) {
      return previewRequestRef.current;
    }

    setIsSubmitting(true);
    setErrorMessage(undefined);

    const request = (async () => {
      try {
        const data = await orderService.previewCheckout(values);
        setPreview(data);
        return { ok: true as const, preview: data };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Khong the tinh tien.";

        if (isStaleCheckoutCartError(message)) {
          setPreview(null);
          setErrorMessage(undefined);
          return { ok: false as const, staleCart: true };
        }

        setErrorMessage(message);
        return { ok: false as const };
      } finally {
        setIsSubmitting(false);
        previewRequestRef.current = null;
      }
    })();

    previewRequestRef.current = request;
    return request;
  }, []);

  const createOrder = useCallback(async (values: CreateOrderValues) => {
    if (createOrderRequestRef.current) {
      return createOrderRequestRef.current;
    }

    setIsSubmitting(true);
    setErrorMessage(undefined);

    const request = (async () => {
      try {
        const order = await orderService.createOrder(values);
        setCreatedOrder(order);
        setPreview(null);
        return { ok: true as const, order };
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Khong the tao don hang.",
        );
        return { ok: false as const };
      } finally {
        setIsSubmitting(false);
        createOrderRequestRef.current = null;
      }
    })();

    createOrderRequestRef.current = request;
    return request;
  }, []);

  const resetPreview = useCallback(() => {
    setPreview(null);
    setErrorMessage(undefined);
  }, []);

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

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const value = useCheckoutValue();

  return createElement(CheckoutContext.Provider, { value }, children);
}

export function useCheckout() {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error("useCheckout must be used within CheckoutProvider.");
  }

  return context;
}
