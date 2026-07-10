export const queryKeys = {
  productQuickAdd: (slug: string) => ["product-quick-add", slug] as const,
} as const;
