import { API } from "@/constants/routes";
import { cachedFetch } from "@/lib/requestCache";
import { getApiErrorMessage, type ApiResponse } from "@/types/api.types";
import type {
  ProductDetailDto,
  ProductReviewDto,
  ProductReviewsPageDto,
  SizeChartDto,
} from "@/types/product-api.types";

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

  async getReviews(slug: string, page = 1, limit = 5) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await fetch(`${API.PRODUCT_REVIEWS(slug)}?${params}`, {
      credentials: "include",
    });

    return readApi<ProductReviewsPageDto>(
      response,
      "Khong the tai danh sach danh gia.",
    );
  },
};
