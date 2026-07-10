import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Banner danh mục: ảnh nền + tên + nút CTA, overlay tối để chữ trắng nổi bật.
export function CategoryBanner({
  title,
  image,
  href,
  ctaLabel = "Xem chi tiết",
  className,
}: {
  title: string;
  image: string;
  href: string;
  ctaLabel?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "group category-banner-shell",
        className
      )}
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div
        className="absolute inset-0 bg-black/25 transition-colors duration-700 group-hover:bg-black/35"
        aria-hidden
      />
      <div className="category-banner-content">
        <h2 className="category-banner-title">
          {title}
        </h2>
        <Link
          href={href}
          className="category-banner-cta"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
