import Image from "next/image";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Button atom.
 * Keeps the legacy variants/sizes while adding Figma CTA styles as reusable tokens.
 */

type Variant =
  | "solid"
  | "outline"
  | "ghost"
  | "pillOutline"
  | "filter"
  | "imagePill"
  | "underline"
  | "heroOutline"
  | "primaryPill"
  | "secondaryPill"
  | "floralPill"
  | "cart";

type Size =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "hero"
  | "heroSm"
  | "pill"
  | "floral"
  | "cart";

const variantClasses: Record<Variant, string> = {
  solid: "bg-primary text-primary-foreground hover:bg-primary/85",
  outline: "border border-current bg-transparent hover:bg-current/10",
  ghost: "bg-transparent hover:bg-muted",
  pillOutline: "border-[3px] border-primary bg-background text-foreground hover:bg-muted",
  filter: "rounded-[4px] border border-primary bg-background text-foreground hover:bg-muted",
  imagePill:
    "border-2 border-primary bg-cover bg-center text-primary-foreground hover:opacity-90",
  underline:
    "h-auto rounded-none bg-transparent px-0 py-0 font-bold underline underline-offset-4 hover:opacity-70",
  heroOutline:
    "border border-white bg-primary text-primary-foreground shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:bg-primary/85",
  primaryPill:
    "border border-primary bg-primary text-primary-foreground hover:bg-primary/85",
  secondaryPill:
    "border border-primary bg-background text-foreground hover:bg-muted",
  floralPill:
    "border-2 border-primary bg-primary bg-cover bg-center text-primary-foreground shadow-[0_3px_6px_rgba(0,0,0,0.18)] hover:brightness-95",
  cart: "border border-primary bg-primary text-primary-foreground hover:bg-primary/85",
};

const sizeClasses: Record<Size, string> = {
  xs: "h-10 px-4 text-sm",
  sm: "h-10 px-5 text-base",
  md: "h-12 px-6 text-lg",
  lg: "h-14 px-8 text-xl",
  xl: "h-[70px] px-10 text-xl",
  hero: "h-[56px] min-w-[297px] px-10 text-xl font-bold uppercase",
  heroSm: "h-10 min-w-[235px] px-8 text-base font-bold uppercase",
  pill: "h-10 min-w-[235px] px-8 text-base font-bold",
  floral: "h-10 min-w-[252px] px-8 text-base font-bold",
  cart: "h-[70px] min-w-[546px] px-10 text-xl font-bold uppercase",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  iconSrc?: string;
  iconAlt?: string;
  iconSize?: number;
  iconClassName?: string;
  backgroundImage?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "solid",
      size = "md",
      isLoading,
      disabled,
      children,
      iconSrc,
      iconAlt = "",
      iconSize = 20,
      iconClassName,
      backgroundImage,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{
          ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}),
          ...style,
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-colors",
          "whitespace-nowrap",
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
        {iconSrc && !isLoading && (
          <Image
            src={iconSrc}
            alt={iconAlt}
            width={iconSize}
            height={iconSize}
            aria-hidden={iconAlt === ""}
            className={iconClassName}
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
