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
import { CatalogTabs } from "./CatalogTabs";
import { ROUTES } from "@/constants/routes";
import { COLLECTIONS, MATERIALS, MATERIALS_NU, VALUE_PROPS } from "@/data/catalog";
import {
  getCategoryProductSections,
  getHomepageCollections,
  getHomepageProductSections,
  getHomepageCustomSections,
  type CatalogDepartment,
} from "@/features/homepage/homepage.service";
import type { HomepageProductSection } from "@/types/homepage.types";

export type CatalogSlug = "nu" | "nam" | "tre-em" | "ao-dai";

const CATALOG_CONTENT: Record<
  CatalogSlug,
  {
    heroLabel: string;
    banner: string;
    department: CatalogDepartment | null;
    parentCategorySlug?: string;
    emptyTitle: string;
    emptyDescription: string;
  }
> = {
  nu: {
    heroLabel: "Đồ Nữ",
    banner: "/images/catalog/nu/đồ nữ.png",
    department: "WOMEN",
    emptyTitle: "Chưa có sản phẩm nữ",
    emptyDescription: "Các thiết kế dành cho nữ sẽ được cập nhật trong thời gian tới.",
  },
  nam: {
    heroLabel: "Đồ Nam",
    banner: "/images/catalog/nam/đồ nam.png",
    department: "MEN",
    emptyTitle: "Chưa có sản phẩm nam",
    emptyDescription: "Các thiết kế dành cho nam sẽ được cập nhật trong thời gian tới.",
  },
  "tre-em": {
    heroLabel: "Đồ Trẻ Em",
    banner: "/images/catalog/tre-em/main-banner.png",
    department: "KIDS",
    emptyTitle: "Hiện chưa có sản phẩm trẻ em",
    emptyDescription: "",
  },
  "ao-dai": {
    heroLabel: "Áo Dài",
    banner: "/images/cat-ao-dai.png",
    department: null,
    parentCategorySlug: "ao-dai",
    emptyTitle: "Chưa có sản phẩm áo dài",
    emptyDescription: "Các thiết kế áo dài sẽ được cập nhật trong thời gian tới.",
  },
};

export const CATALOG_SLUGS = Object.keys(CATALOG_CONTENT) as CatalogSlug[];

export function buildCatalogMetadata(slug: CatalogSlug): Metadata {
  const label = CATALOG_CONTENT[slug].heroLabel;
  return {
    title: label,
    description: `Khám phá bộ sưu tập ${label.toLowerCase()} của XÉO XỌ.`,
  };
}

async function getCatalogHeroCollections() {
  try {
    const collections = await getHomepageCollections({
      limit: 5,
      coverVariant: "vertical",
    });
    return collections.length > 0 ? collections : COLLECTIONS;
  } catch {
    return COLLECTIONS;
  }
}

async function getCatalogProductSections(
  slug: CatalogSlug,
  department: CatalogDepartment | null,
  parentCategorySlug?: string,
) {
  try {
    const categorySlugs = slug === "nu"
      ? ["ao-dam-chan-vay", "ao-dai-nu", "ao-dai-doi-cuoi"]
      : slug === "nam"
      ? ["ao-dai-nam", "ao-dai-doi-cuoi"]
      : [];

    if (categorySlugs.length > 0) {
      // Fetch other standard sections using getHomepageProductSections
      const standardSlugs = categorySlugs.filter((s) => s !== "ao-dai-doi-cuoi");
      const [standardSections, customSections] = await Promise.all([
        getHomepageProductSections({
          categorySlugs: standardSlugs,
          limit: 4,
        }),
        getHomepageCustomSections({ limit: 100 }),
      ]);

      // Map slugs to sections in the requested order
      const sectionsMap = new Map<string, HomepageProductSection>();
      for (const sect of standardSections) {
        sectionsMap.set(sect.categorySlug, sect);
      }

      const customDoiCuoi = customSections.find((s) => s.categorySlug === "ao-dai-doi-cuoi");
      if (customDoiCuoi) {
        const filteredProducts = customDoiCuoi.products
          .filter((p) => p.gender === (slug === "nu" ? "nu" : "nam"))
          .slice(0, 4);

        sectionsMap.set("ao-dai-doi-cuoi", {
          categoryId: 9999,
          categorySlug: "ao-dai-doi-cuoi",
          categoryName: "Áo dài đôi - Cưới",
          products: filteredProducts,
        });
      }

      return categorySlugs
        .map((s) => sectionsMap.get(s))
        .filter((s): s is HomepageProductSection => s !== undefined);
    }

    return await getCategoryProductSections({
      department: department ?? undefined,
      parentCategorySlug,
      limit: 4,
    });
  } catch {
    return [] satisfies HomepageProductSection[];
  }
}

