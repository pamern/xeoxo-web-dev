"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type PolicyFaqItemProps = {
  answer?: string;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  question: string;
  size?: "default" | "compact";
};

export function PolicyFaqItem({
  answer,
  className,
  isOpen = false,
  onToggle,
  question,
  size = "default",
}: PolicyFaqItemProps) {
  const isCompact = size === "compact";

  return (
    <div
      className={cn(
        "rounded-md bg-white",
        isCompact ? "border border-black" : "border-2 border-black",
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between gap-4 text-left",
          isCompact ? "gap-3 px-4 py-3 md:px-5" : "px-6 py-5 md:gap-6 md:px-10",
        )}
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "flex-1 pr-2 font-bold text-black",
            isCompact ? "text-[13px] md:text-sm" : "text-lg md:text-[1.375rem]",
          )}
        >
          {question}
        </span>
        <Image
          src="/icons/chevron-down.svg"
          alt=""
          width={20}
          height={20}
          aria-hidden
          className={cn(
            "shrink-0 transition-transform",
            isCompact ? "h-4 w-4" : "h-5 w-5",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && answer ? (
        <div
          className={cn(
            "border-t border-black",
            isCompact ? "px-4 py-3 md:px-5" : "px-6 py-5 md:px-10",
          )}
        >
          <p
            className={cn(
              "font-light leading-relaxed text-black",
              isCompact ? "text-xs md:text-[13px]" : "text-lg",
            )}
          >
            {answer}
          </p>
        </div>
      ) : null}
    </div>
  );
}
