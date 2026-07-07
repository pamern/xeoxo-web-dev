export const PRODUCT_MEDIA_BUCKET = "product-media";

export const getProductMediaPublicUrl = (
  supabase: {
    storage: {
      from: (bucket: string) => {
        getPublicUrl: (path: string) => { data: { publicUrl: string } };
      };
    };
  },
  storageKey: string | null | undefined,
) => {
  if (!storageKey) {
    return null;
  }

  return supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(storageKey)
    .data.publicUrl;
};
