"use client";

import { useMemo, useState } from "react";
import {
  ProductFilterSidebar,
  type ProductFilterGroup,
} from "@/components/organisms/ProductFilterSidebar";
import { ProductGrid } from "@/components/organisms/ProductGrid";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product.types";
import type { CategoryFilterOptions } from "@/features/homepage/homepage.service";

const SIZE_LABEL = "Kích thước";
const COLOR_LABEL = "Màu sắc";
const MATERIAL_LABEL = "Chất liệu";
const COLLECTION_LABEL = "Bộ sưu tập";
const PRICE_LABEL = "Giá";

type PriceBucket = { label: string; min: number; max: number };

function buildPriceBuckets(priceMin: number, priceMax: number): PriceBucket[] {
  if (priceMax <= priceMin) return [];

  const step = (priceMax - priceMin) / 3;
  const boundary1 = Math.round((priceMin + step) / 50_000) * 50_000;
  const boundary2 = Math.round((priceMin + step * 2) / 50_000) * 50_000;

  return [
    { label: `Dưới ${formatPrice(boundary1)}`, min: 0, max: boundary1 },
    {
      label: `${formatPrice(boundary1)} - ${formatPrice(boundary2)}`,
      min: boundary1,
      max: boundary2,
    },
    { label: `Trên ${formatPrice(boundary2)}`, min: boundary2, max: Infinity },
  ];
}

export function ProductListingResults({
  products,
  filterOptions,
}: {
  products: Product[];
  filterOptions: CategoryFilterOptions;
}) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  const priceBuckets = useMemo(
    () => buildPriceBuckets(filterOptions.priceMin, filterOptions.priceMax),
    [filterOptions.priceMin, filterOptions.priceMax],
  );

  const filterGroups: ProductFilterGroup[] = useMemo(() => {
    const groups: ProductFilterGroup[] = [];
    if (filterOptions.collections.length > 0) {
      groups.push({
        label: COLLECTION_LABEL,
        options: filterOptions.collections.map((collection) => collection.name),
      });
    }
    if (filterOptions.sizes.length > 0) {
      groups.push({ label: SIZE_LABEL, options: filterOptions.sizes });
    }
    if (filterOptions.colors.length > 0) {
      groups.push({
        label: COLOR_LABEL,
        options: filterOptions.colors.map((color) => color.name),
      });
    }
    if (priceBuckets.length > 0) {
      groups.push({
        label: PRICE_LABEL,
        options: priceBuckets.map((bucket) => bucket.label),
      });
    }
    if (filterOptions.materials.length > 0) {
      groups.push({ label: MATERIAL_LABEL, options: filterOptions.materials });
    }
    return groups;
  }, [filterOptions, priceBuckets]);

  function toggleOption(groupLabel: string, option: string) {
    setSelected((current) => {
      const values = current[groupLabel] ?? [];
      const nextValues = values.includes(option)
        ? values.filter((value) => value !== option)
        : [...values, option];
      return { ...current, [groupLabel]: nextValues };
    });
  }

  const filteredProducts = useMemo(() => {
    const sizeFilters = selected[SIZE_LABEL] ?? [];
    const colorFilters = selected[COLOR_LABEL] ?? [];
    const materialFilters = selected[MATERIAL_LABEL] ?? [];
    const collectionFilters = selected[COLLECTION_LABEL] ?? [];
    const priceFilters = selected[PRICE_LABEL] ?? [];
    const selectedBuckets = priceBuckets.filter((bucket) =>
      priceFilters.includes(bucket.label),
    );

    return products.filter((product) => {
      if (
        sizeFilters.length > 0 &&
        !product.sizes.some((size) => sizeFilters.includes(size))
      ) {
        return false;
      }
      if (
        colorFilters.length > 0 &&
        !product.colors.some((color) => colorFilters.includes(color.name))
      ) {
        return false;
      }
      if (
        materialFilters.length > 0 &&
        !materialFilters.includes(product.materialName ?? "")
      ) {
        return false;
      }
      if (
        collectionFilters.length > 0 &&
        !collectionFilters.includes(product.collectionName ?? "")
      ) {
        return false;
      }
      if (
        selectedBuckets.length > 0 &&
        !selectedBuckets.some(
          (bucket) => product.price >= bucket.min && product.price < bucket.max,
        )
      ) {
        return false;
      }
      return true;
    });
  }, [products, selected, priceBuckets]);

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[346px_minmax(0,1fr)]">
      <ProductFilterSidebar
        groups={filterGroups}
        resultCount={filteredProducts.length}
        selected={selected}
        onToggle={toggleOption}
        onClear={() => setSelected({})}
      />
      <div>
        <ProductGrid
          products={filteredProducts}
          className="gap-x-7 gap-y-12"
          cardClassName="gap-2"
          cardImageClassName="aspect-[351/430]"
          quickAddOnHover
        />

        {filteredProducts.length > 0 && (
          <p className="mt-12 text-center text-body-lg font-light text-muted-foreground">
            Hiển thị {filteredProducts.length} trên tổng số {products.length}{" "}
            sản phẩm
          </p>
        )}
      </div>
    </div>
  );
}
