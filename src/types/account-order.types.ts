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
  refund_status?: string | null;
  total_amount: number;
};

export type AccountOrderShipping = {
  recipient_name: string;
  recipient_phone: string;
  address_detail: string;
  district_name: string;
  province_name: string | null;
  shipping_provider: string | null;
  tracking_code: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
};

export type AccountOrderDetail = AccountOrder & {
  shipping?: AccountOrderShipping | null;
  shipping_fee: number;
  reward_discount_amount: number;
};
