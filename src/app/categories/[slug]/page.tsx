import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListingPage } from "@/components/templates/ProductListingPage";
import { ROUTES } from "@/constants/routes";
import {
  getCategoryBySlug,
  getCategoryListing,
} from "@/features/homepage/homepage.service";
import { filterAndSortProducts, SEASON_MAP } from "@/features/catalog/product-filtering";

const PRODUCTS_PAGE_SIZE = 12;

type Params = { slug: string };

const DEPARTMENT_LABEL: Record<string, string> = {
  WOMEN: "Đồ Nữ",
  MEN: "Đồ Nam",
  KIDS: "Đồ Trẻ Em",
};

const DEPARTMENT_HREF: Record<string, string> = {
  WOMEN: "/categories/nu",
  MEN: "/categories/nam",
  KIDS: "/categories/tre-em",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Không tìm thấy danh mục" };
  return {
    title: category.categoryName,
    description: `Sản phẩm ${category.categoryName} của XÉO XỌ.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ gender?: string; season?: string }>;
}) {
  const { slug } = await params;
  const { gender, season } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { products, filterOptions } = await getCategoryListing(slug);

  const isDeptPage = slug === "nu" || slug === "nam" || slug === "tre-em";

  // Mirror the initial `selected` filters ProductListingResults derives from
  // the same URL params, so the server-rendered first page matches what the
  // client will request once it hydrates.
  const genderFilter =
    gender === "nam" ? "Nam" : gender === "nu" ? "Nữ" : gender === "tre-em" ? "Trẻ em" : undefined;
  const seasonFilter = season ? SEASON_MAP[season.toUpperCase()] || season : undefined;

  const firstPageProducts = filterAndSortProducts(products, filterOptions, {
    gender: genderFilter ? [genderFilter] : undefined,
    season: seasonFilter ? [seasonFilter] : undefined,
  });
  const initialProducts = firstPageProducts.slice(0, PRODUCTS_PAGE_SIZE);
  const initialTotal = firstPageProducts.length;

  return (
    <ProductListingPage
      title={category.categoryName}
      products={initialProducts}
      initialTotal={initialTotal}
      breadcrumbs={[
        { label: "", href: ROUTES.HOME, iconSrc: "/icons/home.svg", iconAlt: "Trang chủ" },
        ...(category.department && !isDeptPage
          ? [
              {
                label: DEPARTMENT_LABEL[category.department] ?? category.department,
                href: DEPARTMENT_HREF[category.department],
              },
            ]
          : []),
        { label: category.categoryName },
      ]}
      filterOptions={filterOptions}
      recentlyViewedProducts={[]}
      categorySlug={slug}
    />
  );
}
