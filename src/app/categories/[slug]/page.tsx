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

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { products, filterOptions } = await getCategoryListing(slug);

  return (
    <ProductListingPage
      title={category.categoryName}
      products={products}
      breadcrumbs={[
        { label: "", href: ROUTES.HOME, iconSrc: "/icons/home.svg", iconAlt: "Trang chủ" },
        ...(category.department
          ? [{ label: DEPARTMENT_LABEL[category.department] ?? category.department }]
          : []),
        { label: category.categoryName },
      ]}
      filterOptions={filterOptions}
      recentlyViewedProducts={[]}
    />
  );
}
