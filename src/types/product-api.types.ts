import type { Product } from "@/types/product.types";

export type ProductMediaDto = {
  url: string;
  media_type: "IMAGE" | "VIDEO";
  media_role: "MAIN" | "GALLERY" | "DETAIL" | "LOOKBOOK";
};

export type ProductSizeOptionDto = {
  variant_id: number;
  size_name: string;
  price: number;
  is_available: boolean;
  stock_quantity?: number;
};

export type ProductQuickAddDto = {
  sizes: ProductSizeOptionDto[];
};

export type ProductSearchSuggestionDto = {
  product_line_id: string;
  slug: string;
  name: string;
  thumbnail: string;
  price: number;
  currency: "VND";
};

export type ProductSearchResultsDto = {
  query: string;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export type ProductReviewDto = {
  review_id: number;
  customer_name: string;
  rating: number;
  review_content: string | null;
  created_at: string;
  classification?: string;
  media: Array<Pick<ProductMediaDto, "url" | "media_type">>;
};

export type ProductReviewsSummaryDto = {
  avg_rating: number;
  total: number;
  preview_count: number;
  has_more: boolean;
  rating_counts: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type ProductReviewsPageDto = {
  reviews: ProductReviewDto[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
};

export type ProductDetailDto = {
  product_line_id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  media: ProductMediaDto[];
  color: {
    color_name: string;
    color_code: string;
  } | null;
  sizes: ProductSizeOptionDto[];
  material: {
    material_name: string;
    description: string | null;
    care_instruction: string | null;
  } | null;
  reviews_summary: ProductReviewsSummaryDto;
  reviews_preview: ProductReviewDto[];
  collection?: {
    collection_name: string;
    slug: string;
  } | null;
  design_style?: string | null;
  usage_context?: string | null;
  features?: string[] | null;
  components?: ProductComponentDto[];
};

export type ProductComponentDto = {
  component_id: number;
  component_name: string;
  component_type: string;
  is_required: boolean;
  display_order: number;
  min_price: number;
  variants: ProductSizeOptionDto[];
};

export type SizeChartDto = {
  chart_name: string;
  description: string | null;
  columns: Array<{
    measurement_type_id: number;
    measurement_name: string;
    unit: string;
  }>;
  rows: Array<{
    size_option_id: number;
    size_name: string;
    values: Array<{
      measurement_type_id: number;
      value: string;
    }>;
  }>;
};
