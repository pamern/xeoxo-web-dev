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
};

export function OrderCard({
  actions,
  className,
  items,
  orderCode,
  statusLabel,
  statusTone = "default",
  totalLabel,
}: OrderCardProps) {
  const badgeClassName =
    statusTone === "completed"
      ? "bg-black text-white"
      : statusTone === "shipping"
        ? "border border-accent bg-accent-muted text-accent"
        : statusTone === "cancelled"
          ? "border border-black/20 bg-black/[0.06] text-black/65"
          : statusTone === "returned"
            ? "border border-[#d88c2f] bg-[#fff7ea] text-[#b46d1f]"
            : "bg-black text-white";

  return (
    <article className={cn("border border-black bg-white py-5", className)}>
      <div className="flex items-center justify-between gap-4 px-[30px] pb-[10px]">
        <p className="text-body-sm font-normal text-black">
          Mã đơn hàng: {orderCode}
        </p>
        <span
          className={cn(
            "rounded-[5px] px-[10px] py-[5px] text-body-sm font-bold",
            badgeClassName,
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="space-y-[10px] px-[30px] py-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        {items.map((item, index) => (
          <OrderLineItem key={`${item.title}-${index}`} {...item} />
        ))}

        <div className="py-[10px]">
          <div className="h-[2px] w-full bg-black/15" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-[30px] px-[30px] pb-[30px] pt-[20px]">
        <span className="text-body-lg font-light text-black underline">
          Thành tiền:
        </span>
        <span className="text-display-section text-black">
          {totalLabel}
        </span>
      </div>

      <div className="px-[30px] pt-[10px]">
        <OrderActions actions={actions} />
      </div>
    </article>
  );
}
