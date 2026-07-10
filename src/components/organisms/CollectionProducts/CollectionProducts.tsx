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
    <section className="mx-auto w-full max-w-site px-6 py-[50px] xl:px-[100px]">
      <div className="mb-5 flex items-center justify-between gap-6">
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
          <div className="grid gap-x-[42px] gap-y-[21px] sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="gap-[13px]"
                imageClassName="aspect-auto h-[430px] rounded-none"
              />
            ))}
          </div>

          <div className="flex h-[194px] flex-col items-center justify-center gap-5 px-6">
            {hasMore ? (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex h-[47px] w-[294px] items-center justify-center gap-[10px] rounded-full bg-black text-button font-medium uppercase leading-none text-white transition-opacity hover:opacity-80"
              >
                <span>Xem thêm</span>
                <span aria-hidden className="text-[30px] leading-none">
                  →
                </span>
              </button>
            ) : null}

            <p className="text-center text-button font-extralight text-black">
              Hiển thị {visibleCount} trên tổng số {products.length} sản phẩm
            </p>
          </div>
        </>
      ) : (
        <p className="py-12 text-center text-body-lg text-black">
          Chưa có sản phẩm trong bộ sưu tập.
        </p>
      )}
    </section>
  );
}
