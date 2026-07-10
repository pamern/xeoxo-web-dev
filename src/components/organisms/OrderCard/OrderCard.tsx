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
        "relative border border-black bg-white py-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#ff593d] hover:shadow-[0_10px_28px_rgba(255,89,61,0.08)]",
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
        <div className="flex items-center justify-between gap-4 px-6 pb-3">
          <p className="text-[12px] font-normal leading-[1.4] text-black">
            Mã đơn hàng: {orderCode}
          </p>
          <span
            className={cn(
              "rounded-[8px] px-3 py-1.5 text-[12px] font-bold leading-[1.3]",
              badgeClassName,
            )}
          >
            {statusLabel}
          </span>
        </div>

        <div className="space-y-3 border-t border-black/10 px-6 py-3">
          {items.map((item, index) => (
            <OrderLineItem key={`${item.title}-${index}`} {...item} />
          ))}
        </div>

        <div className="mx-6 mt-3 border-t border-black/10" />

        <div className="flex items-center justify-end gap-6 px-6 pt-4">
          <span className="text-[15px] font-light leading-[1.4] text-black underline">
            Thành tiền:
          </span>
          <span className="text-[25px] font-bold leading-[1.2] text-black">
            {totalLabel}
          </span>
        </div>
      </div>

      {/* Actions container - relative z-10 to stay clickable above the overlay */}
      <div className="relative z-10 px-6 pt-4">
        <OrderActions actions={actions} />
      </div>
    </article>
  );
}
