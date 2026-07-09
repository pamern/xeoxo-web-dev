import type { AccountOrderDetail } from "@/types/account-order.types";

export type OrderLookupValues = {
  order_code: string;
  contact: string;
};

export type OrderLookupDto = AccountOrderDetail;
