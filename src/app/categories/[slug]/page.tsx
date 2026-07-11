import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListingPage } from "@/components/templates/ProductListingPage";
import { ROUTES } from "@/constants/routes";
import {
  getCategoryBySlug,
  getCategoryListing,
} from "@/features/homepage/homepage.service";

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
  searchParams: Promise<{ gender?: string }>;
}) {
  const { slug } = await params;
  const { gender } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { products, filterOptions } = await getCategoryListing(slug);

  const isDeptPage = slug === "nu" || slug === "nam" || slug === "tre-em";

  return (
    <ProductListingPage
      title={category.categoryName}
      products={products}
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
    />
  );
}
