import Link from "next/link";
import { cn } from "@/lib/utils";

// Tiêu đề một khối nội dung + link "Xem đầy đủ" tùy chọn (bám layout Figma).
export function SectionHeading({
  title,
  actionHref,
  actionLabel = "Xem đầy đủ",
  className,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end sm:gap-4", className)}>
      <h2 className="min-w-0 text-2xl font-medium uppercase">{title}</h2>
      {actionHref && (
        <Link
          href={actionHref}
          className="shrink-0 text-body-sm underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
