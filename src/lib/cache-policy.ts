export const CACHE_TAGS = {
  homepage: "homepage",
  products: "products",
  product: (slug: string) => `product:${slug}`,
  collections: "collections",
  collection: (slug: string) => `collection:${slug}`,
  categories: "categories",
  sizeChart: (slug: string) => `size-chart:${slug}`,
  paymentMethods: "payment-methods",
} as const;

export const CACHE_TTL_SECONDS = {
  homepageCatalog: 60,
  publicCollectionPages: 300,
  publicProductShell: 120,
  latestCollectionHighlight: 300,
  paymentMethods: 300,
} as const;
