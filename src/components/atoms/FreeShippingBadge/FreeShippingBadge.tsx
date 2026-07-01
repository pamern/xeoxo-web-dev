import Image from "next/image";
import { cn } from "@/lib/utils";

export function FreeShippingBadge({
  label = "FreeShip",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-pill bg-secondary px-3 py-1 text-sm font-medium",
        className
      )}
    >
      <Image src="/icons/freeship.svg" alt="" width={22} height={16} aria-hidden />
      {label}
    </span>
  );
}
