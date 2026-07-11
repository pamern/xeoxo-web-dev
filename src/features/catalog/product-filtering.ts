import type { CategoryFilterOptions } from "@/features/homepage/homepage.service";
import type { Product } from "@/types/product.types";

export const SEASON_MAP: Record<string, string> = {
  SPRING: "Xuân",
  SUMMER: "Hạ",
  AUTUMN: "Thu",
  WINTER: "Đông",
};

export const COLOR_TO_SEASON: Record<string, string> = {
  "Cam": "Xuân", "Hồng cam": "Xuân", "Kem": "Xuân", "Trắng kem": "Xuân",
  "Vàng": "Xuân", "Vàng kem": "Xuân", "Vàng nhạt": "Xuân", "Xanh cốm": "Xuân",
  "Hồng": "Hạ", "Hồng nhạt": "Hạ", "Hồng phấn": "Hạ", "Hồng phấn nhạt": "Hạ",
  "Trắng xám": "Hạ", "Tím nhạt": "Hạ", "Xanh biển nhạt": "Hạ", "Xanh ngọc": "Hạ",
  "Xanh xám": "Hạ", "Xám bạc": "Hạ",
  "Be": "Thu", "Vàng nâu": "Thu", "Xanh lá": "Thu", "Xanh oliu": "Thu", "Đỏ đậm": "Thu",
  "Hồng sen": "Đông", "Hồng tím": "Đông", "Hồng đậm": "Đông", "Hồng đỗ": "Đông",
  "Trắng": "Đông", "Tím": "Đông", "Xanh": "Đông", "Xanh biển": "Đông",
  "Xanh coban": "Đông", "Xanh lam": "Đông", "Xanh lục": "Đông", "Đen": "Đông",
  "Đỏ": "Đông", "Đỏ mận": "Đông",
};

export function getProductSeasons(product: Product): string[] {
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

const GENDER_LABEL_TO_VALUE: Record<string, Product["gender"]> = {
  "Nam": "nam",
  "Nữ": "nu",
  "Trẻ em": "tre-em",
};

export type ProductListingFilters = {
  category?: string[];
  size?: string[];
  color?: string[];
  material?: string[];
  collection?: string[];
  gender?: string[];
  season?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: string;
};

export function filterAndSortProducts(
  products: Product[],
  filterOptions: CategoryFilterOptions,
  filters: ProductListingFilters,
): Product[] {
  const categoryFilters = filters.category ?? [];
  const sizeFilters = filters.size ?? [];
  const colorFilters = filters.color ?? [];
  const materialFilters = filters.material ?? [];
  const collectionFilters = filters.collection ?? [];
  const genderFilters = filters.gender ?? [];
  const seasonFilters = filters.season ?? [];
  const hasPriceSelection =
    typeof filters.priceMin === "number" && typeof filters.priceMax === "number";

  const filtered = products.filter((product) => {
    if (genderFilters.length > 0) {
      const mappedGenders = genderFilters.map((g) => GENDER_LABEL_TO_VALUE[g] ?? "tre-em");
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
    if (sizeFilters.length > 0 && !product.sizes.some((size) => sizeFilters.includes(size))) {
      return false;
    }
    if (
      colorFilters.length > 0 &&
      !product.colors.some((color) => colorFilters.includes(color.name))
    ) {
      return false;
    }
    if (materialFilters.length > 0 && !materialFilters.includes(product.materialName ?? "")) {
      return false;
    }
    if (
      collectionFilters.length > 0 &&
      !collectionFilters.includes(product.collectionName ?? "")
    ) {
      return false;
    }
    if (
      hasPriceSelection &&
      (product.price < (filters.priceMin as number) || product.price > (filters.priceMax as number))
    ) {
      return false;
    }
    return true;
  });

  const sorted = [...filtered];
  if (filters.sort === "Giá thấp đến cao") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (filters.sort === "Giá cao đến thấp") {
    sorted.sort((a, b) => b.price - a.price);
  } else if (filters.sort === "Mới nhất") {
    sorted.sort((a, b) => Number(b.id) - Number(a.id));
  } else if (filters.sort === "Bán chạy nhất") {
    sorted.sort((a, b) => (b.price - a.price) || (Number(a.id) - Number(b.id)));
  }

  return sorted;
}
