"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { ProductReviewModal } from "@/components/organisms/ProductReviewModal/ProductReviewModal";
import { Pagination } from "@/components/molecules/Pagination";

const REVIEWS_PER_PAGE = 5;

type ReviewItem = {
  review_id: number;
  order_item_id: number;
  rating: number;
  review_content: string;
  created_at: string;
  updated_at: string | null;
  is_edited: boolean;
  customer_name: string;
  price: number;
  quantity: number;
  product_slug: string;
  product_title: string;
  product_subtitle: string;
  image_src: string;
  media: Array<{
    media_id: number;
    public_url: string;
    media_type: "IMAGE" | "VIDEO";
  }>;
};

interface AccountReviewsContentProps {
  initialReviews: ReviewItem[];
  initialTotal: number;
  customerName: string;
}

function EmptyReviewState() {
  return (
    <div className="mt-5">
      <p className="text-[13px] font-light text-black">
        Bạn chưa có bất kỳ đánh giá nào...
      </p>

      <div className="relative mt-4 overflow-hidden rounded-[4px] bg-black">
        <Image
          src="/images/danh-gia.png"
          alt=""
          width={1728}
          height={608}
          className="h-auto w-full opacity-100"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />
        <div className="absolute bottom-6 left-7 text-white">
          <p className="text-[15px] font-bold leading-tight">
            Nhiều quyền lợi hấp dẫn đang chờ bạn
          </p>
          <Link
            href={ROUTES.COLLECTIONS}
            className="mt-3 inline-flex min-h-[42px] min-w-[150px] items-center justify-center rounded-full border border-white/80 bg-white/8 px-6 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] backdrop-blur-[10px] transition-all hover:bg-white/20 hover:scale-[0.98]"
          >
            Khám phá
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AccountReviewsContent({
  initialReviews,
  initialTotal,
  customerName,
}: AccountReviewsContentProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [total, setTotal] = useState(initialTotal);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));
  const hasHydratedFromInitial = useRef(false);

  const fetchReviews = async (page: number) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        offset: String((page - 1) * REVIEWS_PER_PAGE),
        limit: String(REVIEWS_PER_PAGE),
      });
      const res = await fetch(`/api/v1/reviews?${query.toString()}`);
      const payload = await res.json();
      if (payload.success) {
        setReviews(payload.data?.reviews ?? []);
        setTotal(payload.data?.total ?? 0);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách đánh giá:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasHydratedFromInitial.current) {
      hasHydratedFromInitial.current = true;
      return;
    }

    void fetchReviews(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const formatReviewDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getQualityText = (rating: number) => {
    if (rating === 5) return "Sản phẩm tốt";
    if (rating === 4) return "Hài lòng";
    if (rating === 3) return "Bình thường";
    if (rating === 2) return "Không hài lòng";
    return "Tệ";
  };

  return (
    <>
      {reviews.length === 0 ? (
        <EmptyReviewState />
      ) : (
        <div className="mt-6 space-y-6">
          {reviews.map((review) => (
            <div
              key={review.review_id}
              className="rounded-[12px] border border-black/10 p-5 md:p-6 flex flex-col gap-4 bg-white"
            >
              {/* User & Rating row */}
              <div className="flex items-start gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100 border border-black/5">
                  <Image
                    src="/images/placeholder.png"
                    alt={review.customer_name || customerName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-black leading-tight">
                    {review.customer_name || customerName}
                  </span>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        width={14}
                        height={14}
                        className={cn(
                          "fill-current",
                          i < review.rating ? "text-amber-400" : "text-slate-200"
                        )}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Detail metadata */}
              <div className="text-[12px] text-black/45 font-light leading-none flex flex-wrap gap-x-2 gap-y-1">
                <span>{formatReviewDate(review.created_at)}</span>
                <span>|</span>
                <span>Sản phẩm: {review.product_title}</span>
                <span>|</span>
                <span>Phân loại hàng: {review.product_subtitle}</span>
              </div>

              {/* Quality Text */}
              <div className="text-[13px] text-black">
                <span className="font-light text-black/60">Chất lượng sản phẩm:</span>{" "}
                <span className="font-bold">{getQualityText(review.rating)}</span>
              </div>

              {/* Content */}
              {review.review_content && (
                <p className="text-[13px] font-light leading-relaxed text-black/85">
                  {review.review_content}
                </p>
              )}

              {/* Media display */}
              {review.media && review.media.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mt-1">
                  {review.media.map((m) => (
                    <div
                      key={m.media_id}
                      className="relative overflow-hidden rounded-[6px] border border-black/5 bg-white shadow-sm"
                    >
                      {m.media_type === "IMAGE" ? (
                        <a href={m.public_url} target="_blank" rel="noreferrer" className="block">
                          <img
                            src={m.public_url}
                            alt="Đánh giá"
                            className="h-[80px] w-[80px] object-cover transition-opacity hover:opacity-90"
                          />
                        </a>
                      ) : (
                        <video
                          src={m.public_url}
                          controls
                          className="h-[80px] w-[130px] object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Bar: Likes and Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.06]">
                {/* Likes count (Mocked as image 2 layout) */}
                <div className="flex items-center gap-1.5 text-black/45">
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className="text-black/45"
                  >
                    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                  </svg>
                  <span className="text-[12px] font-light">12</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {!review.is_edited && (
                    <button
                      type="button"
                      onClick={() => setSelectedReview(review)}
                      className="inline-flex min-h-[30px] items-center justify-center rounded-[4px] border border-black bg-white px-5 text-[12px] font-bold text-black transition-colors hover:bg-black hover:text-white"
                    >
                      Đánh giá lại
                    </button>
                  )}
                  <Link
                    href={ROUTES.PRODUCT(review.product_slug)}
                    className="inline-flex min-h-[30px] items-center justify-center rounded-[4px] border border-black bg-white px-5 text-[12px] font-bold text-black transition-colors hover:bg-black hover:text-white"
                  >
                    Xem trực tiếp
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {selectedReview && (
        <ProductReviewModal
          orderCode=""
          items={[
            {
              has_review: true,
              image_alt: selectedReview.product_title,
              image_src: selectedReview.image_src,
              line_total: selectedReview.price * selectedReview.quantity,
              order_item_id: selectedReview.order_item_id,
              price: selectedReview.price,
              product_slug: selectedReview.product_slug,
              quantity: selectedReview.quantity,
              size_label: null,
              subtitle: selectedReview.product_subtitle,
              title: selectedReview.product_title,
            },
          ]}
          onClose={() => setSelectedReview(null)}
          onFinished={() => {
            setSelectedReview(null);
            void fetchReviews(currentPage);
          }}
        />
      )}
    </>
  );
}
