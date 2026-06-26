import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const GENDERS = [
  {
    label: "ĐỒ NỮ",
    image: "/images/banners/gender-nu.png",
    href: ROUTES.CATALOG_WOMEN,
  },
  {
    label: "ĐỒ NAM",
    image: "/images/banners/gender-nam.png",
    href: ROUTES.CATALOG_MEN,
  },
] as const;

// Khối chọn giới tính ở trang chủ: 2 thẻ ảnh lớn dẫn tới catalog tương ứng.
export function GenderSelect() {
  return (
    <section className="mx-auto grid w-full max-w-site gap-8 px-6 py-12 md:grid-cols-2 xl:px-[100px]">
      {GENDERS.map((gender) => (
        <Link
          key={gender.label}
          href={gender.href}
          className="group relative flex aspect-[742/295] items-end overflow-hidden rounded-lg"
        >
          <Image
            src={gender.image}
            alt={gender.label}
            fill
            sizes="(max-width: 768px) 100vw, 742px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20" aria-hidden />
          <div className="relative flex flex-col items-start gap-3 p-8">
            <span className="text-shadow-soft text-3xl font-extrabold text-white md:text-4xl">
              {gender.label}
            </span>
            <span className="inline-flex items-center rounded-pill border border-white px-5 py-2 text-lg font-medium text-white transition-colors group-hover:bg-white group-hover:text-black">
              Khám phá
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
