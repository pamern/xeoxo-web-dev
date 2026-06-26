import Image from "next/image";
import Link from "next/link";
import { collectionRoute } from "@/constants/routes";
import type { Collection } from "@/types/product.types";

// Khối đầu trang catalog (Figma node 1:143): 3 ảnh bộ sưu tập nổi bật ở giữa,
// kẹp giữa 2 dải texture trên/dưới.
export function CatalogHeroGrid({ collections }: { collections: Collection[] }) {
  const featured = collections.slice(0, 3);

  return (
    <section className="flex flex-col">
      {/* Dải texture trên */}
      <Band className="bg-top" />

      <div className="mx-auto flex max-w-site flex-wrap items-center justify-center gap-[29px] px-6 py-[39px] xl:px-[100px]">
        {featured.map((collection) => (
          <Link
            key={collection.slug}
            href={collectionRoute(collection.slug)}
            className="group relative h-[450px] w-[330px] overflow-hidden rounded-md bg-[#d9d9d9]"
          >
            <Image
              src={collection.coverImage}
              alt={collection.name}
              fill
              sizes="330px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-xl font-medium text-white text-shadow">
              {collection.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Dải texture dưới — lật dọc dải trên */}
      <Band className="bg-top -scale-y-100" />
    </section>
  );
}

function Band({ className }: { className?: string }) {
  return (
    <div
      className={`h-[39px] w-full bg-[length:100%_auto] ${className ?? ""}`}
      style={{ backgroundImage: "url(/brand/texture.png)" }}
      aria-hidden
    />
  );
}
