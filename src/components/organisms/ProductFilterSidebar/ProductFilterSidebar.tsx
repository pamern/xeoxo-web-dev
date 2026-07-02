import { cn } from "@/lib/utils";

export type ProductFilterGroup = {
  label: string;
  options?: string[];
};

export function ProductFilterSidebar({
  groups,
  resultCount,
  className,
}: {
  groups: ProductFilterGroup[];
  resultCount: number;
  className?: string;
}) {
  return (
    <aside className={cn("w-full text-black lg:w-[346px]", className)}>
      <div className="flex items-center justify-between border-b border-black pb-7">
        <h2 className="text-[32px] font-bold leading-none">Bộ lọc</h2>
        <span className="text-[28px] font-light leading-none">{resultCount} kết quả</span>
      </div>

      <div className="mt-10 flex flex-col gap-10">
        {groups.map((group) => (
          <details key={group.label} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-8 text-[28px] font-light leading-none [&::-webkit-details-marker]:hidden">
              <span>{group.label}</span>
              <span
                aria-hidden
                className="h-[14px] w-[14px] rotate-45 border-b-2 border-r-2 border-black transition-transform group-open:rotate-[225deg]"
              />
            </summary>
            {group.options && group.options.length > 0 && (
              <div className="flex flex-col gap-3 pt-5 text-lg font-light text-muted-foreground">
                {group.options.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-border" />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </details>
        ))}
      </div>
    </aside>
  );
}
