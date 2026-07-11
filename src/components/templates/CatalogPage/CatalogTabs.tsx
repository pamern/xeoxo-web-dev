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

  return (
    <div>
      <section className="catalog-shell flex items-center justify-between gap-4 pt-5 pb-0">
        <div className="no-scrollbar flex gap-[var(--filter-bar-gap)] overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("newest")}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-pill px-[var(--filter-chip-px)] py-[var(--filter-chip-py)] text-[12px] md:text-[13px] font-bold transition-all",
              activeTab === "newest"
                ? "bg-black text-white"
                : "border border-black text-black hover:bg-black hover:text-white"
            )}
          >
            Sản phẩm mới
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("best")}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-pill px-[var(--filter-chip-px)] py-[var(--filter-chip-py)] text-[12px] md:text-[13px] font-bold transition-all",
              activeTab === "best"
                ? "bg-black text-white"
                : "border border-black text-black hover:bg-black hover:text-white"
            )}
          >
            Bán chạy nhất
          </button>
        </div>
        <Link
          href={activeHref}
          className="shrink-0 text-body-sm underline underline-offset-4 transition-opacity hover:opacity-70 text-black font-normal"
        >
          Xem đầy đủ
        </Link>
      </section>

      <div className="mb-0">
        {activeProducts.length > 0 ? (
          <ProductRow
            products={activeProducts}
            actionHref={activeHref}
            quickAddOnHover
            className="!pt-2 !pb-0"
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
