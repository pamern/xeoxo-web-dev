import type { CustomerAddress } from "@/types/customer.types";
import type { CartItemDto } from "@/types/cart.types";

export type ShippingAddressValues = Pick<
  CustomerAddress,
  "recipient_name" | "recipient_phone" | "province_id" | "district_name" | "address_detail"
> & {
  email?: string;
};

export type CheckoutPreviewValues = {
  cart_item_ids: number[];
  address_id?: number;
  shipping_address?: ShippingAddressValues;
  voucher_code?: string;
};

export type CheckoutPreviewDto = {
  items: CartItemDto[];
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  reward_discount_amount: number;
  total_amount: number;
};

export type CreateOrderValues = CheckoutPreviewValues & {
  payment_method_id: number;
  customer_note?: string;
};

export type CreatedOrderDto = {
  order_id: number;
  order_code: string;
  payment_status: string;
  order_status: string;
  total_amount: number;
  shipping_id?: number | null;
  payment_id?: number | null;
  payment_url?: string;
};
