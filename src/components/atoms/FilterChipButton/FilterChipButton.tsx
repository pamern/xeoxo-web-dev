import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface FilterChipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const FilterChipButton = forwardRef<HTMLButtonElement, FilterChipButtonProps>(
  ({ active, className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-[4px] border px-5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-primary bg-background text-foreground hover:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);

FilterChipButton.displayName = "FilterChipButton";
