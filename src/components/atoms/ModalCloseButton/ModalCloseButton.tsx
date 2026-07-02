import { cn } from "@/lib/utils";

export function ModalCloseButton({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Dong"
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-border text-2xl leading-none transition-colors hover:border-primary hover:text-primary",
        className
      )}
    >
      x
    </button>
  );
}
