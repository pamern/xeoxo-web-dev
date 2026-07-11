"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ProductFilterSidebar,
  type ProductFilterGroup,
} from "@/components/organisms/ProductFilterSidebar";
import { ProductGrid } from "@/components/organisms/ProductGrid";
import { Pagination } from "@/components/molecules/Pagination";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product.types";
import type { CategoryFilterOptions } from "@/features/homepage/homepage.service";
import { COLOR_TO_SEASON, filterAndSortProducts } from "@/features/catalog/product-filtering";

const CATEGORY_LABEL = "Danh mục";
const SIZE_LABEL = "Kích thước";
const COLOR_LABEL = "Màu sắc";
const MATERIAL_LABEL = "Chất liệu";
const COLLECTION_LABEL = "Bộ sưu tập";
const PRICE_LABEL = "Giá";
const GENDER_LABEL = "Giới tính";
const PERSONAL_COLOR_LABEL = "Màu sắc cá nhân";

const SORT_OPTIONS = ["Mặc định", "Mới nhất", "Bán chạy nhất", "Giá thấp đến cao", "Giá cao đến thấp"];
const ITEMS_PER_PAGE = 12;

const SEASON_MAP: Record<string, string> = {
  SPRING: "Xuân",
  SUMMER: "Hạ",
  AUTUMN: "Thu",
  WINTER: "Đông"
};

