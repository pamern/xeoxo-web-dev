"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ProductFilterSidebar,
  type ProductFilterGroup,
} from "@/components/organisms/ProductFilterSidebar";
import { ProductGrid } from "@/components/organisms/ProductGrid";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product.types";
import type { CategoryFilterOptions } from "@/features/homepage/homepage.service";

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

const COLOR_TO_SEASON: Record<string, string> = {
  "Cam": "Xuân", "Hồng cam": "Xuân", "Kem": "Xuân", "Trắng kem": "Xuân",
  "Vàng": "Xuân", "Vàng kem": "Xuân", "Vàng nhạt": "Xuân", "Xanh cốm": "Xuân",
  "Hồng": "Hạ", "Hồng nhạt": "Hạ", "Hồng phấn": "Hạ", "Hồng phấn nhạt": "Hạ",
  "Trắng xám": "Hạ", "Tím nhạt": "Hạ", "Xanh biển nhạt": "Hạ", "Xanh ngọc": "Hạ",
  "Xanh xám": "Hạ", "Xám bạc": "Hạ",
  "Be": "Thu", "Vàng nâu": "Thu", "Xanh lá": "Thu", "Xanh oliu": "Thu", "Đỏ đậm": "Thu",
  "Hồng sen": "Đông", "Hồng tím": "Đông", "Hồng đậm": "Đông", "Hồng đỗ": "Đông",
  "Trắng": "Đông", "Tím": "Đông", "Xanh": "Đông", "Xanh biển": "Đông",
  "Xanh coban": "Đông", "Xanh lam": "Đông", "Xanh lục": "Đông", "Đen": "Đông",
  "Đỏ": "Đông", "Đỏ mận": "Đông"
};

function getProductSeasons(product: Product): string[] {
  const seasons = new Set<string>();
  product.colors.forEach((c) => {
    for (const [colorName, season] of Object.entries(COLOR_TO_SEASON)) {
      if (c.name.toLowerCase().includes(colorName.toLowerCase())) {
        seasons.add(season);
      }
    }
  });
  return Array.from(seasons);
}

export function ProductListingResults({
  products,
  filterOptions,
  categorySlug,
}: {
  products: Product[];
  filterOptions: CategoryFilterOptions;
  categorySlug?: string;
}) {
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

  const filteredProducts = useMemo(() => {
    const categoryFilters = selected[CATEGORY_LABEL] ?? [];
    const sizeFilters = selected[SIZE_LABEL] ?? [];
    const colorFilters = selected[COLOR_LABEL] ?? [];
    const materialFilters = selected[MATERIAL_LABEL] ?? [];
    const collectionFilters = selected[COLLECTION_LABEL] ?? [];
    const genderFilters = selected[GENDER_LABEL] ?? [];
    const seasonFilters = selected[PERSONAL_COLOR_LABEL] ?? [];

    const filtered = products.filter((product) => {
      if (genderFilters.length > 0) {
        const mappedGenders = genderFilters.map((g) => {
          if (g === "Nam") return "nam";
          if (g === "Nữ") return "nu";
          return "tre-em";
        });
        if (!mappedGenders.includes(product.gender)) {
          return false;
        }
      }
      if (seasonFilters.length > 0) {
        const productSeasons = getProductSeasons(product);
        if (!productSeasons.some((s) => seasonFilters.includes(s))) {
          return false;
        }
      }
      if (
        categoryFilters.length > 0 &&
        !categoryFilters.includes(
          filterOptions.categories.find((c) => c.slug === product.categorySlug)?.name ?? "",
        )
      ) {
        return false;
      }
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
      if (hasPriceSelection && (product.price < priceRange.min || product.price > priceRange.max)) {
        return false;
      }
      return true;
    });

    // Sort products
    if (sortBy === "Giá thấp đến cao") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Giá cao đến thấp") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Mới nhất") {
      filtered.sort((a, b) => Number(b.id) - Number(a.id));
    } else if (sortBy === "Bán chạy nhất") {
      filtered.sort((a, b) => (b.price - a.price) || (Number(a.id) - Number(b.id)));
    }

    return filtered;
  }, [products, selected, filterOptions.categories, sortBy, hasPriceSelection, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    let adjustedStart = start;
    let adjustedEnd = end;
    if (currentPage <= 3) {
      adjustedEnd = 4;
    } else if (currentPage >= totalPages - 2) {
      adjustedStart = totalPages - 3;
    }

    for (let i = adjustedStart; i <= adjustedEnd; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  return (
    <div className="mt-2 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
      <ProductFilterSidebar
        groups={filterGroups}
        resultCount={filteredProducts.length}
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
          products={paginatedProducts}
          className="gap-x-7 gap-y-12"
          cardClassName="gap-2"
          cardImageClassName="aspect-[351/430]"
          quickAddOnHover
        />

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((prev) => Math.max(prev - 1, 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition disabled:opacity-30 disabled:pointer-events-none hover:bg-gray-50"
              aria-label="Trang trước"
            >
              ←
            </button>
            {pageNumbers.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-10 w-10 items-center justify-center text-body-md text-gray-400 font-light"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(Number(page));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-body-md font-medium transition",
                    currentPage === page
                      ? "bg-black text-white"
                      : "border border-gray-200 bg-white text-black hover:bg-gray-50",
                  )}
                >
                  {page}
                </button>
              );
            })}
            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition disabled:opacity-30 disabled:pointer-events-none hover:bg-gray-50"
              aria-label="Trang sau"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
