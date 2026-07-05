import { API } from "@/constants/routes";
import { getApiErrorMessage, type ApiResponse } from "@/types/api.types";
import type { CustomerAddress } from "@/types/customer.types";
import type { ShippingAddressValues } from "@/types/order.types";

export type CreateAddressValues = ShippingAddressValues & {
  is_default?: boolean;
};

async function readApi<T>(response: Response, fallback: string) {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(getApiErrorMessage(payload, fallback));
  }

  return payload.data;
}

export const addressService = {
  async getAddresses() {
    const response = await fetch(API.ADDRESSES, {
      credentials: "include",
    });

    return readApi<CustomerAddress[]>(
      response,
      "Không thể tải sổ địa chỉ.",
    );
  },

  async createAddress(values: CreateAddressValues) {
    const response = await fetch(API.ADDRESSES, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    return readApi<CustomerAddress>(response, "Không thể tạo địa chỉ mới.");
  },
};
