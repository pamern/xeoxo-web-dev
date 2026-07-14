"use client";

import { API } from "@/constants/routes";
import type { AuthCustomer } from "@/types/auth.types";
import type { UpdateCustomerProfileValues } from "@/types/customer.types";

type CustomerApiResponse = {
  success: boolean;
  message?: string;
  error?: unknown;
  data?: AuthCustomer | null;
};

function getErrorMessage(payload: CustomerApiResponse, fallback: string) {
  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return payload.message ?? fallback;
}

export const customerService = {
  async updateProfile(values: UpdateCustomerProfileValues) {
    const response = await fetch(API.CUSTOMERS_ME, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_name: values.customer_name,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        birthday: values.birthday,
      }),
    });

    const payload = (await response.json()) as CustomerApiResponse;

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(
        getErrorMessage(payload, "Không thể cập nhật thông tin khách hàng."),
      );
    }

    return payload.data;
  },
};
