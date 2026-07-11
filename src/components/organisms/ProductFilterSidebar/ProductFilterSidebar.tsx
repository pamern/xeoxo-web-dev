"use client";

import { useEffect, useMemo, useState } from "react";
import { cn, formatPrice } from "@/lib/utils";

export type ProductFilterGroup = {
  label: string;
  options?: string[];
};

export type ProductPriceRange = {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (range: { min: number; max: number }) => void;
};

export function ProductFilterSidebar({
  groups,
  resultCount,
  selected,
  onToggle,
  onClear,
  priceRange,
  defaultOpenGroupLabels,
  className,
}: {
  groups: ProductFilterGroup[];
  resultCount: number;
  selected: Record<string, string[]>;
  onToggle: (groupLabel: string, option: string) => void;
  onClear?: () => void;
  priceRange?: ProductPriceRange;
  defaultOpenGroupLabels?: string[];
  className?: string;
}) {
  const hasSelection = Object.values(selected).some((values) => values.length > 0);
  const firstGroupLabel = groups[0]?.label;
  const initialOpenGroups = useMemo(
    () => {
      const labels = defaultOpenGroupLabels ?? (firstGroupLabel ? [firstGroupLabel] : []);

      return Object.fromEntries(labels.map((label) => [label, true]));
    },
    [defaultOpenGroupLabels, firstGroupLabel],
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpenGroups);

  useEffect(() => {
    setOpenGroups(initialOpenGroups);
  }, [initialOpenGroups]);

  return (
    <aside className={cn("w-full text-black lg:w-[240px]", className)}>
      <div className="flex items-center justify-between border-b border-black pb-3">
        <h2 className="text-body-md font-light leading-tight uppercase tracking-wider">Bộ lọc</h2>
        <span className="text-body-sm font-light leading-tight text-muted-foreground">{resultCount} kết quả</span>
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
              {group.label === "Giá" && priceRange ? (
                <PriceRangeSlider range={priceRange} />
              ) : group.options && group.options.length > 0 ? (
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
              ) : null}
            </details>
          );
        })}
      </div>
    </aside>
  );
}

function PriceRangeSlider({ range }: { range: ProductPriceRange }) {
  const { min, max, valueMin, valueMax, onChange } = range;
  const step = 50_000;
  const safeMax = Math.max(max, min + step);
  const minPercent = ((valueMin - min) / (safeMax - min)) * 100;
  const maxPercent = ((valueMax - min) / (safeMax - min)) * 100;

  function updateMin(nextValue: number) {
    onChange({ min: Math.min(nextValue, valueMax - step), max: valueMax });
  }

  function updateMax(nextValue: number) {
    onChange({ min: valueMin, max: Math.max(nextValue, valueMin + step) });
  }

  return (
    <div className="pt-4">
      <div className="mb-4 flex items-start justify-between gap-3 text-[11px] font-light text-muted-foreground">
        <span>{formatPrice(valueMin)}</span>
        <span className="text-right">{formatPrice(valueMax)}</span>
      </div>

      <div className="relative h-7">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gray-200" />
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-black"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={safeMax}
          step={step}
          value={valueMin}
          onChange={(event) => updateMin(Number(event.target.value))}
          className="price-range-input"
          aria-label="Giá tối thiểu"
        />
        <input
          type="range"
          min={min}
          max={safeMax}
          step={step}
          value={valueMax}
          onChange={(event) => updateMax(Number(event.target.value))}
          className="price-range-input"
          aria-label="Giá tối đa"
        />
      </div>
    </div>
  );
}
