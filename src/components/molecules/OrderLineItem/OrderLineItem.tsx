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
    <div className={cn("flex gap-[30px] items-center", className)}>
      <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden bg-secondary">
        <Image
          src={imageSrc}
          alt={imageAlt ?? title}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
        <p className="truncate text-[22px] font-normal leading-[1.2] text-black">
          {title}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4 text-[18px] text-black">
          <p className="font-extralight leading-[1.4]">{subtitle}</p>
          <p className="font-normal leading-[1.4]">{price}</p>
        </div>
        <p className="text-[18px] font-extralight leading-[1.4] text-black">
          x {quantity}
        </p>
      </div>
    </div>
  );
}
