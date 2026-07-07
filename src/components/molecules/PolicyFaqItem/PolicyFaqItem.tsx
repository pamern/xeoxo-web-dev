"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type PolicyFaqItemProps = {
  answer?: string;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  question: string;
};

export function PolicyFaqItem({
  answer,
  className,
  isOpen = false,
  onToggle,
  question,
}: PolicyFaqItemProps) {
  return (
    <div className={cn("rounded-md border-2 border-black bg-white", className)}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left md:gap-6 md:px-10"
        aria-expanded={isOpen}
      >
        <span className="content-heading flex-1 pr-2">
          {question}
        </span>
        <Image
          src="/icons/chevron-down.svg"
          alt=""
          width={20}
          height={20}
          aria-hidden
          className={cn(
            "h-5 w-5 shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && answer ? (
        <div className="border-t border-black px-6 py-5 md:px-10">
          <p className="content-body">{answer}</p>
        </div>
      ) : null}
    </div>
  );
}
