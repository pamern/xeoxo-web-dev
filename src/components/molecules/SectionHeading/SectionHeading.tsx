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
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <h2 className="text-heading-section font-medium uppercase">{title}</h2>
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
