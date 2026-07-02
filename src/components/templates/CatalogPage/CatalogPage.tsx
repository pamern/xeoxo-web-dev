import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogHero } from "@/components/organisms/CatalogHero";
import { CatalogHeroGrid } from "@/components/organisms/CatalogHeroGrid";
import { Materials } from "@/components/organisms/Materials";
import { ProductRow } from "@/components/organisms/ProductRow";
import { StarsBanner } from "@/components/organisms/StarsBanner";
import { ValueProposition } from "@/components/organisms/ValueProposition";
import { CategoryBanner } from "@/components/molecules/CategoryBanner";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import { CATEGORIES, COLLECTIONS, MATERIALS, VALUE_PROPS } from "@/data/catalog";
import { getCategoriesByGender, getProductsByCategory } from "@/data/queries";
import type { ProductCategory } from "@/types/product.types";

export type CatalogSlug = "nu" | "nam" | "tre-em" | "ao-dai";

const CATALOG_CONTENT: Record<
  CatalogSlug,
  {
    heroLabel: string;
    productLabel: string;
    banner: string;
    categories: () => ProductCategory[];
  }
> = {
  nu: {
    heroLabel: "ĐỒ NỮ",
    productLabel: "DÀNH CHO NỮ",
    banner: "/images/cat-dam-vay.png",
    categories: () => getCategoriesByGender("nu"),
  },
  nam: {
    heroLabel: "ĐỒ NAM",
    productLabel: "DÀNH CHO NAM",
    banner: "/images/cat-ao-cuoi.png",
    categories: () => getCategoriesByGender("nam"),
  },
  "tre-em": {
    heroLabel: "ĐỒ TRẺ EM",
    productLabel: "DÀNH CHO TRẺ EM",
    banner: "/images/cat-ao-dai.png",
    categories: () => getCategoriesByGender("tre-em"),
  },
  "ao-dai": {
    heroLabel: "ÁO DÀI",
    productLabel: "ÁO DÀI",
    banner: "/images/cat-ao-dai.png",
    categories: () => CATEGORIES.filter((category) => category.slug.includes("ao-dai")),
  },
};

export const CATALOG_SLUGS = Object.keys(CATALOG_CONTENT) as CatalogSlug[];

export function buildCatalogMetadata(slug: CatalogSlug): Metadata {
  const label = CATALOG_CONTENT[slug].heroLabel;
  return {
    title: label,
    description: `Khám phá bộ sưu tập ${label.toLowerCase()} của XÉO XỌ — áo dài, đầm, váy và nhiều thiết kế Á Đông hiện đại.`,
  };
}

// Trang catalog/landing dùng chung cho các entry từ header.
export function CatalogPage({ slug }: { slug: CatalogSlug }) {
  const content = CATALOG_CONTENT[slug];
  if (!content) notFound();

  const categories = content.categories();
  const firstCollection = COLLECTIONS[0];

  return (
    <SiteLayout>
      {/* Hero đầu trang */}
      <CatalogHero
        label={content.heroLabel}
        image={content.banner}
        ctaHref={ROUTES.COLLECTION(firstCollection.slug)}
        collectionNote={`Khám phá ngay bộ sưu tập ${firstCollection.name}`}
      />

      {/* Khối 3 ảnh bộ sưu tập nổi bật + dải texture */}
      <CatalogHeroGrid collections={COLLECTIONS} />

      {/* Hàng nút lọc theo bộ sưu tập */}
      <section className="mx-auto w-full max-w-site px-6 py-8 xl:px-[100px]">
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          <FilterPill href={ROUTES.CATEGORY(categories[0]?.slug ?? "")} active>
            Sản phẩm mới
          </FilterPill>
          {COLLECTIONS.map((collection) => (
            <FilterPill key={collection.slug} href={ROUTES.COLLECTION(collection.slug)}>
              {collection.name}
            </FilterPill>
          ))}
        </div>
      </section>

      {/* Hàng sản phẩm xen kẽ banner danh mục */}
      {categories.map((category, index) => (
        <div key={category.slug}>
          {index > 0 && (
            <CategoryBanner
              title={`SẢN PHẨM ${category.name.toUpperCase()}`}
              image={content.banner}
              href={ROUTES.CATEGORY(category.slug)}
            />
          )}
          <ProductRow
            title={
              index === 0
                ? `SẢN PHẨM ${content.productLabel}`
                : `SẢN PHẨM ${category.name.toUpperCase()}`
            }
            products={getProductsByCategory(category.slug)}
            actionHref={ROUTES.CATEGORY(category.slug)}
          />
        </div>
      ))}

      {/* Định vị giá trị + công nghệ vải */}
      <ValueProposition values={VALUE_PROPS} />
      <Materials materials={MATERIALS} />

      <StarsBanner />
    </SiteLayout>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "shrink-0 whitespace-nowrap rounded-pill bg-black px-6 py-3 text-lg font-medium text-white"
          : "shrink-0 whitespace-nowrap rounded-pill border border-black px-6 py-3 text-lg font-medium transition-colors hover:bg-black hover:text-white"
      }
    >
      {children}
    </Link>
  );
}
