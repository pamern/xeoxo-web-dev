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
        "!h-auto !min-w-0 min-h-[26px] !rounded-[2px] !px-4 !py-1 text-center whitespace-nowrap transition-colors duration-200",
        variant === "primary"
          ? "border border-black bg-cover bg-center text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(207,92,67,0.18)] hover:opacity-90"
          : "border border-black bg-transparent text-[11px] font-medium text-black hover:bg-black hover:text-white",
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
