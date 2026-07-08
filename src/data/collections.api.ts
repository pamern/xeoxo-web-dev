import { headers } from "next/headers";
import type { Collection, Product } from "@/types/product.types";

const IMAGE_PLACEHOLDER = "/images/placeholder.png";
const STORAGE_BUCKET = "product-media";

export type ApiCollection = {
  id: string | number;
  slug: string | null;
  name: string | null;
  description: string | null;
  mediaId: string | number | null;
  content: CollectionContent | null;
  season: string | null;
  launchDate: string | null;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CollectionListItem = Collection & {
  date?: string;
  quote?: string;
  body?: string[];
};

export type ApiCollectionDetail = ApiCollection & {
  productLines?: ApiProductLine[];
};

export type CollectionContent = {
  hero?: {
    title?: string;
    eyebrow?: string;
    subtitle?: string;
    description?: string;
  };
  story?: {
    heading?: string;
    body?: string;
  };
  sections?: Array<{
    heading?: string;
    body?: string;
  }>;
  editorial_opening?: Array<{
    heading?: string;
    body?: string;
  }>;
};

export type ApiProductLine = Record<string, unknown> & {
  product_line_id?: string | number;
  media?: Array<Record<string, unknown>>;
  components?: Array<Record<string, unknown>>;
};

type ApiListResponse = {
  ok: boolean;
  data?: ApiCollection[];
};

type ApiDetailResponse = {
  ok: boolean;
  data?: ApiCollectionDetail;
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

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}${path}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchCollectionsFromApi() {
  const response = await fetchJson<ApiListResponse>("/api/collections");
  return response?.ok ? response.data ?? [] : [];
}

export async function fetchCollectionBySlugFromApi(slug: string) {
  const response = await fetchJson<ApiDetailResponse>(
    `/api/collections/${encodeURIComponent(slug)}`,
  );
  return response?.ok ? response.data ?? null : null;
}

export function mapApiCollectionToCollection(
  collection: ApiCollection,
): CollectionListItem {
  const description = collection.description ?? collection.content?.hero?.description ?? "";
  const collectionName = collection.content?.hero?.title ?? collection.name ?? "";

  return {
    slug: collection.slug ?? String(collection.id),
    name: collectionName,
    subtitle: collection.content?.hero?.subtitle ?? "",
    coverImage: getCollectionCoverImage(collectionName),
    description,
    date: formatCollectionDate(collection.launchDate),
    quote:
      collection.content?.story?.heading ??
      collection.content?.editorial_opening?.[0]?.heading,
    body: description ? [description] : [],
  };
}

function formatCollectionDate(value: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `Tháng ${date.getMonth() + 1} / ${date.getFullYear()}`;
}

export function mapApiProductLinesToProducts(productLines: ApiProductLine[] = []): Product[] {
  return productLines.map((productLine, index) => {
    const productLineId = productLine.product_line_id ?? `api-product-${index}`;
    const media = Array.isArray(productLine.media) ? productLine.media : [];
    const components = Array.isArray(productLine.components) ? productLine.components : [];
    const firstMedia = media[0] ?? {};
    const productLineName =
      readString(productLine, ["line_name", "product_line_name", "name", "title"]) ??
      `San pham ${String(productLineId)}`;
    const image =
      readString(firstMedia, ["url", "image_url", "media_url", "public_url", "src"]) ??
      getProductLineMainImage(productLineName) ??
      IMAGE_PLACEHOLDER;
    const price =
      readNumber(productLine, ["price", "base_price", "list_price"]) ??
      readLowestVariantPrice(components) ??
      0;

    const genderValue = readString(productLine, ["gender", "department"])
      ?.trim()
      .toLowerCase();

    return {
      id: String(productLineId),
      slug:
        readString(productLine, ["slug", "product_slug"]) ??
        `product-line-${String(productLineId)}`,
      name: productLineName,
      price,
      images: [image],
      categorySlug: readString(productLine, ["category_slug"]) ?? "ao-dam-vay",
      gender: ["nam", "men", "male"].includes(genderValue ?? "")
        ? "nam"
        : "nu",
      collectionSlug: readString(productLine, ["collection_slug"]) ?? "",
      description: readString(productLine, ["description"]) ?? "",
      sizes: [],
      colors: [],
      isNew: false,
    };
  });
}

function getCollectionCoverImage(collectionName: string) {
  const folder = toStorageSlug(collectionName);
  return folder ? getStoragePublicUrl(`collections/${folder}/cover.webp`) : IMAGE_PLACEHOLDER;
}

function getProductLineCoverImage(productLineName: string) {
  const folder = toStorageSlug(productLineName);
  return folder ? getStoragePublicUrl(`product-lines/${folder}/cover.webp`) : undefined;
}

function getProductLineMainImage(productLineName: string) {
  const folder = toStorageSlug(productLineName);
  return folder ? getStoragePublicUrl(`product-lines/${folder}/main.webp`) : undefined;
}

function getStoragePublicUrl(path: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return IMAGE_PLACEHOLDER;

  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

function toStorageSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildCollectionDetailImages(productLines: ApiProductLine[] = [], required = 8) {
  const images = productLines.flatMap((productLine) => {
    const folderSource =
      readString(productLine, ["line_name", "product_line_name", "name", "title"]) ??
      readString(productLine, ["slug", "product_slug"]);
    const folder = folderSource ? toStorageSlug(folderSource) : undefined;

    if (!folder) return [];

    return [getStoragePublicUrl(`product-lines/${folder}/main.webp`)];
  });

  const uniqueImages = Array.from(new Set(images.filter(Boolean)));
  if (uniqueImages.length === 0) return [];

  const filledImages = [...uniqueImages];
  let index = 0;

  while (filledImages.length < required) {
    filledImages.push(uniqueImages[index % uniqueImages.length]);
    index += 1;
  }

  return filledImages.slice(0, required);
}

function readLowestVariantPrice(components: Array<Record<string, unknown>>) {
  const prices = components.flatMap((component) => {
    const variants = Array.isArray(component.variants) ? component.variants : [];

    return variants
      .map((variant) =>
        typeof variant === "object" && variant !== null
          ? readNumber(variant as Record<string, unknown>, ["price"])
          : undefined,
      )
      .filter((price): price is number => typeof price === "number");
  });

  if (prices.length === 0) return undefined;

  return Math.min(...prices);
}

function readString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

function readNumber(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return undefined;
}
