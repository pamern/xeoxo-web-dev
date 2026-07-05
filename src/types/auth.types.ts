export type AuthMode = "login" | "register";

export type AuthProvider = "google" | "facebook";

export type LoginValues = {
  account: string;
  password: string;
};

export type RegisterValues = {
  fullName: string;
  account: string;
  password: string;
  confirmPassword: string;
};

export type AuthUser = {
  id: string;
  email: string | null;
  fullName: string | null;
};

export type AuthCustomer = {
  customer_id: number;
  account_id: string | null;
  customer_name: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  birthday: string | null;
  customer_type: string;
  tier_id: string | null;
};

export type MeResponse = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  customer: AuthCustomer | null;
};
