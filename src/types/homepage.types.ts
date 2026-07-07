import type { Product } from "@/types/product.types";

export type HomepageProductCardRow = {
  product_line_id: number;
  line_name: string;
  product_line_slug: string;
  created_at: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  price: number | null;
  main_storage_key: string | null;
  main_image_alt: string | null;
  hover_storage_key: string | null;
  hover_image_alt: string | null;
};

export type HomepageProductSection = {
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  products: Product[];
};

export type HomepageCollectionRow = {
  collection_id: number;
  collection_name: string;
  slug: string;
  description: string | null;
  launch_date: string | null;
  created_at: string;
  storage_key: string | null;
  alt_text: string | null;
};
