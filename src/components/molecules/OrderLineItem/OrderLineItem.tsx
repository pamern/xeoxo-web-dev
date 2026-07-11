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
        "flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
        <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden bg-secondary sm:h-[96px] sm:w-[96px]">
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="truncate text-sm font-medium leading-[1.2] text-black sm:text-lg">
            {title}
          </p>
          <p className="text-sm font-extralight leading-[1.4] text-black sm:text-base">
            {subtitle}
          </p>
          <p className="text-sm font-extralight leading-[1.4] text-black sm:text-base">
            x {quantity}
          </p>
        </div>
      </div>

      <div className="shrink-0 self-end text-right text-sm font-normal leading-[1.4] text-black sm:self-auto sm:text-base">
        {price}
      </div>
    </div>
  );
}
