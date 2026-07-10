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
    <section className={cn("mx-auto w-full max-w-site px-6 py-8 xl:px-[100px]", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {title && <h2 className="text-xl font-medium uppercase">{title}</h2>}
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {options.map((option) => {
            const classes = cn(
              "shrink-0 whitespace-nowrap rounded-pill border px-5 py-2.5 text-base font-medium transition-colors",
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
