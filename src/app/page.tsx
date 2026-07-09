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
  getCategoryProductSections,
  getHomepageCollections,
} from "@/features/homepage/homepage.service";
import type { HomepageProductSection } from "@/types/homepage.types";
import type { Collection } from "@/types/product.types";
import Image from "next/image";
import Link from "next/link";

async function getHomePageProductSections() {
  try {
    return await getCategoryProductSections({ limit: 4 });
  } catch (error) {
    console.error("[homepage] Failed to load product sections", error);
    return [] satisfies HomepageProductSection[];
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

function getHomepageCategoryBannerImage(section: HomepageProductSection) {
  const normalized = `${section.categorySlug} ${section.categoryName}`.toLowerCase();

  if (
    normalized.includes("đầm") ||
    normalized.includes("dam") ||
    normalized.includes("váy") ||
    normalized.includes("vay")
  ) {
    return "/images/cat-dam-vay.png";
  }

  if (
    normalized.includes("cưới") ||
    normalized.includes("cuoi") ||
    normalized.includes("đôi") ||
    normalized.includes("doi")
  ) {
    return "/images/cat-ao-cuoi.png";
  }

  return "/images/cat-ao-dai.png";
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

      <section className="relative w-full overflow-hidden py-8">
        <Image
          src="/images/bg-gia-nhap-btn.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          aria-hidden
        />
        <div className="no-scrollbar relative mx-auto flex w-full max-w-site gap-5 overflow-x-auto px-6 py-10 xl:px-[100px]">
          {homepageCollections.map((collection) => (
            <CollectionCard
              key={collection.slug}
              collection={collection}
              revealOnHover
              className="w-[280px] shrink-0"
            />
          ))}
        </div>
      </section>

      <GenderSelect />

      <section className="mx-auto w-full max-w-site px-6 pb-12 xl:px-[100px]">
        <Link
          href={ROUTES.PERSONAL_COLOR}
          className="group relative flex min-h-[260px] overflow-hidden rounded-lg md:min-h-[420px] lg:min-h-[615px]"
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
          <div className="relative mt-auto flex flex-col items-start px-6 pb-8 text-white md:px-20 md:pb-20">
            <span className="text-shadow text-2xl font-light md:text-[40px] md:leading-tight">
              Tìm kiếm
            </span>
            <h2 className="text-shadow mt-2 text-2xl font-extrabold uppercase md:text-[40px] md:leading-tight">
              PERSONAL COLOR
            </h2>
            <span className="text-shadow mt-5 inline-flex min-w-[150px] items-center justify-center rounded-pill border border-white px-6 py-2 text-lg font-bold transition-colors group-hover:bg-white group-hover:text-black group-hover:[text-shadow:none] md:min-w-[289px] md:py-3 md:text-[24px]">
              Khám phá
            </span>
          </div>
        </Link>
      </section>

      {productSections.map((section) => (
        <div key={section.categorySlug}>
          <CategoryBanner
            title={section.categoryName}
            image={getHomepageCategoryBannerImage(section)}
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
