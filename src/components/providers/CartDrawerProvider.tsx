"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CartDrawer } from "@/components/organisms/CartDrawer";

type CartDrawerContextValue = {
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) {
    throw new Error("useCartDrawer must be used within CartDrawerProvider");
  }
  return ctx;
}

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  useEffect(() => {
    window.addEventListener("xeoxo-cart-updated", closeDrawer);
    return () => window.removeEventListener("xeoxo-cart-updated", closeDrawer);
  }, [closeDrawer]);

  return (
    <CartDrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      {children}
      <CartDrawer open={open} onClose={closeDrawer} />
    </CartDrawerContext.Provider>
  );
}
