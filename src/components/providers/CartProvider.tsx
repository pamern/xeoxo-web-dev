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

  const runMutation = useCallback(
    async <T,>(action: () => Promise<T>, onSuccess?: (result: T) => void) => {
      setIsMutating(true);
      setErrorMessage(undefined);

      try {
        const result = await action();
        onSuccess?.(result);
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
    [],
  );

  const addItem = useCallback(
    async (values: AddCartItemValues) =>
      runMutation(() => cartService.addItem(values), (nextCart) => {
        setCart(nextCart);
      }),
    [runMutation],
  );

  const updateItem = useCallback(
    async (cartItemId: number, values: UpdateCartItemValues) =>
      runMutation(() => cartService.updateItem(cartItemId, values), (nextCart) => {
        setCart(nextCart);
      }),
    [runMutation],
  );

  const removeItem = useCallback(
    async (cartItemId: number) =>
      runMutation(() => cartService.removeItem(cartItemId), () => {
        setCart((currentCart) => {
          const nextItems = currentCart.items.filter(
            (item) => item.cart_item_id !== cartItemId,
          );

          return {
            ...currentCart,
            cart_id: nextItems.length ? currentCart.cart_id : null,
            items: nextItems,
            subtotal: nextItems.reduce((sum, item) => sum + item.line_total, 0),
            total_quantity: nextItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
      }),
    [runMutation],
  );

  const clearCart = useCallback(
    async () =>
      runMutation(() => cartService.clearCart(), () => {
        setCart(EMPTY_CART);
      }),
    [runMutation],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      isMutating,
      errorMessage,
      refetch,
      addItem,
      updateItem,
      removeItem,
      clearCart,
    }),
    [cart, isLoading, isMutating, errorMessage, refetch, addItem, updateItem, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
