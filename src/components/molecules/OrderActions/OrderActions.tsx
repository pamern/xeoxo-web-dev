import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

export type OrderActionLink = {
  href: string;
  label: string;
  variant: "primary" | "secondary";
};

export type OrderActionsProps = {
  actions: OrderActionLink[];
  className?: string;
};

function ActionLink({ href, label, variant }: OrderActionLink) {
  return (
    <Button
      href={href}
      size="custom"
      variant={variant === "primary" ? "imagePill" : "customPill"}
      backgroundImage={variant === "primary" ? "/images/button_background.png" : undefined}
      className={cn(
        "min-h-[52px] min-w-[148px] rounded-pill px-8 py-2 text-center whitespace-nowrap transition-[transform,filter,box-shadow,background-color,color,border-color] duration-200",
        variant === "primary"
          ? "border border-primary bg-cover bg-center text-[18px] font-bold text-white shadow-[0_10px_22px_rgba(207,92,67,0.24)] hover:-translate-y-px hover:brightness-[0.98] hover:shadow-[0_14px_26px_rgba(207,92,67,0.28)]"
          : "border-2 border-black bg-white text-[16px] font-medium text-black hover:-translate-y-px hover:bg-black hover:text-white hover:shadow-[0_10px_18px_rgba(0,0,0,0.12)]",
      )}
    >
      {label}
    </Button>
  );
}

export function OrderActions({ actions, className }: OrderActionsProps) {
  if (!actions.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-4",
        className,
      )}
    >
      {actions.map((action) => (
        <ActionLink
          key={`${action.label}-${action.href}`}
          {...action}
        />
      ))}
    </div>
  );
}