export function ProductListingResults({
  products,
  filterOptions,
  categorySlug,
  initialTotal,
}: {
  products: Product[];
  filterOptions: CategoryFilterOptions;
  categorySlug?: string;
  initialTotal?: number;
}) {
  const isServerPaginated = Boolean(categorySlug) && typeof initialTotal === "number";
  const searchParams = useSearchParams();
  const sortParam = searchParams.get("sort");
  const genderParam = searchParams.get("gender");
  const seasonParam = searchParams.get("season");
  const shouldShowGenderFilter = categorySlug === "ao-dai" || !!seasonParam;
  const shouldPrioritizeGenderFilter = categorySlug === "ao-dai" || !!seasonParam;

  const initialSort = useMemo(() => {
    if (sortParam === "newest") return "Mới nhất";
    if (sortParam === "best-selling") return "Bán chạy nhất";
    return "Mặc định";
  }, [sortParam]);

  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const initialSelected: Record<string, string[]> = {};
    if (genderParam === "nam") {
      initialSelected[CATEGORY_LABEL] = ["Áo dài cưới nam"];
    } else if (genderParam === "nu") {
      initialSelected[CATEGORY_LABEL] = ["Áo dài cưới nữ"];
    }

    if (genderParam === "nam" || genderParam === "nu" || genderParam === "tre-em") {
      const genderText = genderParam === "nam" ? "Nam" : genderParam === "nu" ? "Nữ" : "Trẻ em";
      initialSelected[GENDER_LABEL] = [genderText];
    }

    if (seasonParam) {
      const mappedSeason = SEASON_MAP[seasonParam.toUpperCase()] || seasonParam;
      initialSelected[PERSONAL_COLOR_LABEL] = [mappedSeason];
    }

    return initialSelected;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortOpen, setSortOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: filterOptions.priceMin,
    max: filterOptions.priceMax,
  });

  const hasSelection = Object.values(selected).some((values) => values.length > 0);
  const hasPriceSelection =
    filterOptions.priceMax > filterOptions.priceMin &&
    (priceRange.min > filterOptions.priceMin || priceRange.max < filterOptions.priceMax);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selected, priceRange]);

  useEffect(() => {
    setPriceRange({
      min: filterOptions.priceMin,
      max: filterOptions.priceMax,
    });
  }, [filterOptions.priceMin, filterOptions.priceMax]);

  const filterGroups: ProductFilterGroup[] = useMemo(() => {
    const groups: ProductFilterGroup[] = [];

    const pushGenderFilter = () => {
      if (!shouldShowGenderFilter) return;
      groups.push({
        label: GENDER_LABEL,
        options: ["Nam", "Nữ"],
      });
    };

    const pushPersonalColorFilter = () => {
      if (products.length === 0) return;
      groups.push({
        label: PERSONAL_COLOR_LABEL,
        options: ["Xuân", "Hạ", "Thu", "Đông"],
      });
    };

    if (shouldPrioritizeGenderFilter) {
      pushGenderFilter();
    }

    if (filterOptions.categories && filterOptions.categories.length > 1) {
      groups.push({
        label: CATEGORY_LABEL,
        options: filterOptions.categories.map((c) => c.name),
      });
    }
    if (filterOptions.collections.length > 0) {
      groups.push({
        label: COLLECTION_LABEL,
        options: filterOptions.collections.map((collection) => collection.name),
      });
    }
    if (filterOptions.sizes.length > 0) {
      groups.push({ label: SIZE_LABEL, options: filterOptions.sizes });
    }
    if (!shouldPrioritizeGenderFilter) {
      pushGenderFilter();
    }
    pushPersonalColorFilter();
    if (filterOptions.colors.length > 0) {
      const selectedSeason = selected[PERSONAL_COLOR_LABEL]?.[0];
      let colorOptions = filterOptions.colors.map((color) => color.name);

      if (selectedSeason) {
        colorOptions = colorOptions.filter((colorName) => {
          for (const [key, val] of Object.entries(COLOR_TO_SEASON)) {
            if (colorName.toLowerCase().includes(key.toLowerCase()) && val === selectedSeason) {
              return true;
            }
          }
          return false;
        });
      }

      if (colorOptions.length > 0) {
        groups.push({
          label: COLOR_LABEL,
          options: colorOptions,
        });
      }
    }
    if (filterOptions.priceMax > filterOptions.priceMin) {
      groups.push({
        label: PRICE_LABEL,
      });
    }
    if (filterOptions.materials.length > 0) {
      groups.push({ label: MATERIAL_LABEL, options: filterOptions.materials });
    }
    return groups;
  }, [filterOptions, products.length, selected, shouldShowGenderFilter, shouldPrioritizeGenderFilter]);
  const firstFilterLabel = filterGroups[0]?.label;
  const hasPersonalColorFilter = filterGroups.some((group) => group.label === PERSONAL_COLOR_LABEL);
  const defaultOpenFilterLabels = useMemo(() => {
    if (seasonParam && hasPersonalColorFilter) {
      return [PERSONAL_COLOR_LABEL];
    }

    return firstFilterLabel ? [firstFilterLabel] : [];
  }, [firstFilterLabel, hasPersonalColorFilter, seasonParam]);

  function toggleOption(groupLabel: string, option: string) {
    setSelected((current) => {
      if (groupLabel === PERSONAL_COLOR_LABEL || groupLabel === GENDER_LABEL) {
        const values = current[groupLabel] ?? [];
        const nextValues = values.includes(option) ? [] : [option];
        return { ...current, [groupLabel]: nextValues };
      }

      const values = current[groupLabel] ?? [];
      const nextValues = values.includes(option)
        ? values.filter((value) => value !== option)
        : [...values, option];

      return { ...current, [groupLabel]: nextValues };
    });
  }

  // Client-side filtering fallback, used only for listing flows that have no
  // categorySlug-backed server endpoint to page against (e.g. /products search
  // & collection results). Category pages fetch a filtered/sorted page from
  // /api/v1/products/listing instead.
  const filteredProducts = useMemo(() => {
    if (isServerPaginated) {
      return [];
    }

    return filterAndSortProducts(products, filterOptions, {
      category: selected[CATEGORY_LABEL],
      size: selected[SIZE_LABEL],
      color: selected[COLOR_LABEL],
      material: selected[MATERIAL_LABEL],
      collection: selected[COLLECTION_LABEL],
      gender: selected[GENDER_LABEL],
      season: selected[PERSONAL_COLOR_LABEL],
      priceMin: hasPriceSelection ? priceRange.min : undefined,
      priceMax: hasPriceSelection ? priceRange.max : undefined,
      sort: sortBy,
    });
  }, [isServerPaginated, products, selected, filterOptions, sortBy, hasPriceSelection, priceRange]);

  const [serverProducts, setServerProducts] = useState<Product[]>(products);
  const [serverTotal, setServerTotal] = useState(initialTotal ?? 0);
  const hasHydratedServerInitial = useRef(false);

  useEffect(() => {
    if (!isServerPaginated) {
      return;
    }

    if (!hasHydratedServerInitial.current) {
      hasHydratedServerInitial.current = true;
      return;
    }

    const controller = new AbortController();
    const query = new URLSearchParams();
    query.set("category_slug", categorySlug as string);
    query.set("offset", String((currentPage - 1) * ITEMS_PER_PAGE));
    query.set("limit", String(ITEMS_PER_PAGE));
    query.set("sort", sortBy);
    (selected[CATEGORY_LABEL] ?? []).forEach((v) => query.append("category", v));
    (selected[SIZE_LABEL] ?? []).forEach((v) => query.append("size", v));
    (selected[COLOR_LABEL] ?? []).forEach((v) => query.append("color", v));
    (selected[MATERIAL_LABEL] ?? []).forEach((v) => query.append("material", v));
    (selected[COLLECTION_LABEL] ?? []).forEach((v) => query.append("collection", v));
    (selected[GENDER_LABEL] ?? []).forEach((v) => query.append("gender", v));
    (selected[PERSONAL_COLOR_LABEL] ?? []).forEach((v) => query.append("season", v));
    if (hasPriceSelection) {
      query.set("price_min", String(priceRange.min));
      query.set("price_max", String(priceRange.max));
    }

    fetch(`/api/v1/products/listing?${query.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setServerProducts(payload.data.products);
          setServerTotal(payload.data.total);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Không thể tải danh sách sản phẩm:", err);
        }
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isServerPaginated, categorySlug, currentPage, sortBy, selected, hasPriceSelection, priceRange]);

  const displayProducts = isServerPaginated
    ? serverProducts
    : filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const displayTotal = isServerPaginated ? serverTotal : filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(displayTotal / ITEMS_PER_PAGE));

  return (
    <div className="mt-2 grid gap-8 lg:grid-cols-[272px_minmax(0,1fr)] lg:items-start">
      <ProductFilterSidebar
        groups={filterGroups}
        resultCount={displayTotal}
        selected={selected}
        onToggle={toggleOption}
        onClear={() => {
          setSelected({});
          setPriceRange({
            min: filterOptions.priceMin,
            max: filterOptions.priceMax,
          });
        }}
        priceRange={
          filterOptions.priceMax > filterOptions.priceMin
            ? {
                min: filterOptions.priceMin,
                max: filterOptions.priceMax,
                valueMin: priceRange.min,
                valueMax: priceRange.max,
                onChange: setPriceRange,
              }
            : undefined
        }
        defaultOpenGroupLabels={defaultOpenFilterLabels}
        className="lg:sticky lg:top-[calc(var(--site-header-height,0px)+16px)] lg:max-h-[calc(100vh-var(--site-header-height,0px)-24px)] lg:overflow-y-auto lg:pr-1"
      />
      <div className="lg:-mt-6">
        {/* Active tags & Sort dropdown top bar */}
        <div className="mb-2 flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(selected).flatMap(([groupLabel, options]) =>
              options.map((option) => (
                <div
                  key={`${groupLabel}-${option}`}
                  className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-light text-black"
                >
                  <span>{option}</span>
                  <button
                    onClick={() => toggleOption(groupLabel, option)}
                    className="text-gray-400 hover:text-black transition-colors text-xs font-light ml-0.5"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
            {hasPriceSelection && (
              <div className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-light text-black">
                <span>{formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}</span>
                <button
                  onClick={() =>
                    setPriceRange({
                      min: filterOptions.priceMin,
                      max: filterOptions.priceMax,
                    })
                  }
                  className="text-gray-400 hover:text-black transition-colors text-xs font-light ml-0.5"
                >
                  ×
                </button>
              </div>
            )}
            {(hasSelection || hasPriceSelection) && (
              <button
                onClick={() => {
                  setSelected({});
                  setPriceRange({
                    min: filterOptions.priceMin,
                    max: filterOptions.priceMax,
                  });
                }}
                className="text-[11px] font-light text-[#FF5C39] hover:text-[#e04322] transition-colors underline underline-offset-2 ml-2"
              >
                Xoá lọc
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:ml-auto relative">
            <span className="text-[11px] font-light uppercase tracking-widest text-muted-foreground">Phân loại</span>
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex h-8 items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 text-[11px] font-light text-black transition hover:bg-gray-50 min-w-[120px] justify-between"
              >
                <span>{sortBy}</span>
                <span className={cn("h-1 w-1 rotate-45 border-b border-r border-black transition-transform duration-200", sortOpen && "rotate-[225deg]")} />
              </button>
              
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 mt-1 z-20 w-40 rounded-lg border border-gray-100 bg-white p-1 shadow-lg flex flex-col gap-0.5">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSortBy(opt);
                          setSortOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 text-[11px] font-light rounded transition hover:bg-gray-50",
                          sortBy === opt && "bg-gray-50 font-normal text-black"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <ProductGrid
          products={displayProducts}
          className="gap-x-7 gap-y-12"
          cardClassName="gap-2"
          cardImageClassName="aspect-[351/430]"
          quickAddOnHover
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="mt-12"
        />
      </div>
    </div>
  );
}
