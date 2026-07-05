import Image from "next/image";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/molecules/Breadcrumbs";
import { ProductCard } from "@/components/molecules/ProductCard";
import {
  ProductFilterSidebar,
  type ProductFilterGroup,
} from "@/components/organisms/ProductFilterSidebar";
import { ProductGrid } from "@/components/organisms/ProductGrid";
import { StarsBanner } from "@/components/organisms/StarsBanner";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types/product.types";

type LegacyFilterOption = {
  label: string;
  href?: string;
  value?: string;
  active?: boolean;
};

export function ProductListingPage({
  title,
  products,
  breadcrumbs,
  filterGroups = [],
  resultCount,
  visibleCount,
  recentlyViewedProducts = [],
  filters = [],
}: {
  title: string;
  products: Product[];
  breadcrumbs?: BreadcrumbItem[];
  filterGroups?: ProductFilterGroup[];
  resultCount?: number;
  visibleCount?: number;
  recentlyViewedProducts?: Product[];
  filters?: LegacyFilterOption[];
}) {
  const totalResults = resultCount ?? products.length;
  const displayedCount = visibleCount ?? Math.min(products.length, totalResults);
  const hasMore = displayedCount < totalResults;
  const sidebarGroups =
    filterGroups.length > 0
      ? filterGroups
      : filters.map((filter) => ({ label: filter.label }));

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

        <div className="mt-10 grid gap-10 lg:grid-cols-[346px_minmax(0,1fr)]">
          <ProductFilterSidebar groups={sidebarGroups} resultCount={totalResults} />
          <div>
            <ProductGrid
              products={products}
              className="gap-x-7 gap-y-12"
              cardClassName="gap-2"
              cardImageClassName="aspect-[351/430]"
            />

            {products.length > 0 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                {hasMore ? (
                  <button
                    type="button"
                    className="rounded-pill bg-primary px-9 py-2 text-body-sm font-bold uppercase text-primary-foreground transition-colors hover:bg-primary/85"
                  >
                    Xem thêm →
                  </button>
                ) : null}
                <p className="text-body-lg font-light text-muted-foreground">
                  Hiển thị {displayedCount} trên tổng số {totalResults} sản phẩm
                </p>
              </div>
            )}
          </div>
        </div>
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
