"use client";

import { useState } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { invalidateCache } from "@/lib/requestCache";
import { queryKeys } from "@/lib/query-keys";
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
const QUICK_ADD_STALE_TIME_MS = 30_000;
const QUICK_ADD_GC_TIME_MS = 5 * 60_000;

export function useQuickAddProduct(productSlug: string) {
  const [state, setState] = useState<QuickAddState>(DEFAULT_STATE);
  const queryClient = useQueryClient();
  const { showAddedToCart } = useCartToast();
  const quickAddQuery = useQuery({
    queryKey: queryKeys.productQuickAdd(productSlug),
    queryFn: () => productService.getProductQuickAdd(productSlug),
    enabled: false,
    staleTime: QUICK_ADD_STALE_TIME_MS,
    gcTime: QUICK_ADD_GC_TIME_MS,
    retry: 1,
  });

  const isLoading = state.status === "loading";
  const selectedSize = state.size;
  const productDetail = quickAddQuery.data ?? null;
  const isDetailLoading =
    quickAddQuery.fetchStatus === "fetching" && quickAddQuery.status !== "success";

  async function getProductDetail() {
    return queryClient.ensureQueryData<ProductQuickAddDto>({
      queryKey: queryKeys.productQuickAdd(productSlug),
      queryFn: () => productService.getProductQuickAdd(productSlug),
      staleTime: QUICK_ADD_STALE_TIME_MS,
    });
  }

  function prefetchDetail() {
    if (productDetail || quickAddQuery.isFetching) {
      return;
    }

    void queryClient.prefetchQuery({
      queryKey: queryKeys.productQuickAdd(productSlug),
      queryFn: () => productService.getProductQuickAdd(productSlug),
      staleTime: QUICK_ADD_STALE_TIME_MS,
      gcTime: QUICK_ADD_GC_TIME_MS,
    });
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
      void queryClient.invalidateQueries({
        queryKey: queryKeys.productQuickAdd(productSlug),
      });
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
    productDetail: productDetail ?? null,
    selectedSize,
    status: state.status,
    message: state.message,
  };
}
