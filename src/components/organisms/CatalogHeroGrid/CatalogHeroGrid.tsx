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
      <Band className="bg-top" />

      <div className="catalog-hero-grid-shell">
        {featured.map((collection) => (
          <Link
            key={collection.slug}
            href={ROUTES.COLLECTION(collection.slug)}
            className="group catalog-hero-grid-card"
          >
            <div className="catalog-hero-grid-media">
              <Image
                src={collection.coverImage}
                alt={collection.name}
                fill
                sizes="(max-width: 768px) 40vw, 20vw"
                className="object-cover object-top blur-[1px] brightness-90 transition duration-500 group-hover:blur-0 group-hover:brightness-100"
              />
              <span className="catalog-hero-grid-label">
                {collection.name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Band className="bg-top -scale-y-100" />
    </section>
  );
}

function Band({ className }: { className?: string }) {
  return (
    <div
      className={`section-divider-band ${className ?? ""}`}
      style={{ backgroundImage: "url(/images/section-divider.png)" }}
      aria-hidden
    />
  );
}
