"use client";

import { useCallback, useEffect, useState } from "react";
import { cartService } from "@/services/cart.service";
import type {
  AddCartItemValues,
  CartDto,
  UpdateCartItemValues,
} from "@/types/cart.types";

const EMPTY_CART: CartDto = {
  cart_id: null,
  cart_status: "ACTIVE",
  items: [],
  subtotal: 0,
  total_quantity: 0,
};

export function useCart() {
  const [cart, setCart] = useState<CartDto>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const data = await cartService.getCart();
      setCart(data);
      return data;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong the tai gio hang.",
      );
      setCart(EMPTY_CART);
      return EMPTY_CART;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    function handleCartUpdated() {
      void refetch();
    }

    window.addEventListener("xeoxo-cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("xeoxo-cart-updated", handleCartUpdated);
    };
  }, [refetch]);

  async function mutate(action: () => Promise<unknown>) {
    setIsMutating(true);
    setErrorMessage(undefined);

    try {
      await action();
      await refetch();
      return { ok: true };
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong the cap nhat gio hang.",
      );
      return { ok: false };
    } finally {
      setIsMutating(false);
    }
  }

  return {
    cart,
    isLoading,
    isMutating,
    errorMessage,
    refetch,
    addItem: (values: AddCartItemValues) =>
      mutate(() => cartService.addItem(values)),
    updateItem: (cartItemId: number, values: UpdateCartItemValues) =>
      mutate(() => cartService.updateItem(cartItemId, values)),
    removeItem: (cartItemId: number) =>
      mutate(() => cartService.removeItem(cartItemId)),
    clearCart: () => mutate(() => cartService.clearCart()),
  };
}
