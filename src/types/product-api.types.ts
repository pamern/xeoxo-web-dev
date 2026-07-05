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

export type ProductReviewDto = {
  review_id: number;
  customer_name: string;
  rating: number;
  review_content: string | null;
  created_at: string;
  media: Array<Pick<ProductMediaDto, "url" | "media_type">>;
};

export type ProductReviewsSummaryDto = {
  avg_rating: number;
  total: number;
  preview_count: number;
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

