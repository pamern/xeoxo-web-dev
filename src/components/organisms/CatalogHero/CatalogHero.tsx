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
    <section className="group catalog-hero-shell">
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

      <div className="catalog-hero-content">
        <div className="flex flex-col gap-[13px]">
          <h1 className="catalog-hero-title">
            {label}
          </h1>
          <Link
            href={ctaHref}
            className="catalog-hero-cta"
          >
            Khám phá
          </Link>
        </div>
      </div>
    </section>
  );
}
