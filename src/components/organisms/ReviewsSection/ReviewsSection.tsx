"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { StarRating } from "@/components/atoms/StarRating";
import { productService } from "@/services/product.service";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product.types";
import type { ProductDetailDto, ProductReviewDto } from "@/types/product-api.types";

export function ReviewsSection({
  product,
  apiProduct,
}: {
  product: Product;
  apiProduct?: ProductDetailDto;
}) {
  const initialReviews = apiProduct?.reviews_preview ?? [];
  const [reviews, setReviews] = useState<ProductReviewDto[]>(initialReviews);
  const [rating, setRating] = useState<number | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [componentId, setComponentId] = useState<number | null>(null);
  const [componentsList, setComponentsList] = useState<Array<{ component_id: number; component_name: string }>>(
    apiProduct?.components?.map((c) => ({
      component_id: c.component_id,
      component_name: c.component_name,
    })) ?? []
  );
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredTotal, setFilteredTotal] = useState(
    apiProduct?.reviews_summary?.total ?? initialReviews.length
  );
  const [totalAllCount, setTotalAllCount] = useState(
    apiProduct?.reviews_summary?.total ?? initialReviews.length
  );
  const [totalImagesCount, setTotalImagesCount] = useState(0);
  const [avgRating, setAvgRating] = useState(apiProduct?.reviews_summary?.avg_rating ?? 0);

  const [ratingOpen, setRatingOpen] = useState(false);
  const [componentOpen, setComponentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "has_image" | "rating" | "component">("all");

  const [isPending, startTransition] = useTransition();
  const listContainerRef = useRef<HTMLDivElement>(null);

  const fetchFilteredReviews = (r: number | null, hi: boolean, cid: number | null, p: number = 1) => {
    setCurrentPage(p);
    startTransition(async () => {
      try {
        const pageData = await productService.getReviews(product.slug, p, 10, {
          rating: r,
          has_image: hi,
          component_id: cid,
        });
        setReviews(pageData.reviews);
        setFilteredTotal(pageData.total);
        if (pageData.components) {
          setComponentsList(pageData.components);
        }
        if (pageData.total_all !== undefined) {
          setTotalAllCount(pageData.total_all);
        }
        if (pageData.total_images !== undefined) {
          setTotalImagesCount(pageData.total_images);
        }
        if (pageData.avg_rating !== undefined) {
          setAvgRating(pageData.avg_rating);
        }
      } catch (error) {
        console.error("Không thể tải danh sách đánh giá:", error);
      }
    });
  };

  useEffect(() => {
    fetchFilteredReviews(null, false, null, 1);
  }, []);

  const handleRatingChange = (newRating: number | null) => {
    setActiveTab("rating");
    setRating(newRating);
    setHasImage(false);
    setComponentId(null);
    fetchFilteredReviews(newRating, false, null, 1);
  };

  const handleHasImageChange = (newHasImage: boolean) => {
    setActiveTab("has_image");
    setHasImage(newHasImage);
    setRating(null);
    setComponentId(null);
    fetchFilteredReviews(null, newHasImage, null, 1);
  };

  const handleComponentChange = (newCompId: number | null) => {
    setActiveTab("component");
    setComponentId(newCompId);
    setRating(null);
    setHasImage(false);
    fetchFilteredReviews(null, false, newCompId, 1);
  };

  const handlePageChange = (p: number) => {
    fetchFilteredReviews(rating, hasImage, componentId, p);
    
    // Scroll list container back to top
    if (listContainerRef.current) {
      listContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const renderPagination = () => {
    const totalPages = Math.max(1, Math.ceil(filteredTotal / 10));

    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show page 1
      pages.push(1);
      
      if (currentPage <= 3) {
        pages.push(2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push("...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return (
      <div className="mt-6 flex items-center justify-center gap-2">
        {/* Prev Page Button (Only show if currentPage > 1) */}
        {currentPage > 1 && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => handlePageChange(currentPage - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <svg className="w-4 h-4 stroke-[2.5px] stroke-current fill-none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={idx} className="px-2 text-foreground/50 select-none">
                ...
              </span>
            );
          }
          const isCurrent = p === currentPage;
          return (
            <button
              key={idx}
              type="button"
              disabled={isPending}
              onClick={() => handlePageChange(p as number)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors",
                isCurrent
                  ? "bg-black text-white"
                  : "border border-black/10 bg-white text-black"
              )}
            >
              {p}
            </button>
          );
        })}

        {/* Next Page Button (Only show if currentPage < totalPages) */}
        {currentPage < totalPages && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => handlePageChange(currentPage + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <svg className="w-4 h-4 stroke-[2.5px] stroke-current fill-none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  return (
    <section className="reviews-shell">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="reviews-title">Đánh giá sản phẩm</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="reviews-score">
              {avgRating.toFixed(1)}
            </span>
            <span className="pb-1 text-body-xl">trên 5</span>
            <StarRating rating={avgRating} size={24} className="pb-0.5" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 border-t border-b border-black/10 py-4">
          {/* Nút 1: Tất cả */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setRating(null);
              setHasImage(false);
              setComponentId(null);
              fetchFilteredReviews(null, false, null, 1);
            }}
            className={cn(
              "inline-flex h-[34px] items-center justify-center rounded-full border px-4 text-xs font-bold transition-colors cursor-pointer",
              (activeTab === "all")
                ? "border-black bg-black text-white"
                : "border-black/35 bg-white text-black"
            )}
          >
            Tất cả ({totalAllCount})
          </button>

          {/* Nút 2: Có hình ảnh */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("has_image");
              setRating(null);
              setHasImage(true);
              setComponentId(null);
              fetchFilteredReviews(null, true, null, 1);
            }}
            className={cn(
              "inline-flex h-[34px] items-center justify-center rounded-full border px-4 text-xs font-bold transition-colors cursor-pointer",
              (activeTab === "has_image")
                ? "border-black bg-black text-white"
                : "border-black/35 bg-white text-black"
            )}
          >
            Có hình ảnh ({totalImagesCount})
          </button>

          {/* Nút 3: Sao custom dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const nextOpen = !ratingOpen;
                setRatingOpen(nextOpen);
                setComponentOpen(false);
                if (nextOpen) {
                  setActiveTab("rating");
                  setHasImage(false);
                  setComponentId(null);
                  fetchFilteredReviews(rating, false, null, 1);
                }
              }}
              className={cn(
                "inline-flex h-[34px] items-center justify-center rounded-full border px-4 text-xs font-bold transition-colors cursor-pointer",
                (activeTab === "rating")
                  ? "border-black bg-black text-white"
                  : "border-black/35 bg-white text-black"
              )}
            >
              <span className="flex items-center gap-1.5">
                Sao
                <svg className="w-2.5 h-2.5 shrink-0 stroke-current fill-none stroke-[2px]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </button>
            {ratingOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRatingOpen(false)} />
                <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-black/15 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      handleRatingChange(null);
                      setRatingOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-xs font-semibold hover:bg-black hover:text-white transition-colors",
                      rating === null ? "bg-black/5 font-bold" : ""
                    )}
                  >
                    Tất cả sao
                  </button>
                  {[5, 4, 3, 2, 1].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        handleRatingChange(s);
                        setRatingOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-xs font-semibold hover:bg-black hover:text-white transition-colors",
                        rating === s ? "bg-black/5 font-bold" : ""
                      )}
                    >
                      {s} Sao
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Nút 4: Thành phần custom dropdown (chỉ cho Multi-component) */}
          {componentsList.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const nextOpen = !componentOpen;
                  setComponentOpen(nextOpen);
                  setRatingOpen(false);
                  if (nextOpen) {
                    setActiveTab("component");
                    setHasImage(false);
                    setRating(null);
                    fetchFilteredReviews(null, false, componentId, 1);
                  }
                }}
                className={cn(
                  "inline-flex h-[34px] items-center justify-center rounded-full border px-4 text-xs font-bold transition-colors cursor-pointer",
                  (activeTab === "component")
                    ? "border-black bg-black text-white"
                    : "border-black/35 bg-white text-black"
                )}
              >
                <span className="flex items-center gap-1.5">
                  Thành phần
                  <svg className="w-2.5 h-2.5 shrink-0 stroke-current fill-none stroke-[2px]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>
              {componentOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setComponentOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-black/15 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        handleComponentChange(null);
                        setComponentOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-xs font-semibold hover:bg-black hover:text-white transition-colors",
                        componentId === null ? "bg-black/5 font-bold" : ""
                      )}
                    >
                      Tất cả thành phần
                    </button>
                    {componentsList.map((comp) => (
                      <button
                        key={comp.component_id}
                        type="button"
                        onClick={() => {
                          handleComponentChange(comp.component_id);
                          setComponentOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs font-semibold hover:bg-black hover:text-white transition-colors",
                          componentId === comp.component_id ? "bg-black/5 font-bold" : ""
                        )}
                      >
                        {comp.component_name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {isPending && (
            <span className="text-[10px] text-foreground/50 animate-pulse ml-auto">
              Đang tải...
            </span>
          )}
        </div>
      </div>

      {/* Scrollable box container for reviews */}
      <div 
        ref={listContainerRef}
        className="mt-8 max-h-[600px] overflow-y-auto pr-2 scroll-smooth border border-black/5 rounded-[12px] p-4 bg-foreground/[0.01]"
      >
        <ReviewList reviews={reviews} />
        {reviews.length === 0 && (
          <p className="py-10 text-center text-foreground/60">
            Chưa có đánh giá phù hợp.
          </p>
        )}
      </div>

      {renderPagination()}
    </section>
  );
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
    <div className={cn("review-list-shell flex flex-col gap-4", className)}>
      {reviews.map((review) => (
        <article key={review.review_id} className="review-card">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/10 bg-secondary text-lg font-bold text-foreground/75">
              {review.customer_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-body-sm font-bold">{review.customer_name}</h3>
              <StarRating rating={review.rating} size={16} className="mt-1" />
              <p className="mt-1 text-caption font-light text-foreground/70">
                {new Date(review.created_at).toLocaleString("vi-VN")}
                {review.classification ? ` | ${review.classification}` : ""}
              </p>
              {review.review_content && (
                <p className="mt-3 text-body-sm font-light leading-relaxed text-foreground/90">
                  {review.review_content}
                </p>
              )}
              {review.media && review.media.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.media.map((imgObj, idx) => (
                    <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-md border border-black/10">
                      <img
                        src={imgObj.url}
                        alt={`Đánh giá hình ảnh ${idx}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
