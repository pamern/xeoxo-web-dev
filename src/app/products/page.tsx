import type { Metadata } from "next";
import { ProductListingPage } from "@/components/templates/ProductListingPage";
import { ROUTES } from "@/constants/routes";
import { CATEGORIES, COLLECTIONS, PRODUCTS } from "@/data/catalog";
import {
  fetchCollectionBySlugFromApi,
  mapApiCollectionToCollection,
  mapApiProductLinesToProducts,
} from "@/data/collections.api";
import type { ProductFilterGroup } from "@/components/organisms/ProductFilterSidebar";

export const metadata: Metadata = {
  title: "San pham",
  description: "Danh sach san pham XEO XO.",
};

type ProductsPageProps = {
  searchParams?: Promise<{
    collection?: string;
  }>;
};

export const dynamic = "force-dynamic";

function buildProductFilterGroups(includeCollections: boolean): ProductFilterGroup[] {
  return [
    ...(includeCollections
      ? [{ label: "Bộ sưu tập", options: COLLECTIONS.map((collection) => collection.name) }]
      : []),
    { label: "Kích thước", options: ["S", "M", "L", "XL"] },
    { label: "Màu sắc", options: ["Đen", "Trắng ngà", "Đỏ rượu"] },
    { label: "Giá", options: ["Dưới 1.000.000 VND", "1.000.000 - 2.000.000 VND"] },
    { label: "Chất liệu", options: ["Gấm", "Tơ", "Organza"] },
    { label: "Phù hợp với", options: CATEGORIES.map((category) => category.name) },
  ];
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const collectionSlug = (await searchParams)?.collection;

  if (collectionSlug) {
    const apiCollection = await fetchCollectionBySlugFromApi(collectionSlug);
    const collection = apiCollection
      ? mapApiCollectionToCollection(apiCollection)
      : null;
    const products = apiCollection
      ? mapApiProductLinesToProducts(apiCollection.productLines)
      : [];

    return (
      <ProductListingPage
        title={collection ? `Sản phẩm ${collection.name}` : "Sản phẩm"}
        products={products}
        breadcrumbs={[
          { label: "", href: ROUTES.HOME, iconSrc: "/icons/home.svg", iconAlt: "Trang chủ" },
          { label: "Bộ sưu tập", href: ROUTES.COLLECTIONS },
          ...(collection
            ? [
                {
                  label: collection.name,
                  href: ROUTES.COLLECTION(collection.slug),
                },
              ]
            : []),
          { label: "Sản phẩm" },
        ]}
        filterGroups={buildProductFilterGroups(false)}
        filters={[
          { label: "Tất cả", href: ROUTES.PRODUCTS, active: true },
          ...CATEGORIES.map((category) => ({
            label: category.name,
            href: ROUTES.CATEGORY(category.slug),
          })),
        ]}
      />
    );
  }

  return (
    <ProductListingPage
      title="Sản phẩm"
      products={PRODUCTS}
      filterGroups={buildProductFilterGroups(true)}
      filters={[
        { label: "Tất cả", href: ROUTES.PRODUCTS, active: true },
        ...CATEGORIES.map((category) => ({
          label: category.name,
          href: ROUTES.CATEGORY(category.slug),
        })),
      ]}
    />
  );
}
