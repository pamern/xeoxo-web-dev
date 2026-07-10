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
      <section className="mx-auto w-full max-w-site px-6 pb-12 pt-10 xl:px-[100px]">
        <Breadcrumbs
          items={
            breadcrumbs ?? [
              { label: "", href: ROUTES.HOME, iconSrc: "/icons/home.svg", iconAlt: "Trang chủ" },
              { label: title },
            ]
          }
          className="mb-5"
        />
        <h1 className="text-3xl font-extrabold uppercase leading-tight md:text-4xl">
          {title}
        </h1>

        <ProductListingResults products={products} filterOptions={filterOptions} />
      </section>

      <FloralStrip />

      {recentlyViewedProducts.length > 0 && (
        <section className="mx-auto w-full max-w-site px-6 py-12 xl:px-[100px]">
          <h2 className="mb-6 text-3xl font-extrabold uppercase">
            Sản phẩm bạn đã xem
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {recentlyViewedProducts.map((product, index) => (
              <ProductCard
                key={`${product.id}-viewed-${index}`}
                product={product}
                className="gap-2"
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
