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
    <section className={cn("catalog-shell py-8", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {title && <h2 className="text-heading-section font-medium uppercase">{title}</h2>}
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1 xl:gap-3">
          {options.map((option) => {
            const classes = cn(
              "shrink-0 whitespace-nowrap rounded-pill border px-4 py-2 text-base font-medium leading-[1.12] transition-colors xl:px-[18px] xl:py-[9px]",
              option.active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:bg-primary hover:text-primary-foreground"
            );

            if (option.href) {
              return (
                <Link key={option.label} href={option.href} className={classes}>
                  {option.label}
                </Link>
              );
            }

            return (
              <button key={option.label} type="button" className={classes}>
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
