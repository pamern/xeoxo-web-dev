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
    <div className={cn("flex items-center justify-between gap-5", className)}>
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden bg-secondary">
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <p className="truncate text-[18px] font-medium leading-[1.2] text-black">
            {title}
          </p>
          <p className="text-[15px] font-extralight leading-[1.4] text-black">
            {subtitle}
          </p>
          <p className="text-[15px] font-extralight leading-[1.4] text-black">
            x {quantity}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right text-[15px] font-normal leading-[1.4] text-black">
        {price}
      </div>
    </div>
  );
}
