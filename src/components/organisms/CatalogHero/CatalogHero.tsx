import Link from "next/link";
import Image from "next/image";

// Khối đầu trang catalog (Figma node 1:142): ảnh nền lớn, tiêu đề ĐỒ NAM/NỮ,
// nút "Khám phá" và dòng giới thiệu bộ sưu tập ở góc phải.
export function CatalogHero({
  label,
  image,
  ctaHref,
}: {
  label: string;
  image: string;
  ctaHref: string;
}) {
  return (
    <section className="group relative flex h-[min(70vh,760px)] min-h-[var(--catalog-hero-min-height)] items-end overflow-hidden">
      <Image
        src={image}
        alt={label}
        fill
        priority
        sizes="100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div
        className="absolute inset-0 bg-black/20 transition-colors duration-700 group-hover:bg-black/30"
        aria-hidden
      />

      <div
        className="product-page-shell relative flex flex-col gap-3"
        style={{ paddingBottom: "var(--hero-block-padding)" }}
      >
        <div className="flex flex-col gap-[clamp(10px,8px+0.16vw,13px)]">
          <h1 className="text-shadow text-display-hero uppercase text-white">
            {label}
          </h1>
          <Link
            href={ctaHref}
            className="inline-flex min-h-control w-fit items-center justify-center rounded-pill border border-white px-8 text-button-hero font-medium text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,1)] text-shadow transition-colors hover:bg-white hover:text-black hover:[text-shadow:none]"
          >
            Khám phá
          </Link>
        </div>
      </div>
    </section>
  );
}
