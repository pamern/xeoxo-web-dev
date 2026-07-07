import type { SupabaseClient } from "@supabase/supabase-js";
import type { LatestCollectionHighlight } from "@/types/collection-highlight.types";

type MediaRow = {
  bucket_name: string;
  storage_key: string;
  alt_text: string | null;
};

type CollectionRow = {
  collection_id: number;
  slug: string;
  collection_name: string;
  description: string | null;
  launch_date: string | null;
  media: MediaRow | MediaRow[] | null;
};

type ProductLineRow = {
  product_line_id: number;
};

type ProductMediaRow = {
  media_role: string;
  display_order: number;
  media: MediaRow | MediaRow[] | null;
};

function getSingleMedia(media: MediaRow | MediaRow[] | null | undefined) {
  if (!media) {
    return null;
  }

  return Array.isArray(media) ? (media[0] ?? null) : media;
}

function getPublicMediaUrl(supabase: SupabaseClient, media: MediaRow | null) {
  if (!media?.bucket_name || !media.storage_key) {
    return null;
  }

  const { data } = supabase.storage
    .from(media.bucket_name)
    .getPublicUrl(media.storage_key);

  return data.publicUrl || null;
}

export async function getLatestCollectionHighlight(
  supabase: SupabaseClient,
): Promise<LatestCollectionHighlight | null> {
  const { data: collection, error: collectionError } = await supabase
    .schema("catalog")
    .from("collection")
    .select(
      "collection_id, slug, collection_name, description, launch_date, media:media_id(bucket_name, storage_key, alt_text)",
    )
    .eq("status", "ACTIVE")
    .order("launch_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<CollectionRow>();

  if (collectionError) {
    throw new Error(collectionError.message);
  }

  if (!collection) {
    return null;
  }

  const { data: productLine, error: productLineError } = await supabase
    .schema("catalog")
    .from("product_line")
    .select("product_line_id")
    .eq("collection_id", collection.collection_id)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<ProductLineRow>();

  if (productLineError) {
    throw new Error(productLineError.message);
  }

  let selectedProductMedia: ProductMediaRow | null = null;

  if (productLine) {
    const { data: productMediaRows, error: productMediaError } = await supabase
      .schema("catalog")
      .from("product_line_media")
      .select(
        "media_role, display_order, media:media_id(bucket_name, storage_key, alt_text)",
      )
      .eq("product_line_id", productLine.product_line_id)
      .order("display_order", { ascending: true })
      .returns<ProductMediaRow[]>();

    if (productMediaError) {
      throw new Error(productMediaError.message);
    }

    selectedProductMedia =
      productMediaRows.find((item) => item.media_role === "MAIN") ??
      productMediaRows[0] ??
      null;
  }

  const collectionMedia = getSingleMedia(collection.media);
  const productMedia = getSingleMedia(selectedProductMedia?.media);

  return {
    collectionId: collection.collection_id,
    slug: collection.slug,
    name: collection.collection_name,
    description: collection.description,
    launchDate: collection.launch_date,
    collectionImage: getPublicMediaUrl(supabase, collectionMedia),
    collectionImageAlt:
      collectionMedia?.alt_text?.trim() || collection.collection_name,
    productImage: getPublicMediaUrl(supabase, productMedia),
    productImageAlt:
      productMedia?.alt_text?.trim() ||
      `Sản phẩm thuộc bộ sưu tập ${collection.collection_name}`,
  };
}
