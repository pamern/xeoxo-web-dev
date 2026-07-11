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
        "group relative flex min-h-[280px] items-center overflow-hidden md:min-h-[340px] xl:min-h-[410px]",
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
      <div className="site-container relative flex flex-col items-start gap-[18px] xl:gap-[27px]">
        <h2 className="max-w-2xl text-4xl font-medium text-white text-shadow">
          {title}
        </h2>
        <Link
          href={href}
          className="inline-flex min-h-control items-center rounded-pill border border-white px-6 text-base font-medium text-white text-shadow transition-colors hover:bg-white hover:text-black hover:[text-shadow:none]"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
