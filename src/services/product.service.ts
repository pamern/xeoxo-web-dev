import { API } from "@/constants/routes";
import { getApiErrorMessage, type ApiResponse } from "@/types/api.types";
import type {
  ProductDetailDto,
  ProductReviewDto,
  SizeChartDto,
} from "@/types/product-api.types";

async function readApi<T>(response: Response, fallback: string) {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(getApiErrorMessage(payload, fallback));
  }

  return payload.data;
}

export const productService = {
  async getProductDetail(slug: string) {
    const response = await fetch(API.PRODUCT_LINE(slug), {
      credentials: "include",
    });

    return readApi<ProductDetailDto>(
      response,
      "Khong the tai chi tiet san pham.",
    );
  },

  async getSizeChart(slug: string) {
    const response = await fetch(API.PRODUCT_SIZE_CHART(slug), {
      credentials: "include",
    });

    return readApi<SizeChartDto>(response, "Khong the tai bang kich thuoc.");
  },

  async getReviews(slug: string, page = 1, limit = 3) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await fetch(`${API.PRODUCT_REVIEWS(slug)}?${params}`, {
      credentials: "include",
    });

    return readApi<ProductReviewDto[]>(
      response,
      "Khong the tai danh sach danh gia.",
    );
  },
};
