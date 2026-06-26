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
import { categoryRoute, collectionRoute } from "@/constants/routes";
import { COLLECTIONS, MATERIALS, VALUE_PROPS } from "@/data/catalog";
import { getCategoriesByGender, getProductsByCategory } from "@/data/queries";
import type { Gender } from "@/types/product.types";

const GENDER_CONTENT: Record<
  Gender,
  { heroLabel: string; productLabel: string; banner: string }
> = {
  nu: {
    heroLabel: "ĐỒ NỮ",
    productLabel: "DÀNH CHO NỮ",
    banner: "/images/banners/cat-dam-vay.png",
  },
  nam: {
    heroLabel: "ĐỒ NAM",
    productLabel: "DÀNH CHO NAM",
    banner: "/images/banners/cat-ao-cuoi.png",
  },
};

export function buildCatalogMetadata(gender: Gender): Metadata {
  const label = GENDER_CONTENT[gender].heroLabel;
  return {
    title: label,
    description: `Khám phá bộ sưu tập ${label.toLowerCase()} của XÉO XỌ — áo dài, đầm, váy và nhiều thiết kế Á Đông hiện đại.`,
  };
}

// Trang catalog dùng chung cho Nam & Nữ — khác nhau ở data theo gender.
export function CatalogPage({ gender }: { gender: Gender }) {
  const content = GENDER_CONTENT[gender];
  if (!content) notFound();

  const categories = getCategoriesByGender(gender);
  const firstCollection = COLLECTIONS[0];

  return (
    <SiteLayout>
      {/* Hero đầu trang */}
      <CatalogHero
        label={content.heroLabel}
        image={content.banner}
        ctaHref={collectionRoute(firstCollection.slug)}
        collectionNote={`Khám phá ngay bộ sưu tập ${firstCollection.name}`}
      />

      {/* Khối 3 ảnh bộ sưu tập nổi bật + dải texture */}
      <CatalogHeroGrid collections={COLLECTIONS} />

      {/* Hàng nút lọc theo bộ sưu tập */}
      <section className="mx-auto w-full max-w-site px-6 py-8 xl:px-[100px]">
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          <FilterPill href={categoryRoute(gender, categories[0]?.slug ?? "")} active>
            Sản phẩm mới
          </FilterPill>
          {COLLECTIONS.map((collection) => (
            <FilterPill key={collection.slug} href={collectionRoute(collection.slug)}>
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
              href={categoryRoute(gender, category.slug)}
            />
          )}
          <ProductRow
            title={
              index === 0
                ? `SẢN PHẨM ${content.productLabel}`
                : `SẢN PHẨM ${category.name.toUpperCase()}`
            }
            products={getProductsByCategory(category.slug)}
            actionHref={categoryRoute(gender, category.slug)}
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
