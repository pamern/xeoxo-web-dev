import { CategoryBanner } from "@/components/molecules/CategoryBanner";
import { CollectionCard } from "@/components/molecules/CollectionCard";
import { GenderSelect } from "@/components/organisms/GenderSelect";
import { HeroCarousel } from "@/components/organisms/HeroCarousel";
import { ProductRow } from "@/components/organisms/ProductRow";
import { StarsBanner } from "@/components/organisms/StarsBanner";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import { COLLECTIONS } from "@/data/catalog";
import {
  getHomepageCollections,
  getHomepageCustomSections,
  type HomepageCustomSectionDto,
} from "@/features/homepage/homepage.service";
import type { Collection } from "@/types/product.types";
import Image from "next/image";
import Link from "next/link";

async function getHomePageProductSections() {
  try {
    return await getHomepageCustomSections({ limit: 4 });
  } catch (error) {
    console.error("[homepage] Failed to load product sections", error);
    return [] satisfies HomepageCustomSectionDto[];
  }
}

async function getHomePageCollections() {
  try {
    const collections = await getHomepageCollections({ limit: 5 });
    return collections.length > 0 ? collections : COLLECTIONS;
  } catch (error) {
    console.error("[homepage] Failed to load collections", error);
    return [] satisfies Collection[];
  }
}

function formatProductSectionTitle(categoryName: string) {
  return `Sản phẩm ${categoryName}`;
}

export default async function HomePage() {
  const [productSections, collections] = await Promise.all([
    getHomePageProductSections(),
    getHomePageCollections(),
  ]);
  const homepageCollections = collections.length > 0 ? collections : COLLECTIONS;

  return (
    <SiteLayout>
      <HeroCarousel slides={homepageCollections} />

      <section className="relative w-full overflow-hidden py-6 md:py-8">
        <Image
          src="/images/bg-gia-nhap-btn.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          aria-hidden
        />
        <div className="homepage-shell no-scrollbar relative grid auto-cols-[minmax(16rem,1fr)] grid-flow-col gap-3 overflow-x-auto py-6 md:gap-4 md:py-8 xl:grid-flow-row xl:grid-cols-5 xl:overflow-visible">
          {homepageCollections.map((collection) => (
            <CollectionCard
              key={collection.slug}
              collection={collection}
              revealOnHover
              className="min-w-0 w-full"
            />
          ))}
        </div>
      </section>

      <GenderSelect />

      <section className="homepage-shell pb-10 md:pb-12">
        <Link
          href={ROUTES.PERSONAL_COLOR}
          className="group relative flex w-full aspect-[1728/615] overflow-hidden rounded-lg min-h-[160px]"
        >
          <Image
            src="/images/homepage_personal_color.png"
            alt="Find your personal color"
            fill
            sizes="(max-width: 768px) 100vw, 1529px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
            aria-hidden
          />
          <div className="relative mt-auto flex flex-col items-start px-5 pb-6 text-white md:px-8 md:pb-10 xl:px-16 xl:pb-16">
            <span className="text-shadow text-2xl font-light leading-tight">
              Tìm kiếm
            </span>
            <h2 className="text-shadow mt-2 text-2xl font-extrabold uppercase leading-tight">
              PERSONAL COLOR
            </h2>
            <span className="text-shadow mt-4 inline-flex min-w-[150px] items-center justify-center rounded-pill border border-white px-5 py-2 text-lg font-bold transition-colors group-hover:bg-white group-hover:text-black group-hover:[text-shadow:none] md:min-w-[220px] md:px-6 md:py-3">
              Khám phá
            </span>
          </div>
        </Link>
      </section>

      {productSections.map((section) => (
        <div key={section.categorySlug}>
          <CategoryBanner
            title={section.categoryName}
            image={section.bannerImage}
            href={ROUTES.CATEGORY(section.categorySlug)}
          />

          <ProductRow
            title={formatProductSectionTitle(section.categoryName)}
            products={section.products}
            actionHref={ROUTES.CATEGORY(section.categorySlug)}
            quickAddOnHover
          />
        </div>
      ))}

      <StarsBanner />
    </SiteLayout>
  );
}
