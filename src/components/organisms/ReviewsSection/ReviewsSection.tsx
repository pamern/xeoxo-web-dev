"use client";

import { useState } from "react";
import { StarRating } from "@/components/atoms/StarRating";
import { FilterChipButton } from "@/components/atoms/FilterChipButton";
import { Button } from "@/components/atoms/Button";
import type { Product } from "@/types/product.types";
import type { ProductDetailDto } from "@/types/product-api.types";
import type { ApiResponse } from "@/types/api.types";

type ReviewItem = {
  review_id: number;
  customer_name: string;
  rating: number;
  review_content: string;
  created_at: string;
  classification: string;
  media: Array<{ url: string; media_type: string }>;
};

type ReviewsResponse = {
  reviews: ReviewItem[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
};

export function ReviewsSection({
  product,
  apiProduct,
}: {
  product: Product;
  apiProduct?: ProductDetailDto;
}) {
  const initialReviews: ReviewItem[] = apiProduct?.reviews_preview?.map((r) => ({
    review_id: r.review_id,
    customer_name: r.customer_name,
    rating: r.rating,
    review_content: r.review_content ?? "",
    created_at: r.created_at,
    classification: (r as any).classification ?? "Màu: Mặc định | Size: F",
    media: r.media || [],
  })) || [];

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    apiProduct?.reviews_summary?.has_more ?? false
  );
  const [totalReviews, setTotalReviews] = useState(
    apiProduct?.reviews_summary?.total ?? initialReviews.length
  );
  const [activeFilter, setActiveFilter] = useState(0);

  const avgRating = apiProduct?.reviews_summary?.avg_rating ?? 5.0;

  const filters = [
    "Tất cả bình luận",
    `5 Sao (${reviews.filter((r) => r.rating === 5).length || ""})`,
    "4 Sao",
    "3 Sao",
    "Có Bình luận",
  ];

  const handleLoadMore = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/product-lines/${product.slug}/reviews?page=1&limit=${Math.max(totalReviews, 4)}`
      );
      const payload = (await res.json()) as ApiResponse<ReviewsResponse>;
      if (payload.success && payload.data) {
        setReviews(
          payload.data.reviews.map((review) => ({
            ...review,
            review_content: review.review_content ?? "",
          })),
        );
        setHasMore(payload.data.has_more);
        setTotalReviews(payload.data.total);
      }
    } catch (error) {
      console.error("Lỗi khi tải thêm đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (activeFilter === 0) return true;
    if (activeFilter === 1) return review.rating === 5;
    if (activeFilter === 2) return review.rating === 4;
    if (activeFilter === 3) return review.rating === 3;
    if (activeFilter === 4) return review.review_content && review.review_content.trim().length > 0;
    return true;
  });

  return (
    <section className="product-page-shell py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-display-section uppercase">Đánh giá sản phẩm</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-display-section leading-none">{avgRating}</span>
            <span className="pb-1 text-heading-card">trên 5</span>
            <StarRating rating={avgRating} size={24} className="pb-0.5" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {filters.map((filter, idx) => (
            <FilterChipButton
              key={filter}
              active={activeFilter === idx}
              onClick={() => setActiveFilter(idx)}
            >
              {filter}
            </FilterChipButton>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-[1387px] flex-col gap-5">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <article
              key={review.review_id}
              className="rounded-lg bg-[#f3f3f3]"
              style={{
                paddingInline: "var(--review-card-px)",
                paddingBlock: "var(--review-card-py)",
              }}
            >
              <div className="flex gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/10 bg-secondary text-heading-card text-foreground/75">
                  {review.customer_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-body-sm font-bold">{review.customer_name}</h3>
                  <StarRating rating={review.rating} size={16} className="mt-1" />
                  <p className="mt-1 text-caption font-light text-foreground/70">
                    {new Date(review.created_at).toLocaleString("vi-VN")} |{" "}
                    {review.classification}
                  </p>
                  <p className="mt-3 text-body-sm text-foreground/90">
                    {review.review_content}
                  </p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-10 text-foreground/60">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <Button
            type="button"
            variant="primaryPill"
            size="pill"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Xem thêm đánh giá →"}
          </Button>
          <p className="mt-4 text-body text-foreground/70">
            Hiển thị {reviews.length} trên tổng số {totalReviews} bình luận
          </p>
        </div>
      )}
    </section>
  );
}
