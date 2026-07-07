import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function VipBanner({
  title = "Gia nhap Xeo Hoi de nhan dac quyen rieng",
  description = "Uu dai thanh vien, qua tang sinh nhat va lich hen uu tien.",
  href = ROUTES.MEMBERSHIP,
  className,
}: {
  title?: string;
  description?: string;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between gap-4 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-primary transition-colors hover:bg-primary/10",
        className
      )}
    >
      <span className="flex items-center gap-3">
        <Image src="/icons/vip.svg" alt="" width={20} height={20} aria-hidden />
        <span className="flex flex-col">
          <span className="text-body-sm font-medium">{title}</span>
          {description && <span className="text-body-sm font-light text-foreground/70">{description}</span>}
        </span>
      </span>
      <Image src="/icons/chevron-down.svg" alt="" width={14} height={8} aria-hidden />
    </Link>
  );
}
