"use client";

import { useState } from "react";
import Link from "next/link";
import { OrderActions, type OrderActionLink } from "@/components/molecules/OrderActions";
import {
  OrderLineItem,
  type OrderLineItemProps,
} from "@/components/molecules/OrderLineItem";
import { cn } from "@/lib/utils";

export type OrderCardProps = {
  actions: OrderActionLink[];
  className?: string;
  items: OrderLineItemProps[];
  orderCode: string;
  statusLabel: string;
  statusTone?: "default" | "shipping" | "completed" | "cancelled" | "returned";
  totalLabel: string;
  href?: string;
};

const COLLAPSED_ITEMS_LIMIT = 2;

export function OrderCard({
  actions,
  className,
  items,
  orderCode,
  statusLabel,
  statusTone = "default",
  totalLabel,
  href,
}: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMoreItems = items.length > COLLAPSED_ITEMS_LIMIT;
  const visibleItems =
    isExpanded || !hasMoreItems ? items : items.slice(0, COLLAPSED_ITEMS_LIMIT);
  const hiddenCount = items.length - COLLAPSED_ITEMS_LIMIT;

  const badgeClassName =
    statusTone === "completed"
      ? "bg-black text-white"
      : statusTone === "shipping"
        ? "border border-[#ff593d] bg-[#fff2ee] text-[#ff593d]"
        : statusTone === "cancelled"
          ? "border border-black/15 bg-black/[0.04] text-black/50"
          : statusTone === "returned"
            ? "border border-[#d88c2f] bg-[#fff7ea] text-[#b46d1f]"
            : "bg-black text-white";

  return (
    <article
      className={cn(
        "relative border border-black bg-white py-3 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#ff593d] hover:shadow-[0_12px_36px_rgba(255,89,61,0.1)]",
        className,
      )}
    >
      {/* Invisible link overlay for the entire card */}
      {href && (
        <Link
          href={href}
          className="absolute inset-0 z-0"
          aria-label={`Xem chi tiết đơn hàng ${orderCode}`}
        />
      )}

      {/* Card Content - relative z-10 pointer-events-none so click bubbles down to Link overlay */}
      <div className="relative z-0 pointer-events-none">
        <div className="flex flex-wrap items-start justify-between gap-2 px-3 pb-2.5 sm:items-center sm:gap-3 sm:px-4">
          <p className="min-w-0 text-xs font-normal leading-[1.4] text-black">
            Mã đơn hàng: {orderCode}
          </p>
          <span
            className={cn(
              "rounded-[8px] px-2.5 py-1 text-[11px] font-bold leading-[1.3]",
              badgeClassName,
            )}
          >
            {statusLabel}
          </span>
        </div>

        <div className="space-y-2.5 border-t border-black/10 px-3 py-2.5 sm:px-4">
          {visibleItems.map((item, index) => (
            <OrderLineItem key={`${item.title}-${index}`} {...item} />
          ))}
        </div>

        {hasMoreItems && (
          <div className="relative z-10 pointer-events-auto px-3 pb-1 sm:px-4">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-black/60 underline underline-offset-2 transition-colors hover:text-black"
            >
              {isExpanded ? "Thu gọn" : `Xem thêm ${hiddenCount} sản phẩm`}
              <span
                aria-hidden
                className={cn(
                  "inline-block h-1.5 w-1.5 rotate-45 border-b border-r border-current transition-transform",
                  isExpanded && "-translate-y-0.5 rotate-[225deg]",
                )}
              />
            </button>
          </div>
        )}

        <div className="mx-3 mt-2.5 border-t border-black/10 sm:mx-4" />

        <div className="flex flex-col items-end gap-0.5 px-3 pt-2.5 text-right sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-x-3 sm:gap-y-1 sm:px-4">
          <span className="text-xs font-light leading-[1.4] text-black underline">
            Thành tiền:
          </span>
          <span className="break-words text-base font-bold leading-[1.15] text-black md:text-lg">
            {totalLabel}
          </span>
        </div>
      </div>

      {/* Actions container - relative z-10 to stay clickable above the overlay */}
      <div className="relative z-10 px-3 pt-2.5 sm:px-4">
        <OrderActions actions={actions} />
      </div>
    </article>
  );
}
