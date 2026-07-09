import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilterOption = {
  label: string;
  href?: string;
  value?: string;
  active?: boolean;
};

export function FilterBar({
  title,
  options,
  className,
}: {
  title?: string;
  options: FilterOption[];
  className?: string;
}) {
  return (
    <section className={cn("product-page-shell py-8", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {title && <h2 className="text-heading-card font-medium uppercase">{title}</h2>}
        <div className="no-scrollbar flex overflow-x-auto pb-1" style={{ gap: "var(--filter-bar-gap)" }}>
          {options.map((option) => {
            const classes = cn(
              "shrink-0 whitespace-nowrap rounded-pill border text-body font-medium transition-colors",
              option.active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:bg-primary hover:text-primary-foreground"
            );

            if (option.href) {
              return (
                <Link
                  key={option.label}
                  href={option.href}
                  className={classes}
                  style={{
                    paddingInline: "var(--filter-chip-px)",
                    paddingBlock: "var(--filter-chip-py)",
                  }}
                >
                  {option.label}
                </Link>
              );
            }

            return (
              <button
                key={option.label}
                type="button"
                className={classes}
                style={{
                  paddingInline: "var(--filter-chip-px)",
                  paddingBlock: "var(--filter-chip-py)",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
