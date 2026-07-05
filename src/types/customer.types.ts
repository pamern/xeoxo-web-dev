export type CustomerGender = "MALE" | "FEMALE" | "OTHER";

export type UpdateCustomerProfileValues = {
  customer_name: string;
  email: string;
  phone: string;
  gender: CustomerGender | "";
  birthday: string;
};
