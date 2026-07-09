"use client";

import { useState } from "react";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { invalidateCache } from "@/lib/requestCache";
import { useCartToast } from "@/components/providers/CartToastProvider";
import type { ProductQuickAddDto } from "@/types/product-api.types";

type QuickAddState = {
  size?: string;
  status: "idle" | "loading" | "success" | "error";
  message?: string;
};

const DEFAULT_STATE: QuickAddState = {
  status: "idle",
};

export function useQuickAddProduct(productSlug: string) {
  const [productDetail, setProductDetail] = useState<ProductQuickAddDto | null>(
    null,
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [state, setState] = useState<QuickAddState>(DEFAULT_STATE);
  const { showAddedToCart } = useCartToast();

  const isLoading = state.status === "loading";
  const selectedSize = state.size;

  async function getProductDetail() {
    if (productDetail) {
      return productDetail;
    }

    const detail = await productService.getProductQuickAdd(productSlug);
    setProductDetail(detail);
    return detail;
  }

  function prefetchDetail() {
    if (productDetail || isDetailLoading) {
      return;
    }

    setIsDetailLoading(true);
    productService
      .getProductQuickAdd(productSlug)
      .then(setProductDetail)
      .catch(() => {})
      .finally(() => setIsDetailLoading(false));
  }

  async function addSize(size: string) {
    setState({ size, status: "loading" });

    try {
      const detail = await getProductDetail();
      const variant = detail.sizes.find(
        (option) =>
          option.size_name.trim().toLowerCase() ===
          size.trim().toLowerCase(),
      );

      if (!variant || !variant.is_available) {
        throw new Error("Size này hiện chưa có sẵn.");
      }

      const updatedCart = await cartService.addItem({
        variant_id: variant.variant_id,
        quantity: 1,
      });

      const addedItem = updatedCart.items.find(
        (cartItem) => cartItem.variant_id === variant.variant_id,
      );
      if (addedItem) {
        showAddedToCart(addedItem);
      }

      invalidateCache(`product-quick-add:${productSlug}`);
      window.dispatchEvent(new Event("xeoxo-cart-updated"));
      setState({
        size,
        status: "success",
        message: "Đã thêm vào giỏ",
      });
      window.setTimeout(() => setState(DEFAULT_STATE), 1800);
    } catch (error) {
      setState({
        size,
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể thêm sản phẩm vào giỏ.",
      });
      window.setTimeout(() => setState(DEFAULT_STATE), 2400);
    }
  }

  return {
    addSize,
    prefetchDetail,
    isLoading,
    isDetailLoading,
    productDetail,
    selectedSize,
    status: state.status,
    message: state.message,
  };
}
