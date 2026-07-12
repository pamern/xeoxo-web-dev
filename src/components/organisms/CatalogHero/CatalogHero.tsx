import Link from "next/link";
import Image from "next/image";

// Khối đầu trang catalog: ảnh nền lớn, tiêu đề và CTA nổi trên ảnh.
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
    <Link
      href={ctaHref}
      className="group relative flex min-h-[320px] items-end overflow-hidden cursor-pointer sm:min-h-[400px] lg:min-h-[520px]"
    >
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

      <div className="catalog-shell relative flex flex-col gap-2.5 pb-8 xl:gap-[18px] xl:pb-12">
        <div className="flex flex-col gap-[13px]">
          <h1 className="text-shadow text-5xl font-extrabold uppercase leading-none text-white">
            {label}
          </h1>
          <span className="inline-flex min-h-control w-fit items-center justify-center rounded-pill border border-white px-8 text-button-lg text-white text-shadow transition-colors hover:bg-white hover:text-black hover:[text-shadow:none]">
            Khám phá
          </span>
        </div>
      </div>
    </Link>
  );
}
