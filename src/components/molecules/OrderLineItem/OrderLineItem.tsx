import Image from "next/image";
import { cn } from "@/lib/utils";

export type OrderLineItemProps = {
  className?: string;
  imageAlt?: string;
  imageSrc: string;
  price: string;
  quantity: number;
  subtitle: string;
  title: string;
};

export function OrderLineItem({
  className,
  imageAlt,
  imageSrc,
  price,
  quantity,
  subtitle,
  title,
}: OrderLineItemProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
        <div className="relative h-[48px] w-[48px] shrink-0 overflow-hidden bg-secondary sm:h-[60px] sm:w-[60px]">
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-xs font-medium leading-[1.2] text-black sm:text-sm">
            {title}
          </p>
          <p className="text-[11px] font-extralight leading-[1.4] text-black sm:text-xs">
            {subtitle}
          </p>
          <p className="text-[11px] font-extralight leading-[1.4] text-black sm:text-xs">
            x {quantity}
          </p>
        </div>
      </div>

      <div className="shrink-0 self-end text-right text-xs font-normal leading-[1.4] text-black sm:self-auto sm:text-sm">
        {price}
      </div>
    </div>
  );
}
