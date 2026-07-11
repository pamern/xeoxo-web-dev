import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

export type OrderActionLink = {
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  label: string;
  variant: "primary" | "secondary";
};

export type OrderActionsProps = {
  actions: OrderActionLink[];
  className?: string;
};

function ActionLink({ href, onClick, label, variant }: OrderActionLink) {
  return (
    <Button
      href={href}
      onClick={onClick}
      size="custom"
      variant={variant === "primary" ? "imagePill" : "outline"}
      backgroundImage={variant === "primary" ? "/images/button_background.png" : undefined}
      className={cn(
        "min-h-[42px] min-w-[124px] rounded-pill px-6 py-2 text-center whitespace-nowrap transition-[transform,filter,box-shadow,background-color,color,border-color] duration-200",
        variant === "primary"
          ? "border border-primary bg-cover bg-center text-sm font-bold text-white shadow-[0_10px_22px_rgba(207,92,67,0.24)] hover:-translate-y-px hover:brightness-[0.98] hover:shadow-[0_14px_26px_rgba(207,92,67,0.28)] md:text-base"
          : "border-2 border-black bg-white text-sm font-medium text-black hover:-translate-y-px hover:bg-black hover:text-white hover:shadow-[0_10px_18px_rgba(0,0,0,0.12)] md:text-base",
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
        "flex flex-wrap items-center justify-end gap-3",
        className,
      )}
    >
      {actions.map((action) => (
        <ActionLink
          key={`${action.label}-${action.href || ""}`}
          {...action}
        />
      ))}
    </div>
  );
}
