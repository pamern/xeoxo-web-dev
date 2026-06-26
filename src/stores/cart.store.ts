"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types/product.types";

// Giỏ hàng phía client, lưu localStorage để giữ giữa các lần truy cập.
// Không đặt logic DB ở đây — đây thuần là state UI.

type CartState = {
  lines: CartLine[];
  addLine: (line: CartLine) => void;
  removeLine: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => void;
  clear: () => void;
  totalQuantity: () => number;
  subtotal: () => number;
};

const sameLine = (a: CartLine, productId: string, size: string, color: string) =>
  a.productId === productId && a.size === size && a.color === color;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line) =>
        set((state) => {
          const existing = state.lines.find((l) =>
            sameLine(l, line.productId, line.size, line.color)
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                sameLine(l, line.productId, line.size, line.color)
                  ? { ...l, quantity: l.quantity + line.quantity }
                  : l
              ),
            };
          }
          return { lines: [...state.lines, line] };
        }),
      removeLine: (productId, size, color) =>
        set((state) => ({
          lines: state.lines.filter((l) => !sameLine(l, productId, size, color)),
        })),
      updateQuantity: (productId, size, color, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              sameLine(l, productId, size, color)
                ? { ...l, quantity: Math.max(0, quantity) }
                : l
            )
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
      totalQuantity: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    { name: "xeoxo-cart" }
  )
);
