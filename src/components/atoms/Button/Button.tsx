import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Button - atom cơ bản. Dùng design token qua class Tailwind.
 * - solid: nền đen chữ trắng (CTA chính)
 * - outline: viền + nền trong suốt (dùng trên ảnh, có shadow chữ)
 * - ghost: không nền
 */

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  solid: "bg-primary text-primary-foreground hover:bg-primary/85",
  outline:
    "border border-current bg-transparent hover:bg-current/10",
  ghost: "bg-transparent hover:bg-muted",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-5 text-base",
  md: "h-12 px-6 text-lg",
  lg: "h-14 px-8 text-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "solid", size = "md", isLoading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
