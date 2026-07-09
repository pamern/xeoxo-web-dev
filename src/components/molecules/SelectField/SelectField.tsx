import { type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
};

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  wrapperClassName?: string;
  labelClassName?: string;
}

export function SelectField({
  label,
  options,
  error,
  className,
  wrapperClassName,
  labelClassName,
  ...props
}: SelectFieldProps) {
  return (
    <label className={cn("flex w-full flex-col gap-2 text-heading-content-sm font-medium", wrapperClassName)}>
      {label && <span className={labelClassName}>{label}</span>}
      <span className="relative block w-full">
        <select
          className={cn(
            "h-12 w-full appearance-none rounded-md border border-input bg-background px-4 pr-11 text-body-lg font-light outline-none transition-colors focus:border-primary",
            error && "border-destructive",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-5 top-1/2 h-2.5 w-2.5 -translate-y-2/3 rotate-45 border-b-2 border-r-2 border-current"
        />
      </span>
      {error && <span className="text-body-sm font-light text-destructive">{error}</span>}
    </label>
  );
}
