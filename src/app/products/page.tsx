import type { Metadata } from "next";
import { ProductListingPage } from "@/components/templates/ProductListingPage";
import { ROUTES } from "@/constants/routes";
import { PRODUCTS } from "@/data/catalog";
import {
  fetchCollectionBySlugFromApi,
  mapApiCollectionToCollection,
  mapApiProductLinesToProducts,
} from "@/data/collections.api";
import { deriveFilterOptionsFromProducts } from "@/features/homepage/homepage.service";

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
        filterOptions={deriveFilterOptionsFromProducts(products)}
      />
    );
  }

  return (
    <ProductListingPage
      title="Sản phẩm"
      products={PRODUCTS}
      filterOptions={deriveFilterOptionsFromProducts(PRODUCTS)}
    />
  );
}
