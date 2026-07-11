import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { Collection } from "@/types/product.types";

export function CatalogHeroGrid({ collections }: { collections: Collection[] }) {
  const featured = collections.slice(0, 5);

  return (
    <section className="flex flex-col">
      <Band className="bg-top" />

      <div className="catalog-shell grid grid-cols-1 gap-4 py-6 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-5 xl:gap-[29px] xl:py-[clamp(24px,2.29px+1.70vw,39px)]">
        {featured.map((collection) => (
          <Link
            key={collection.slug}
            href={ROUTES.COLLECTION(collection.slug)}
            className="group relative z-0 aspect-[4/5] min-w-0 transition-transform duration-500 ease-out hover:z-20 hover:scale-[1.02] hover:shadow-xl sm:aspect-[3/4]"
          >
            <div className="relative h-full w-full overflow-hidden rounded-md bg-border-strong">
              <Image
                src={collection.coverImage}
                alt={collection.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
                className="object-cover object-top blur-[1px] brightness-90 transition duration-500 group-hover:blur-0 group-hover:brightness-100"
              />
              <span className="absolute inset-0 flex items-end bg-black/20 px-4 pb-4 text-lg font-bold text-white transition duration-300 text-shadow xl:bg-black/10 xl:px-5 xl:pb-5 xl:text-2xl xl:opacity-0 xl:group-hover:bg-black/20 xl:group-hover:opacity-100">
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
      className={`h-[clamp(28px,12px+1.25vw,39px)] w-full bg-[length:100%_auto] ${className ?? ""}`}
      style={{ backgroundImage: "url(/images/section-divider.png)" }}
      aria-hidden
    />
  );
}
