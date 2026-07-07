export type AccountOrderItem = {
  has_review: boolean;
  image_alt: string | null;
  image_src: string;
  line_total: number;
  order_item_id: number;
  price: number;
  product_slug: string | null;
  quantity: number;
  size_label: string | null;
  subtitle: string;
  title: string;
};

export type AccountOrder = {
  created_at: string;
  items: AccountOrderItem[];
  order_code: string;
  order_id: number;
  order_status: string;
  payment_status: string;
  total_amount: number;
};
