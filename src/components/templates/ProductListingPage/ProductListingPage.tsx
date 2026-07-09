import Image from "next/image";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/molecules/Breadcrumbs";
import { ProductCard } from "@/components/molecules/ProductCard";
import { StarsBanner } from "@/components/organisms/StarsBanner";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import type { CategoryFilterOptions } from "@/features/homepage/homepage.service";
import type { Product } from "@/types/product.types";
import { ProductListingResults } from "./ProductListingResults";

const EMPTY_FILTER_OPTIONS: CategoryFilterOptions = {
  sizes: [],
  colors: [],
  materials: [],
  collections: [],
  priceMin: 0,
  priceMax: 0,
};

export function ProductListingPage({
  title,
  products,
  breadcrumbs,
  filterOptions = EMPTY_FILTER_OPTIONS,
  recentlyViewedProducts = [],
}: {
  title: string;
  products: Product[];
  breadcrumbs?: BreadcrumbItem[];
  filterOptions?: CategoryFilterOptions;
  recentlyViewedProducts?: Product[];
}) {
  return (
    <SiteLayout>
      <section
        className="product-page-shell pb-12"
        style={{ paddingBlockStart: "var(--product-page-top-offset)" }}
      >
        <Breadcrumbs
          items={
            breadcrumbs ?? [
              { label: "", href: ROUTES.HOME, iconSrc: "/icons/home.svg", iconAlt: "Trang chủ" },
              { label: title },
            ]
          }
          className="mb-5"
        />
        <h1 className="text-display-section uppercase md:text-display-page">
          {title}
        </h1>

        <ProductListingResults products={products} filterOptions={filterOptions} />
      </section>

      <FloralStrip />

      {recentlyViewedProducts.length > 0 && (
        <section className="product-page-shell py-12">
          <h2 className="mb-6 text-display-section uppercase">
            Sản phẩm bạn đã xem
          </h2>
          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{
              columnGap: "var(--product-grid-gap-x)",
              rowGap: "var(--product-grid-gap-y)",
            }}
          >
            {recentlyViewedProducts.map((product, index) => (
              <ProductCard
                key={`${product.id}-viewed-${index}`}
                product={product}
                className="gap-[var(--product-card-gap)]"
                imageClassName="aspect-[351/430]"
              />
            ))}
          </div>
        </section>
      )}

      <StarsBanner />
    </SiteLayout>
  );
}

function FloralStrip() {
  return (
    <div className="relative h-[50px] w-full overflow-hidden">
      <Image
        src="/images/strip-catalog-section.png"
        alt=""
        fill
        sizes="100vw"
        aria-hidden
        className="object-cover"
      />
    </div>
  );
}
