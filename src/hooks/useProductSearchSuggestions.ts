"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { productService } from "@/services/product.service";
import type { ProductSearchSuggestionDto } from "@/types/product-api.types";

export function useProductSearchSuggestions(
  query: string,
  options?: {
    enabled?: boolean;
    limit?: number;
  },
) {
  const enabled = options?.enabled ?? true;
  const limit = options?.limit ?? 4;
  const deferredQuery = useDeferredValue(query.trim());
  const [suggestions, setSuggestions] = useState<ProductSearchSuggestionDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || deferredQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    const timer = window.setTimeout(() => {
      void productService
        .getSearchSuggestions(deferredQuery, limit)
        .then((data) => {
          if (active) {
            setSuggestions(data);
          }
        })
        .catch(() => {
          if (active) {
            setSuggestions([]);
          }
        })
        .finally(() => {
          if (active) {
            setIsLoading(false);
          }
        });
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [deferredQuery, limit]);

  return { suggestions, isLoading };
}
