import Image from "next/image";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type IconButtonVariant = "plain" | "circleLight" | "circleDark" | "bordered";
type IconButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<IconButtonVariant, string> = {
  plain: "bg-transparent hover:bg-muted",
  circleLight: "rounded-full bg-white/50 hover:bg-white/80",
  circleDark: "rounded-full bg-black/20 text-white ring-1 ring-white hover:bg-black/35",
  bordered: "rounded-full border border-primary bg-background hover:bg-muted",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconSrc: string;
  iconAlt?: string;
  iconSize?: number;
  iconClassName?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      iconSrc,
      iconAlt = "",
      iconSize = 18,
      iconClassName,
      variant = "plain",
      size = "md",
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <Image
        src={iconSrc}
        alt={iconAlt}
        width={iconSize}
        height={iconSize}
        aria-hidden={iconAlt === ""}
        className={iconClassName}
      />
    </button>
  )
);

IconButton.displayName = "IconButton";