function formatProductSectionTitle(categoryName: string) {
  return `Sản phẩm ${categoryName}`;
}

function getCategoryBannerImage(catalogSlug: CatalogSlug, categorySlug: string): string {
  const normSlug = categorySlug.toLowerCase();
  
  if (catalogSlug === "nu") {
    if (normSlug.includes("dam") || normSlug.includes("vay")) {
      return "/images/catalog/nu/ÁO ĐẦM - VÁY.png";
    }
    if (normSlug === "ao-dai" || normSlug.includes("ao-dai-nu")) {
      return "/images/catalog/nu/ÁO DÀI.png";
    }
    if (normSlug.includes("cuoi") || normSlug.includes("doi")) {
      return "/images/catalog/nu/_ÁO DÀI ĐÔI - ÁO DÀI CƯỚI.png";
    }
    return "/images/catalog/nu/đồ nữ.png";
  }

  if (catalogSlug === "nam") {
    if (normSlug.includes("ao-dai-nam")) {
      return "/images/catalog/nam/Áo dài Nam.png";
    }
    if (normSlug.includes("cuoi") || normSlug.includes("doi")) {
      return "/images/catalog/nam/_ÁO DÀI ĐÔI - ÁO DÀI CƯỚI.png";
    }
    return "/images/catalog/nam/đồ nam.png";
  }

  return "/images/cat-ao-dai.png";
}

// Trang catalog/landing dùng chung cho các entry từ header.
export async function CatalogPage({ slug }: { slug: CatalogSlug }) {
  const content = CATALOG_CONTENT[slug];
  if (!content) notFound();

  const [heroCollections, productSections] = await Promise.all([
    getCatalogHeroCollections(),
    getCatalogProductSections(slug, content.department, content.parentCategorySlug),
  ]);
  const allProducts = productSections.flatMap((section) => section.products);
  const uniqueProducts = Array.from(
    new Map(allProducts.map((p) => [p.id, p])).values()
  );

  const newestProducts = [...uniqueProducts]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 4);

  const bestSellingProducts = [...uniqueProducts]
    .sort((a, b) => (b.price - a.price) || (Number(a.id) - Number(b.id)))
    .slice(0, 4);

  const firstCollection = heroCollections[0];

  return (
    <SiteLayout>
      <CatalogHero
        label={content.heroLabel}
        image={content.banner}
        ctaHref={`/categories/${slug}`}
      />

      {slug !== "tre-em" && <CatalogHeroGrid collections={heroCollections} />}

      {(newestProducts.length > 0 || bestSellingProducts.length > 0) && (
        <CatalogTabs
          slug={slug}
          newestProducts={newestProducts}
          bestSellingProducts={bestSellingProducts}
          newestHref={`/categories/${slug}?sort=newest`}
          bestSellingHref={`/categories/${slug}?sort=best-selling`}
        />
      )}

      {productSections.length > 0 ? (
        productSections.map((section) => (
          <div key={section.categorySlug}>
            <CategoryBanner
              title={section.categoryName}
              image={getCategoryBannerImage(slug, section.categorySlug)}
              href={
                section.categorySlug === "ao-dai-doi-cuoi" && (slug === "nam" || slug === "nu")
                  ? `${ROUTES.CATEGORY(section.categorySlug)}?gender=${slug}`
                  : ROUTES.CATEGORY(section.categorySlug)
              }
            />
            {section.products.length > 0 ? (
              <ProductRow
                title={formatProductSectionTitle(section.categoryName)}
                products={section.products}
                actionHref={
                  section.categorySlug === "ao-dai-doi-cuoi" && (slug === "nam" || slug === "nu")
                    ? `${ROUTES.CATEGORY(section.categorySlug)}?gender=${slug}`
                    : ROUTES.CATEGORY(section.categorySlug)
                }
                quickAddOnHover
              />
            ) : (
              <div className="catalog-shell py-12 text-center text-gray-500 font-light text-body-sm">
                Sản phẩm của mục này đang được cập nhật trong thời gian tới.
              </div>
            )}
          </div>
        ))
      ) : (
        <EmptyCatalogState
          title={content.emptyTitle}
          description={content.emptyDescription}
        />
      )}

      <ValueProposition values={VALUE_PROPS} />
      {slug !== "tre-em" && (
        <Materials materials={slug === "nu" ? MATERIALS_NU : MATERIALS} />
      )}

      <StarsBanner />
    </SiteLayout>
  );
}

function EmptyCatalogState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="catalog-shell py-16 text-center">
      <h2 className="text-display-section font-extrabold uppercase text-black md:text-display-page">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-2xl text-body-lg leading-8 text-black/65">
          {description}
        </p>
      ) : null}
    </section>
  );
}
