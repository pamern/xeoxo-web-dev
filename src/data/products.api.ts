import { cache } from "react";
import { headers } from "next/headers";
import { CACHE_TAGS, CACHE_TTL_SECONDS } from "@/lib/cache-policy";
import type { Product } from "@/types/product.types";
import {
  mapApiProductLinesToProducts,
  type ApiProductLine,
} from "@/data/collections.api";

type ApiProductDetailResponse = {
  ok: boolean;
  data?: {
    productLine?: ApiProductLine;
    relatedProductLines?: ApiProductLine[];
    collection?: {
      collection_id?: string | number;
      collection_name?: string | null;
      slug?: string | null;
    } | null;
  };
};

async function getBaseUrl() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol =
    headerStore.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");

  if (host) {
    return `${protocol}://${host}`;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

async function fetchJson<T>(
  path: string,
  options?: {
    revalidate?: number;
    tags?: string[];
  },
): Promise<T | null> {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}${path}`, {
      next: options
        ? {
            revalidate: options.revalidate,
            tags: options.tags,
          }
        : undefined,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export const fetchProductBySlugFromApi = cache(
  async function fetchProductBySlugFromApi(slug: string) {
    const response = await fetchJson<ApiProductDetailResponse>(
      `/api/products/${encodeURIComponent(slug)}`,
      {
        revalidate: CACHE_TTL_SECONDS.publicProductShell,
        tags: [CACHE_TAGS.products, CACHE_TAGS.product(slug)],
      },
    );

    if (!response?.ok || !response.data?.productLine) {
      return null;
    }

    const product = mapApiProductLinesToProducts([response.data.productLine])[0];
    const relatedProducts = mapApiProductLinesToProducts(response.data.relatedProductLines ?? []);

    return {
      product: normalizeProduct(product),
      relatedProducts: relatedProducts.map(normalizeProduct),
      collection: response.data.collection ?? null,
    };
  },
);

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    sizes: product.sizes.length > 0 ? product.sizes : ["OS"],
    colors:
      product.colors.length > 0
        ? product.colors
        : [{ name: "Mac dinh", hex: "#111111" }],
    images: product.images.length > 0 ? product.images : ["/images/placeholder.png"],
  };
}
