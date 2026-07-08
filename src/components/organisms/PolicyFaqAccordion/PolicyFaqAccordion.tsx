"use client";

import { useState } from "react";
import { PolicyFaqItem } from "@/components/molecules/PolicyFaqItem";
import { cn } from "@/lib/utils";

export type PolicyFaqAccordionItem = {
  answer?: string;
  id: string;
  question: string;
};

export type PolicyFaqAccordionProps = {
  className?: string;
  defaultOpenId?: string | null;
  items: PolicyFaqAccordionItem[];
};

export function PolicyFaqAccordion({
  className,
  defaultOpenId = null,
  items,
}: PolicyFaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  return (
    <div className={cn("space-y-[35px]", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <PolicyFaqItem
            key={item.id}
            question={item.question}
            answer={item.answer}
            isOpen={isOpen}
            onToggle={() => setOpenId(isOpen ? null : item.id)}
          />
        );
      })}
    </div>
  );
}
