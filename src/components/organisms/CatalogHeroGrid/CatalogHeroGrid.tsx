import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { Collection } from "@/types/product.types";

// Khối đầu trang catalog (Figma node 1:143): 3 ảnh bộ sưu tập nổi bật ở giữa,
// kẹp giữa 2 dải texture trên/dưới.
export function CatalogHeroGrid({ collections }: { collections: Collection[] }) {
  const featured = collections.slice(0, 5);

  return (
    <section className="flex flex-col">
      {/* Dải texture trên */}
      <Band className="bg-top" />

      <div
        className="product-page-shell flex items-center justify-center"
        style={{
          gap: "var(--catalog-hero-grid-gap)",
          paddingBlock: "var(--catalog-hero-grid-py)",
        }}
      >
        {featured.map((collection) => (
          <Link
            key={collection.slug}
            href={ROUTES.COLLECTION(collection.slug)}
            className="group relative z-0 aspect-[3/4] min-w-0 flex-1 transition-transform duration-500 ease-out hover:z-20 hover:scale-[1.03] hover:shadow-xl"
          >
            <div className="relative h-full w-full overflow-hidden rounded-md bg-border-strong">
              <Image
                src={collection.coverImage}
                alt={collection.name}
                fill
                sizes="(max-width: 768px) 40vw, 20vw"
                className="object-cover object-top blur-[1px] brightness-90 transition duration-500 group-hover:blur-0 group-hover:brightness-100"
              />
              <span className="absolute inset-0 flex items-end bg-black/10 px-4 pb-4 text-heading-card font-bold text-white opacity-0 transition duration-300 group-hover:bg-black/20 group-hover:opacity-100 text-shadow">
                {collection.name}
              </span>
            </div>
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
      className={`w-full bg-[length:100%_auto] ${className ?? ""}`}
      style={{
        backgroundImage: "url(/images/section-divider.png)",
        height: "var(--catalog-hero-band-height)",
      }}
      aria-hidden
    />
  );
}
