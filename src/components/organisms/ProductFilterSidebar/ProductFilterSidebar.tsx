"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type ProductFilterGroup = {
  label: string;
  options?: string[];
};

export function ProductFilterSidebar({
  groups,
  resultCount,
  selected,
  onToggle,
  onClear,
  className,
}: {
  groups: ProductFilterGroup[];
  resultCount: number;
  selected: Record<string, string[]>;
  onToggle: (groupLabel: string, option: string) => void;
  onClear?: () => void;
  className?: string;
}) {
  const hasSelection = Object.values(selected).some((values) => values.length > 0);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Danh mục": true,
    "Màu sắc cá nhân": true,
  });

  return (
    <aside className={cn("w-full text-black lg:w-[240px]", className)}>
      <div className="flex items-center justify-between border-b border-black pb-3">
        <h2 className="text-body-md font-light leading-none uppercase tracking-wider">Bộ lọc</h2>
        <span className="text-body-sm font-light leading-none text-muted-foreground">{resultCount} kết quả</span>
      </div>


      <div className="mt-4 flex flex-col">
        {groups.map((group) => {
          const isOpen = !!openGroups[group.label];
          return (
            <details
              key={group.label}
              open={isOpen}
              onToggle={(e) => {
                const target = e.currentTarget;
                setOpenGroups((prev) => ({
                  ...prev,
                  [group.label]: target.open,
                }));
              }}
              className="group border-b border-gray-100 py-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-body-md font-light leading-none hover:text-gray-600 transition-colors [&::-webkit-details-marker]:hidden">
                <span className="uppercase tracking-wider text-body-xs">{group.label}</span>
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rotate-45 border-b border-r border-black transition-transform duration-200 group-open:rotate-[225deg]"
                />
              </summary>
              {group.options && group.options.length > 0 && (
                <div
                  className={cn(
                    "pt-3 text-body-sm font-light text-muted-foreground",
                    group.label === "Kích thước"
                      ? "flex flex-wrap gap-1.5"
                      : "flex flex-col gap-2",
                  )}
                >
                  {group.options.map((option) => {
                    const checked = selected[group.label]?.includes(option) ?? false;

                    if (group.label === "Kích thước") {
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => onToggle(group.label, option)}
                          className={cn(
                            "flex h-7 min-w-7 items-center justify-center rounded-sm border px-1.5 text-[10px] font-light transition-all duration-200",
                            checked
                              ? "border-black bg-black text-white shadow-sm"
                              : "border-gray-200 bg-white text-black hover:border-black",
                          )}
                        >
                          {option}
                        </button>
                      );
                    }

                    return (
                      <label
                        key={option}
                        className="group/item flex cursor-pointer items-center gap-2.5 text-body-sm transition-colors hover:text-foreground"
                      >
                        <input
                          type={
                            group.label === "Màu sắc cá nhân" || group.label === "Giới tính"
                              ? "radio"
                              : "checkbox"
                          }
                          checked={checked}
                          onChange={() => onToggle(group.label, option)}
                          className={cn(
                            "h-3.5 w-3.5 cursor-pointer border-gray-300 accent-black transition duration-150 focus:ring-black",
                            group.label === "Màu sắc cá nhân" || group.label === "Giới tính"
                              ? "rounded-full"
                              : "rounded"
                          )}
                        />
                        <span
                          className={cn(
                            "transition-transform duration-200 ease-out text-body-xs",
                            checked
                              ? "font-medium text-foreground"
                              : "group-hover/item:translate-x-0.5",
                          )}
                        >
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </details>
          );
        })}
      </div>
    </aside>
  );
}


