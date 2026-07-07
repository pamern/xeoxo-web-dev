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
    <section className="group relative flex min-h-[480px] items-end overflow-hidden md:h-[615px]">
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

      <div className="relative mx-auto flex w-full max-w-site flex-col gap-3 px-6 pb-[74px] xl:px-[100px]">
        <div className="flex flex-col gap-[13px]">
          <h1 className="text-shadow text-5xl font-extrabold uppercase text-white md:text-[80px]">
            {label}
          </h1>
          <Link
            href={ctaHref}
            className="inline-flex w-fit items-center justify-center rounded-[30px] border border-white px-8 py-3 text-xl font-medium text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,1)] text-shadow transition-colors hover:bg-white hover:text-black hover:[text-shadow:none] md:text-heading-section"
          >
            Khám phá
          </Link>
        </div>
      </div>
    </section>
  );
}
