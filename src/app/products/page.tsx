import type { Metadata } from "next";
import { ProductListingPage } from "@/components/templates/ProductListingPage";
import { ROUTES } from "@/constants/routes";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";

export const metadata: Metadata = {
  title: "San pham",
  description: "Danh sach san pham XEO XO.",
};

export default function ProductsPage() {
  return (
    <ProductListingPage
      title="San pham"
      products={PRODUCTS}
      filters={[
        { label: "Tat ca", href: ROUTES.PRODUCTS, active: true },
        ...CATEGORIES.map((category) => ({
          label: category.name,
          href: ROUTES.CATEGORY(category.slug),
        })),
      ]}
    />
  );
}
