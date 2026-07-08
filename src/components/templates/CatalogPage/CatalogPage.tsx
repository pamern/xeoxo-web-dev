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
import { COLLECTIONS, MATERIALS, MATERIALS_NU, VALUE_PROPS } from "@/data/catalog";
import {
  getCategoryProductSections,
  getHomepageCollections,
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
    banner: "/images/cat-dam-vay.png",
    department: "WOMEN",
    emptyTitle: "Chưa có sản phẩm nữ",
    emptyDescription: "Các thiết kế dành cho nữ sẽ được cập nhật trong thời gian tới.",
  },
  nam: {
    heroLabel: "Đồ Nam",
    banner: "/images/cat-ao-cuoi.png",
    department: "MEN",
    emptyTitle: "Chưa có sản phẩm nam",
    emptyDescription: "Các thiết kế dành cho nam sẽ được cập nhật trong thời gian tới.",
  },
  "tre-em": {
    heroLabel: "Đồ Trẻ Em",
    banner: "/images/cat-ao-dai.png",
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
    const collections = await getHomepageCollections({ limit: 5 });
    return collections.length > 0 ? collections : COLLECTIONS;
  } catch {
    return COLLECTIONS;
  }
}

async function getCatalogProductSections(
  department: CatalogDepartment | null,
  parentCategorySlug?: string,
) {
  try {
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

// Trang catalog/landing dùng chung cho các entry từ header.
export async function CatalogPage({ slug }: { slug: CatalogSlug }) {
  const content = CATALOG_CONTENT[slug];
  if (!content) notFound();

  const [heroCollections, productSections] = await Promise.all([
    getCatalogHeroCollections(),
    getCatalogProductSections(content.department, content.parentCategorySlug),
  ]);
  const firstCollection = heroCollections[0];

  return (
    <SiteLayout>
      <CatalogHero
        label={content.heroLabel}
        image={content.banner}
        ctaHref={ROUTES.COLLECTION(firstCollection.slug)}
      />

      <CatalogHeroGrid collections={heroCollections} />

      <section className="mx-auto w-full max-w-site px-6 py-8 xl:px-[100px]">
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          <FilterPill
            href={productSections[0] ? ROUTES.CATEGORY(productSections[0].categorySlug) : "#"}
            active
          >
            Sản phẩm mới
          </FilterPill>
          {productSections.map((section) => (
            <FilterPill key={section.categorySlug} href={ROUTES.CATEGORY(section.categorySlug)}>
              {section.categoryName}
            </FilterPill>
          ))}
        </div>
      </section>

      {productSections.length > 0 ? (
        productSections.map((section) => (
          <div key={section.categorySlug}>
            <CategoryBanner
              title={section.categoryName}
              image={content.banner}
              href={ROUTES.CATEGORY(section.categorySlug)}
            />
            <ProductRow
              title={formatProductSectionTitle(section.categoryName)}
              products={section.products}
              actionHref={ROUTES.CATEGORY(section.categorySlug)}
              quickAddOnHover
            />
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
    <section className="mx-auto w-full max-w-site px-6 py-16 text-center xl:px-[100px]">
      <h2 className="text-3xl font-extrabold uppercase text-black md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-black/65">
          {description}
        </p>
      ) : null}
    </section>
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
