import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListingPage } from "@/components/templates/ProductListingPage";
import { ROUTES } from "@/constants/routes";
import { CATEGORIES, COLLECTIONS, PRODUCTS } from "@/data/catalog";
import { getProductsByCategory } from "@/data/queries";

type Params = { slug: string };

function findCategory(slug: string) {
  return CATEGORIES.find((item) => item.slug === slug);
}

export function generateStaticParams() {
  return CATEGORIES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = findCategory(slug);
  if (!found) return { title: "Khong tim thay danh muc" };
  return {
    title: found.name,
    description: `San pham ${found.name} cua XEO XO.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const found = findCategory(slug);
  if (!found) notFound();
  const categoryProducts = getProductsByCategory(found.slug);
  const listingProducts = Array.from({ length: 12 }, (_, index) => {
    return categoryProducts[index % categoryProducts.length];
  }).filter(Boolean);
  const relatedCategories = CATEGORIES.filter((item) => item.gender === found.gender);
  const recentlyViewedProducts = PRODUCTS.filter((item) => item.categorySlug !== found.slug).slice(
    0,
    4
  );

  return (
    <ProductListingPage
      title={found.name}
      products={listingProducts}
      breadcrumbs={[
        { label: "", href: ROUTES.HOME, iconSrc: "/icons/home.svg", iconAlt: "Trang chủ" },
        { label: found.gender === "nam" ? "Đồ Nam" : "Đồ Nữ" },
        { label: found.name },
      ]}
      filterGroups={[
        { label: "Bộ sưu tập", options: COLLECTIONS.map((collection) => collection.name) },
        { label: "Kích thước", options: ["S", "M", "L", "XL"] },
        { label: "Màu sắc", options: ["Đen", "Trắng ngà", "Đỏ rượu"] },
        { label: "Giá", options: ["Dưới 1.000.000 VND", "1.000.000 - 2.000.000 VND"] },
        { label: "Chất liệu", options: ["Gấm", "Tơ", "Organza"] },
        {
          label: "Phù hợp với",
          options: relatedCategories.map((category) => category.name),
        },
      ]}
      resultCount={32}
      visibleCount={20}
      recentlyViewedProducts={recentlyViewedProducts}
    />
  );
}
