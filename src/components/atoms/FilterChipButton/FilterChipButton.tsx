import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface FilterChipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const FilterChipButton = forwardRef<
  HTMLButtonElement,
  FilterChipButtonProps
>(({ active, className, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-pressed={active}
    className={cn(
      "inline-flex h-[34px] items-center justify-center rounded-full border px-4 text-caption font-semibold transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-muted-foreground bg-background text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </button>
));

FilterChipButton.displayName = "FilterChipButton";
