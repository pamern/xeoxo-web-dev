import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? props.name ?? label;

    return (
      <label className="flex w-full flex-col gap-2 text-base font-medium">
        <span>{label}</span>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-12 rounded-md border border-input bg-background px-4 text-base font-light outline-none transition-colors",
            "placeholder:text-muted-foreground focus:border-primary",
            error && "border-destructive",
            className
          )}
          {...props}
        />
        {error && <span className="text-sm font-light text-destructive">{error}</span>}
      </label>
    );
  }
);

TextField.displayName = "TextField";
