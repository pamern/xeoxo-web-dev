"use client";

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

  return (
    <aside className={cn("w-full text-black lg:w-[346px]", className)}>
      <div className="flex items-center justify-between border-b border-black pb-5">
        <h2 className="text-heading-card font-bold leading-none">Bộ lọc</h2>
        <span className="text-body-lg font-light leading-none">{resultCount} kết quả</span>
      </div>

      {hasSelection && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 text-body-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Xóa tất cả bộ lọc
        </button>
      )}

      <div className="mt-8 flex flex-col gap-8">
        {groups.map((group) => (
          <details key={group.label} open className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-body-lg font-light leading-none [&::-webkit-details-marker]:hidden">
              <span>{group.label}</span>
              <span
                aria-hidden
                className="h-3 w-3 rotate-45 border-b-2 border-r-2 border-black transition-transform group-open:rotate-[225deg]"
              />
            </summary>
            {group.options && group.options.length > 0 && (
              <div className="flex flex-col gap-3 pt-4 text-body-sm font-light text-muted-foreground">
                {group.options.map((option) => {
                  const checked = selected[group.label]?.includes(option) ?? false;
                  return (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(group.label, option)}
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className={cn(checked && "font-medium text-foreground")}>
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </details>
        ))}
      </div>
    </aside>
  );
}
