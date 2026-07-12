export type CartVariantOption = {
  variant_id: number;
  size_name: string;
  color_name: string;
  price: number;
  is_available: boolean;
};

export type CartItemDto = {
  cart_item_id: number;
  variant_id: number | null;
  product_line_id: number;
  component_id: number | null;
  component_name?: string | null;
  component_type?: string | null;
  gender?: "nam" | "nu" | "tre-em";
  slug: string;
  name: string;
  thumbnail: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  available_variants?: CartVariantOption[];
  item_type: "STANDARD" | "CUSTOMIZED";
  customization_id?: number | null;
  surcharge_percent?: number | null;
  surcharge_amount?: number | null;
  custom_price?: number | null;
  measurement_summary?: Record<string, number> | null;
  customization_snapshot?: unknown;
};

export type CartDto = {
  cart_id: number | null;
  cart_status: "ACTIVE" | "CHECKOUT" | "ABANDONED";
  items: CartItemDto[];
  subtotal: number;
  total_quantity: number;
};

export type AddCartItemValues = {
  variant_id?: number;
  quantity: number;
  item_type?: "STANDARD" | "CUSTOMIZED";
  customization_id?: number;
};

export type UpdateCartItemValues = {
  variant_id?: number;
  customization_id?: number;
  quantity?: number;
};

