"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, isLoading, isMutating, removeItem } = useCart();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[110] bg-black/40 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-label="Giỏ hàng"
        className={cn(
          "fixed right-0 top-0 z-[120] flex h-full w-[400px] max-w-[calc(100vw-2rem)] flex-col bg-white text-foreground shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-body-lg font-semibold">Giỏ hàng</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng giỏ hàng"
            className="text-2xl leading-none text-muted-foreground transition-colors hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <p className="py-10 text-center text-body-sm text-muted-foreground">
              Đang tải giỏ hàng...
            </p>
          ) : cart.items.length === 0 ? (
            <p className="py-10 text-center text-body-sm text-muted-foreground">
              Giỏ hàng của bạn đang trống.
            </p>
          ) : (
            <ul className="flex flex-col gap-5">
              {cart.items.map((item) => (
                <li key={item.cart_item_id} className="flex gap-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-secondary">
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-body-sm font-semibold leading-snug">{item.name}</p>
                    <p className="text-caption text-muted-foreground">
                      {item.color} - {item.item_type === "CUSTOMIZED" ? "Customize" : item.size}
                    </p>
                    {item.item_type === "CUSTOMIZED" && (
                      <div className="text-[10px] text-muted-foreground leading-tight">
                        {(() => {
                          const snapshot = typeof item.customization_snapshot === "string"
                            ? (() => { try { return JSON.parse(item.customization_snapshot); } catch { return null; } })()
                            : item.customization_snapshot;
                          const measurements = (snapshot as any)?.measurements || {};
                          const MEASUREMENT_LABELS: Record<string, string> = {
                            height: "Chiều cao",
                            weight: "Cân nặng",
                            bust: "Ngực",
                            waist: "Eo",
                            hip: "Mông",
                            shoulder: "Vai",
                            neck: "Cổ",
                            sleeve: "Dài tay",
                            upperArm: "Bắp tay",
                          };
                          const list = Object.entries(measurements)
                            .filter(([, val]) => val !== undefined && val !== null && String(val).trim() !== "")
                            .map(([k, v]) => `${MEASUREMENT_LABELS[k] || k}: ${v}`);
                          return list.join(" | ");
                        })()}
                      </div>
                    )}
                    <p className="text-body-sm">
                      {item.quantity} <span className="font-bold">x {formatPrice(item.unit_price)}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeItem(item.cart_item_id)}
                    disabled={isMutating}
                    aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                    className="h-fit shrink-0 text-lg leading-none text-muted-foreground transition-colors hover:text-foreground disabled:cursor-wait disabled:opacity-50"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-6 py-5">
          <div className="mb-4 flex items-center justify-between text-body-sm">
            <span>Tạm tính</span>
            <span className="text-body-lg font-bold">{formatPrice(cart.subtotal)}</span>
          </div>
          <Link
            href={ROUTES.CART}
            onClick={onClose}
            className={cn(
              "flex w-full items-center justify-center rounded-pill bg-black px-6 py-3.5 text-body-sm font-medium text-white transition-colors hover:bg-black/80",
              cart.items.length === 0 && "pointer-events-none opacity-50",
            )}
          >
            Thanh toán
          </Link>
        </div>
      </aside>
    </>
  );
}
