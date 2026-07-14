import { Suspense } from "react";
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
  categories: [],
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
  categorySlug,
  initialTotal,
}: {
  title: string;
  products: Product[];
  breadcrumbs?: BreadcrumbItem[];
  filterOptions?: CategoryFilterOptions;
  recentlyViewedProducts?: Product[];
  categorySlug?: string;
  initialTotal?: number;
}) {
  return (
    <SiteLayout>
      <section className="breadcrumb-shell">
        <Breadcrumbs
          items={
            breadcrumbs ?? [
              { label: "", href: ROUTES.HOME, iconSrc: "/icons/home.svg", iconAlt: "Trang chủ" },
              { label: title },
            ]
          }
        />
      </section>
      <section className="listing-shell pb-12 pt-0">
        <h1 className="mb-5 text-5xl font-bold uppercase leading-tight text-black md:mb-6 lg:mb-8">
          {title}
        </h1>

        <Suspense fallback={<div>Đang tải sản phẩm...</div>}>
          <ProductListingResults
            products={products}
            filterOptions={filterOptions}
            categorySlug={categorySlug}
            initialTotal={initialTotal}
          />
        </Suspense>
      </section>

      <FloralStrip />

      {recentlyViewedProducts.length > 0 && (
        <section className="listing-shell py-12">
          <h2 className="mb-6 text-4xl font-extrabold uppercase">
            Sản phẩm bạn đã xem
          </h2>
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-6 md:grid-cols-4 xl:gap-x-4 xl:gap-y-7">
            {recentlyViewedProducts.map((product, index) => (
              <ProductCard
                key={`${product.id}-viewed-${index}`}
                product={product}
                className="min-w-0 w-full"
                quickAddOnHover
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
