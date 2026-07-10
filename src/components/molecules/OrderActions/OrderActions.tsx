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
        "min-h-[34px] min-w-[140px] !rounded-[3px] px-6 py-1.5 text-center whitespace-nowrap transition-[transform,filter,box-shadow,background-color,color,border-color] duration-200",
        variant === "primary"
          ? "border-2 border-[#ff593d] bg-cover bg-center text-[15px] font-bold text-white shadow-none hover:-translate-y-px hover:brightness-[0.98]"
          : "border-2 border-black bg-white text-[14px] font-normal text-black shadow-none hover:-translate-y-px hover:bg-black hover:text-white",
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
        "flex flex-wrap items-center justify-end gap-5",
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
