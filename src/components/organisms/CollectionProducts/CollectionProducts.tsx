"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/molecules/ProductCard";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types/product.types";

const INITIAL_VISIBLE_COUNT = 8;

export function CollectionProducts({
  products,
  collectionName,
  collectionSlug,
}: {
  products: Product[];
  collectionName: string;
  collectionSlug: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleProducts = showAll
    ? products
    : products.slice(0, INITIAL_VISIBLE_COUNT);
  const visibleCount = visibleProducts.length;
  const hasMore = products.length > INITIAL_VISIBLE_COUNT && !showAll;

  return (
    <section className="mx-auto w-full max-w-site px-5 py-10 md:px-8 md:py-12 xl:px-10 2xl:px-20">
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-6">
        <h2 className="text-heading-section font-medium uppercase text-black">
          Sản phẩm {collectionName}
        </h2>
        <Link
          href={`${ROUTES.PRODUCTS}?collection=${encodeURIComponent(collectionSlug)}`}
          className="text-right text-body-sm font-medium text-black transition-opacity hover:opacity-70"
        >
          Xem đầy đủ
        </Link>
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-2 md:gap-x-5 md:gap-y-8 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-7">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="min-w-0 w-full"
                quickAddOnHover
              />
            ))}
          </div>

          <div className="flex min-h-[160px] flex-col items-center justify-center gap-5 px-5 py-8 md:min-h-[194px]">
            {hasMore ? (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex min-h-[47px] w-full max-w-[294px] items-center justify-center gap-[10px] rounded-full bg-black px-6 text-base font-medium uppercase leading-none text-white transition-opacity hover:opacity-80"
              >
                <span>Xem thêm</span>
                <span aria-hidden className="text-[1.875rem] leading-none">
                  →
                </span>
              </button>
            ) : null}

            <p className="text-center text-base font-extralight text-black">
              Hiển thị {visibleCount} trên tổng số {products.length} sản phẩm
            </p>
          </div>
        </>
      ) : (
        <p className="py-12 text-center text-lg text-black">
          Chưa có sản phẩm trong bộ sưu tập.
        </p>
      )}
    </section>
  );
}
