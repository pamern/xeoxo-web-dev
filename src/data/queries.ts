import { CATEGORIES, COLLECTIONS, PRODUCTS } from "@/data/catalog";
import type { Gender, Product } from "@/types/product.types";

// Selector trung gian — UI gọi qua đây thay vì truy cập mảng trực tiếp.
// Khi thay bằng Supabase/API chỉ cần đổi phần thân hàm.

export function getProductsByGender(gender: Gender): Product[] {
  return PRODUCTS.filter((p) => p.gender === gender);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  return PRODUCTS.filter((p) => p.collectionSlug === collectionSlug);
}

export function getNewProducts(limit = 8): Product[] {
  return PRODUCTS.filter((p) => p.isNew).slice(0, limit);
}

export function getSaleProducts(limit = 8): Product[] {
  return PRODUCTS.filter((p) => p.salePrice).slice(0, limit);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, limit);
}

export function getCategoriesByGender(gender: Gender) {
  return CATEGORIES.filter((c) => c.gender === gender);
}

export function getCollectionBySlug(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug);
}
