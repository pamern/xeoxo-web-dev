"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProductRow } from "@/components/organisms/ProductRow/ProductRow";
import type { Product } from "@/types/product.types";
import { cn } from "@/lib/utils";

interface CatalogTabsProps {
  slug: string;
  newestProducts: Product[];
  bestSellingProducts: Product[];
  newestHref: string;
  bestSellingHref: string;
}

export function CatalogTabs({
  slug,
  newestProducts,
  bestSellingProducts,
  newestHref,
  bestSellingHref,
}: CatalogTabsProps) {
  const [activeTab, setActiveTab] = useState<"newest" | "best">("newest");

  const activeProducts = activeTab === "newest" ? newestProducts : bestSellingProducts;
  const activeHref = activeTab === "newest" ? newestHref : bestSellingHref;
  const tabClassName =
    "shrink-0 whitespace-nowrap rounded-pill border border-black px-4 py-2 text-sm font-medium transition-colors sm:text-base xl:px-[18px] xl:py-[9px]";

  return (
    <div>
      <section className="catalog-shell flex flex-col gap-3 pt-5 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 md:pb-5">
        <div className="no-scrollbar flex w-fit max-w-full gap-2.5 overflow-x-auto pb-0 xl:gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("newest")}
            aria-pressed={activeTab === "newest"}
            className={cn(
              tabClassName,
              activeTab === "newest"
                ? "bg-black text-white"
                : "text-black hover:bg-black hover:text-white"
            )}
          >
            Sản phẩm mới
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("best")}
            aria-pressed={activeTab === "best"}
            className={cn(
              tabClassName,
              activeTab === "best"
                ? "bg-black text-white"
                : "text-black hover:bg-black hover:text-white"
            )}
          >
            Bán chạy nhất
          </button>
        </div>

        {activeHref && (
          <Link
            href={activeHref}
            className="shrink-0 text-body-sm underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Xem đầy đủ
          </Link>
        )}
      </section>

      <div className="mb-0">
        {activeProducts.length > 0 ? (
          <ProductRow
            products={activeProducts}
            actionHref={activeHref}
            quickAddOnHover
            className="!pt-0 !pb-0"
          />
        ) : (
          <div className="catalog-shell py-12 text-center text-gray-500 font-light text-body-sm">
            Không có sản phẩm nào.
          </div>
        )}
      </div>
    </div>
  );
}
