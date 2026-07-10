"use client";

import { useMemo, useState } from "react";
import { StarRating } from "@/components/atoms/StarRating";
import { FilterChipButton } from "@/components/atoms/FilterChipButton";
import { Button } from "@/components/atoms/Button";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.types";
import type { ProductDetailDto, ProductReviewDto } from "@/types/product-api.types";

type FilterValue = "all" | 5 | 4 | 3 | 2 | 1 | "comment";

const FILTERS: Array<{ label: string; value: FilterValue }> = [
  { label: "Tất cả bình luận", value: "all" },
  { label: "5 Sao", value: 5 },
  { label: "4 Sao", value: 4 },
  { label: "3 Sao", value: 3 },
  { label: "2 Sao", value: 2 },
  { label: "1 Sao", value: 1 },
  { label: "Có Bình luận", value: "comment" },
];

export function ReviewsSection({
  product,
  apiProduct,
}: {
  product: Product;
  apiProduct?: ProductDetailDto;
}) {
  const initialReviews = apiProduct?.reviews_preview ?? [];
  const [reviews, setReviews] = useState<ProductReviewDto[]>(initialReviews);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const totalReviews = apiProduct?.reviews_summary?.total ?? initialReviews.length;
  const avgRating = apiProduct?.reviews_summary?.avg_rating ?? 0;
  const ratingCounts =
    apiProduct?.reviews_summary?.rating_counts ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const filteredReviews = useMemo(
    () => filterReviews(reviews, activeFilter),
    [reviews, activeFilter],
  );

  async function loadAllReviews() {
    if (loadingAll) return;
    setLoadingAll(true);
    try {
      const page = await productService.getReviews(
        product.slug,
        1,
        Math.max(totalReviews, 5),
      );
      setReviews(page.reviews);
    } catch (error) {
      console.error("Không thể tải thêm đánh giá:", error);
    } finally {
      setLoadingAll(false);
    }
  }

  async function openAllReviews(filter: FilterValue = activeFilter) {
    setActiveFilter(filter);
    setModalOpen(true);
    if (reviews.length < totalReviews) {
      await loadAllReviews();
    }
  }

  return (
    <section className="mx-auto w-full max-w-site px-6 py-10 xl:px-[100px]">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[30px] font-bold uppercase">Đánh giá sản phẩm</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-[44px] font-bold leading-none">
              {avgRating.toFixed(1)}
            </span>
            <span className="pb-1 text-xl">trên 5</span>
            <StarRating rating={avgRating} size={24} className="pb-0.5" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {FILTERS.map((filter) => (
            <FilterChipButton
              key={String(filter.value)}
              active={activeFilter === filter.value}
              onClick={() => {
                setActiveFilter(filter.value);
                if (reviews.length < totalReviews) void openAllReviews(filter.value);
              }}
            >
              {filter.label} {filterCount(filter.value, totalReviews, ratingCounts)}
            </FilterChipButton>
          ))}
        </div>
      </div>

      <ReviewList reviews={filteredReviews.slice(0, 5)} className="mt-8" />

      {filteredReviews.length === 0 && (
        <p className="py-10 text-center text-foreground/60">
          Chưa có đánh giá phù hợp.
        </p>
      )}

      {totalReviews > 5 && (
        <div className="mt-8 text-center">
          <Button
            type="button"
            variant="primaryPill"
            size="pill"
            onClick={() => void openAllReviews()}
            disabled={loadingAll}
          >
            {loadingAll ? "Đang tải..." : "Xem tất cả đánh giá →"}
          </Button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[86vh] w-full max-w-[980px] overflow-hidden rounded-[24px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <h3 className="text-2xl font-bold uppercase">Tất cả đánh giá</h3>
                <p className="mt-1 text-sm text-foreground/60">
                  Sắp xếp theo đánh giá cao và mới nhất.
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setModalOpen(false)}
                className="text-3xl leading-none hover:opacity-60"
              >
                ×
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5 px-6 py-4">
              {FILTERS.map((filter) => (
                <FilterChipButton
                  key={String(filter.value)}
                  active={activeFilter === filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label} {filterCount(filter.value, totalReviews, ratingCounts)}
                </FilterChipButton>
              ))}
            </div>
            <div className="max-h-[58vh] overflow-y-auto px-6 pb-6">
              <ReviewList reviews={filteredReviews} />
              {filteredReviews.length === 0 && (
                <p className="py-10 text-center text-foreground/60">
                  Chưa có đánh giá phù hợp.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function filterReviews(reviews: ProductReviewDto[], filter: FilterValue) {
  if (filter === "all") return reviews;
  if (filter === "comment") {
    return reviews.filter((review) => review.review_content?.trim());
  }
  return reviews.filter((review) => Math.round(review.rating) === filter);
}

function filterCount(
  filter: FilterValue,
  total: number,
  ratingCounts: Record<1 | 2 | 3 | 4 | 5, number>,
) {
  if (filter === "all") return total;
  if (filter === "comment") return "";
  return ratingCounts[filter];
}

function ReviewList({
  reviews,
  className,
}: {
  reviews: ProductReviewDto[];
  className?: string;
}) {
  if (!reviews.length) return null;

  return (
    <div className={["mx-auto flex max-w-[1387px] flex-col gap-5", className].filter(Boolean).join(" ")}>
      {reviews.map((review) => (
        <article
          key={review.review_id}
          className="rounded-[20px] bg-[#f3f3f3] px-8 py-7"
        >
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/10 bg-secondary text-lg font-bold text-foreground/75">
              {review.customer_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold">{review.customer_name}</h3>
              <StarRating rating={review.rating} size={16} className="mt-1" />
              <p className="mt-1 text-xs font-light text-foreground/70">
                {new Date(review.created_at).toLocaleString("vi-VN")}
                {review.classification ? ` | ${review.classification}` : ""}
              </p>
              {review.review_content && (
                <p className="mt-3 text-sm font-light leading-relaxed text-foreground/90">
                  {review.review_content}
                </p>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
