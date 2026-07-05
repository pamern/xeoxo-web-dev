export type CustomerGender = "MALE" | "FEMALE" | "OTHER";

export type CustomerAddress = {
  address_id: number;
  customer_id: number;
  recipient_name: string;
  recipient_phone: string;
  province_id: number;
  province_name: string | null;
  district_name: string;
  address_detail: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

export type UpdateCustomerProfileValues = {
  customer_name: string;
  email: string;
  phone: string;
  gender: CustomerGender | "";
  birthday: string;
};
