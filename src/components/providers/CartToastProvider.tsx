"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItemDto } from "@/types/cart.types";

type CartToastContextValue = {
  showAddedToCart: (item: CartItemDto) => void;
};

const CartToastContext = createContext<CartToastContextValue | null>(null);

export function useCartToast() {
  const ctx = useContext(CartToastContext);
  if (!ctx) {
    throw new Error("useCartToast must be used within CartToastProvider");
  }
  return ctx;
}

export function CartToastProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = useState<CartItemDto | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showAddedToCart = useCallback((newItem: CartItemDto) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setItem(newItem);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 4000);
  }, []);

  return (
    <CartToastContext.Provider value={{ showAddedToCart }}>
      {children}
      <CartAddedToast item={item} visible={visible} onClose={() => setVisible(false)} />
    </CartToastContext.Provider>
  );
}

function CartAddedToast({
  item,
  visible,
  onClose,
}: {
  item: CartItemDto | null;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed right-4 top-24 z-[100] w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-white p-6 text-foreground shadow-[0_20px_45px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out",
        visible && item
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-[120%] opacity-0",
      )}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-body-lg font-semibold">Thêm vào giỏ hàng thành công</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="text-xl leading-none text-muted-foreground transition-colors hover:text-foreground"
        >
          ×
        </button>
      </div>

      <hr className="my-4 border-border" />

      {item && (
        <div className="flex gap-4">
          <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-secondary">
            <Image src={item.thumbnail} alt={item.name} fill sizes="56px" className="object-cover" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-body-sm font-semibold leading-snug">{item.name}</p>
            <p className="text-caption text-muted-foreground">
              {[item.color, item.item_type === "CUSTOMIZED" ? "Customize" : item.size].filter(Boolean).join(" - ")}
            </p>
            <p className="text-body-sm">
              {item.quantity} <span className="font-bold">x {formatPrice(item.unit_price)}</span>
            </p>
          </div>
        </div>
      )}

      <Link
        href={ROUTES.CART}
        onClick={onClose}
        className="mt-5 flex w-full items-center justify-center rounded-pill border border-black px-6 py-3 text-body-sm font-medium transition-colors hover:bg-black hover:text-white"
      >
        Xem giỏ hàng
      </Link>
    </div>
  );
}
