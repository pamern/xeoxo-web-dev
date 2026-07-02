import { cn } from "@/lib/utils";

export type TimeSlot = {
  id: string;
  label: string;
  disabled?: boolean;
};

export function TimeSlotPicker({
  label,
  slots,
  value,
  onChange,
  className,
  legendClassName,
}: {
  label: string;
  slots: TimeSlot[];
  value?: string;
  onChange: (id: string) => void;
  className?: string;
  legendClassName?: string;
}) {
  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className={cn("text-base font-medium", legendClassName)}>{label}</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            disabled={slot.disabled}
            onClick={() => onChange(slot.id)}
            className={cn(
              "h-[39px] rounded-[19.5px] border border-black bg-white px-3 text-sm font-medium text-black transition-colors",
              value === slot.id
                ? "bg-black text-white"
                : "hover:bg-black hover:text-white",
              slot.disabled && "cursor-not-allowed opacity-40"
            )}
          >
            {slot.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
