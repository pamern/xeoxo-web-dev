import { API } from "@/constants/routes";
import { cachedFetch } from "@/lib/requestCache";
import { getApiErrorMessage, type ApiResponse } from "@/types/api.types";
import type {
  ProductQuickAddDto,
  ProductDetailDto,
  ProductSearchResultsDto,
  ProductSearchSuggestionDto,
  ProductReviewsPageDto,
  SizeChartDto,
} from "@/types/product-api.types";
import type { Product } from "@/types/product.types";

const PRODUCT_DETAIL_TTL_MS = 30_000;
const SIZE_CHART_TTL_MS = 5 * 60_000;

async function readApi<T>(response: Response, fallback: string) {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(getApiErrorMessage(payload, fallback));
  }

  return payload.data;
}

export const productService = {
  async getProductQuickAdd(slug: string) {
    return cachedFetch(
      `product-quick-add:${slug}`,
      async () => {
        const response = await fetch(API.PRODUCT_LINE_SIZES(slug), {
          credentials: "include",
        });

        return readApi<ProductQuickAddDto>(
          response,
          "Khong the tai ton kho size san pham.",
        );
      },
      PRODUCT_DETAIL_TTL_MS,
    );
  },

  async getProductDetail(slug: string) {
    return cachedFetch(
      `product-detail:${slug}`,
      async () => {
        const response = await fetch(API.PRODUCT_LINE(slug), {
          credentials: "include",
        });

        return readApi<ProductDetailDto>(
          response,
          "Khong the tai chi tiet san pham.",
        );
      },
      PRODUCT_DETAIL_TTL_MS,
    );
  },

  async getSizeChart(slug: string) {
    return cachedFetch(
      `size-chart:${slug}`,
      async () => {
        const response = await fetch(API.PRODUCT_SIZE_CHART(slug), {
          credentials: "include",
        });

        return readApi<SizeChartDto>(
          response,
          "Khong the tai bang kich thuoc.",
        );
      },
      SIZE_CHART_TTL_MS,
    );
  },

  async getReviews(
    slug: string,
    page = 1,
    limit = 5,
    filters?: { rating?: number | null; has_image?: boolean; component_id?: number | null }
  ) {
    try {
      const queryParams: Record<string, string> = {
        page: String(page),
        limit: String(limit),
      };
      if (filters?.rating != null) {
        queryParams.rating = String(filters.rating);
      }
      if (filters?.has_image) {
        queryParams.has_image = "true";
      }
      if (filters?.component_id != null) {
        queryParams.component_id = String(filters.component_id);
      }

      const params = new URLSearchParams(queryParams);
      const response = await fetch(`${API.PRODUCT_REVIEWS(slug)}?${params}`, {
        credentials: "include",
      });

      return await readApi<ProductReviewsPageDto & { total_all?: number; total_images?: number; avg_rating?: number; components?: { component_id: number; component_name: string }[] }>(
        response,
        "Khong the tai danh sach danh gia.",
      );
    } catch (err) {
      console.error("Error fetching reviews from API, using fallback empty state:", err);
      return {
        reviews: [],
        total: 0,
        total_all: 0,
        total_images: 0,
        avg_rating: 0,
        page,
        limit,
        has_more: false,
        components: []
      };
    }
  },

  async getRelatedProducts(slug: string) {
    const response = await fetch(`/api/v1/product-lines/${encodeURIComponent(slug)}/related`, {
      credentials: "include",
    });

    return readApi<Product[]>(
      response,
      "Khong the tai san pham lien quan.",
    );
  },

  async getSearchSuggestions(query: string, limit = 4) {
    const params = new URLSearchParams({
      q: query.trim(),
      limit: String(limit),
    });
    const response = await fetch(
      `${API.PRODUCT_LINE_SEARCH_SUGGESTIONS}?${params.toString()}`,
      {
        credentials: "include",
      },
    );

    return readApi<ProductSearchSuggestionDto[]>(
      response,
      "Khong the tai goi y tim kiem san pham.",
    );
  },

  async getSearchResults(query: string, page = 1, limit = 20) {
    const params = new URLSearchParams({
      q: query.trim(),
      page: String(page),
      limit: String(limit),
    });
    const response = await fetch(`${API.PRODUCT_LINES}?${params.toString()}`, {
      credentials: "include",
    });

    return readApi<ProductSearchResultsDto>(
      response,
      "Khong the tai ket qua tim kiem san pham.",
    );
  },
};
