import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "default" | "link";
}

export const TextActionButton = forwardRef<HTMLButtonElement, TextActionButtonProps>(
  ({ tone = "default", className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex w-fit items-center justify-center text-sm font-bold underline underline-offset-4 transition-opacity hover:opacity-70",
        tone === "link" && "text-[#3568ff]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);

TextActionButton.displayName = "TextActionButton";
