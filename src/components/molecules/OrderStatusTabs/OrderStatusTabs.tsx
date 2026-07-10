"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type OrderStatusTab = {
  href: string;
  label: string;
  value: string;
};

export type OrderStatusTabsProps = {
  className?: string;
  items: OrderStatusTab[];
  value: string;
};

export function OrderStatusTabs({
  className,
  items,
  value,
}: OrderStatusTabsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-x-8 gap-y-3 border-b border-black/10 pb-3",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;

        return (
          <Link
            key={item.value}
            href={item.href}
            className="group flex flex-col items-start gap-1.5 text-left"
            aria-current={active ? "page" : undefined}
          >
            <span
              className={cn(
                "text-base leading-none md:text-[18px]",
                active ? "font-normal text-[#ff593d]" : "font-normal text-black",
              )}
            >
              {item.label}
            </span>
            <span
              className={cn(
                "h-[3px] w-full min-w-[76px] bg-[url('/images/strip-title-underline.png')] bg-[length:100%_100%] bg-no-repeat transition-opacity",
                active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}
