export type CartVariantOption = {
  variant_id: number;
  size_name: string;
  color_name: string;
  price: number;
  is_available: boolean;
};

export type CartItemDto = {
  cart_item_id: number;
  variant_id: number;
  product_line_id: number;
  slug: string;
  name: string;
  thumbnail: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  available_variants?: CartVariantOption[];
};

export type CartDto = {
  cart_id: number | null;
  cart_status: "ACTIVE" | "CHECKOUT" | "ABANDONED";
  items: CartItemDto[];
  subtotal: number;
  total_quantity: number;
};

export type AddCartItemValues = {
  variant_id: number;
  quantity: number;
};

export type UpdateCartItemValues = {
  variant_id?: number;
  quantity?: number;
};

