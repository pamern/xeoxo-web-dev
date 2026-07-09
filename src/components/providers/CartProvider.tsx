"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

type CartContextValue = {
  cart: CartDto;
  isLoading: boolean;
  isMutating: boolean;
  errorMessage?: string;
  refetch: () => Promise<CartDto>;
  addItem: (values: AddCartItemValues) => Promise<{ ok: boolean }>;
  updateItem: (
    cartItemId: number,
    values: UpdateCartItemValues,
  ) => Promise<{ ok: boolean }>;
  removeItem: (cartItemId: number) => Promise<{ ok: boolean }>;
  clearCart: () => Promise<{ ok: boolean }>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }

  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
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

  const mutate = useCallback(
    async (action: () => Promise<unknown>) => {
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
    },
    [refetch],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      isMutating,
      errorMessage,
      refetch,
      addItem: (values) => mutate(() => cartService.addItem(values)),
      updateItem: (cartItemId, values) =>
        mutate(() => cartService.updateItem(cartItemId, values)),
      removeItem: (cartItemId) => mutate(() => cartService.removeItem(cartItemId)),
      clearCart: () => mutate(() => cartService.clearCart()),
    }),
    [cart, isLoading, isMutating, errorMessage, refetch, mutate],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
