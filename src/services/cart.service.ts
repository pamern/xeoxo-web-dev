import { API } from "@/constants/routes";
import { getApiErrorMessage, type ApiResponse } from "@/types/api.types";
import type {
  AddCartItemValues,
  CartDto,
  UpdateCartItemValues,
} from "@/types/cart.types";

async function readApi<T>(response: Response, fallback: string) {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(getApiErrorMessage(payload, fallback));
  }

  return payload.data;
}

export const cartService = {
  async getCart() {
    const response = await fetch(API.CART, {
      credentials: "include",
    });

    return readApi<CartDto>(response, "Khong the tai gio hang.");
  },

  async addItem(values: AddCartItemValues) {
    const response = await fetch(API.CART_ITEMS, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    return readApi<CartDto>(response, "Khong the them san pham vao gio.");
  },

  async updateItem(cartItemId: number, values: UpdateCartItemValues) {
    const response = await fetch(API.CART_ITEM(cartItemId), {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    return readApi<CartDto>(response, "Khong the cap nhat gio hang.");
  },

  async removeItem(cartItemId: number) {
    const response = await fetch(API.CART_ITEM(cartItemId), {
      method: "DELETE",
      credentials: "include",
    });

    return readApi<{ cart_item_id: number }>(
      response,
      "Khong the xoa san pham khoi gio.",
    );
  },

  async clearCart() {
    const response = await fetch(API.CART, {
      method: "DELETE",
      credentials: "include",
    });

    return readApi<{ cart_id: number | null }>(
      response,
      "Khong the xoa gio hang.",
    );
  },
};
