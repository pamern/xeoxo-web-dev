"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";
import type { AccountOrderItem } from "@/types/account-order.types";
import { ROUTES } from "@/constants/routes";

type ReviewMedia = {
  media_id: number;
  public_url: string;
  media_type: "IMAGE" | "VIDEO";
};

type ReviewState = {
  order_item_id: number;
  rating: number;
  review_content: string;
  has_review: boolean;
  media: ReviewMedia[];
  isEditing?: boolean;
  isLoadingExisting?: boolean;
  uploading?: boolean;
  is_edited?: boolean;
};

interface ProductReviewModalProps {
  orderCode: string;
  items: AccountOrderItem[];
  onClose: () => void;
  onFinished: () => void;
}

export function ProductReviewModal({
  orderCode,
  items,
  onClose,
  onFinished,
}: ProductReviewModalProps) {
  // Store local state of reviews for each item
  const [reviewStates, setReviewStates] = useState<Record<number, ReviewState>>({});
  // Track which item is currently expanded for review entry
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  // Status message/errors
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittingItemId, setSubmittingItemId] = useState<number | null>(null);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        onFinished();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, onFinished]);

  const handleFinish = async () => {
    // Find all items that have pending changes (not yet saved, but user entered rating/text/media)
    const pendingItems = items.filter((item) => {
      const state = reviewStates[item.order_item_id];
      if (!state) return false;
      // If it already has a review and is not in edit mode, it's not pending
      if (state.has_review && !state.isEditing) return false;
      
      const isNewPending = !state.has_review;
      const isEditPending = state.has_review && state.isEditing;
      
      return isNewPending || isEditPending;
    });

    if (pendingItems.length > 0) {
      setIsSubmittingAll(true);
      try {
        for (const item of pendingItems) {
          const state = reviewStates[item.order_item_id];
          if (!state || !item.product_slug) continue;
          
          const response = await fetch(`/api/v1/product-lines/${item.product_slug}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_item_id: item.order_item_id,
              rating: state.rating,
              review_content: state.review_content,
              media_ids: state.media.map((m) => m.media_id),
            }),
          });

          const payload = await response.json();
          if (!response.ok || !payload.success) {
            throw new Error(payload.message || "Không thể lưu đánh giá.");
          }
        }
      } catch (err) {
        console.error("Lỗi khi tự động gửi đánh giá:", err);
        setSubmitError(
          err instanceof Error ? err.message : "Không thể lưu đánh giá.",
        );
        return;
      } finally {
        setIsSubmittingAll(false);
      }
    }

    setShowSuccess(true);
  };

  // Helper to fetch existing review details
  const fetchExistingReview = async (item: AccountOrderItem) => {
    if (!item.product_slug) return;
    
    setReviewStates((prev) => ({
      ...prev,
      [item.order_item_id]: {
        ...prev[item.order_item_id],
        isLoadingExisting: true,
      },
    }));

    try {
      const res = await fetch(
        `/api/v1/product-lines/${item.product_slug}/reviews?order_item_id=${item.order_item_id}`,
        { cache: "no-store" },
      );
      const payload = await res.json();
      if (payload.success && payload.data) {
        setReviewStates((prev) => ({
          ...prev,
          [item.order_item_id]: {
            order_item_id: item.order_item_id,
            rating: payload.data.rating,
            review_content: payload.data.review_content ?? "",
            has_review: true,
            media: payload.data.media || [],
            isEditing: false,
            isLoadingExisting: false,
            uploading: false,
            is_edited: payload.data.is_edited ?? false,
          },
        }));
      } else {
        setReviewStates((prev) => ({
          ...prev,
          [item.order_item_id]: {
            ...prev[item.order_item_id],
            isLoadingExisting: false,
          },
        }));
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin đánh giá cũ:", err);
      setReviewStates((prev) => ({
        ...prev,
        [item.order_item_id]: {
          ...prev[item.order_item_id],
          isLoadingExisting: false,
        },
      }));
    }
  };

  // Initialize review states from items prop
  useEffect(() => {
    const initialStates: Record<number, ReviewState> = {};
    items.forEach((item) => {
      initialStates[item.order_item_id] = {
        order_item_id: item.order_item_id,
        rating: 5,
        review_content: "",
        has_review: item.has_review,
        media: [],
        isEditing: false,
        uploading: false,
      };
    });
    setReviewStates(initialStates);

    // Expand the first item automatically
    if (items.length > 0) {
      const firstUnreviewed = items.find((item) => !item.has_review);
      const itemToExpand = firstUnreviewed || items[0];
      setExpandedItemId(itemToExpand.order_item_id);
      if (itemToExpand.has_review) {
        fetchExistingReview(itemToExpand);
      }
    }
  }, [items]);

  const handleCardClick = (item: AccountOrderItem) => {
    if (expandedItemId === item.order_item_id) {
      setExpandedItemId(null);
    } else {
      setExpandedItemId(item.order_item_id);
      // Fetch details if it already has a review
      if (item.has_review || reviewStates[item.order_item_id]?.has_review) {
        fetchExistingReview(item);
      }
    }
  };

  const handleRatingChange = (itemId: number, rating: number) => {
    setReviewStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        rating,
      },
    }));
  };

  const handleContentChange = (itemId: number, content: string) => {
    setReviewStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        review_content: content,
      },
    }));
  };

  const handleReset = (itemId: number) => {
    setReviewStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        rating: 5,
        review_content: "",
        media: [],
      },
    }));
  };

  const handleCancelEdit = (item: AccountOrderItem) => {
    // Re-fetch original review to cancel edits
    fetchExistingReview(item);
  };

  // Handle uploading review media files
  const handleFileUpload = async (
    itemId: number,
    e: React.ChangeEvent<HTMLInputElement>,
    type: "IMAGE" | "VIDEO"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset target value so selection event triggers next time
    e.target.value = "";

    const currentState = reviewStates[itemId];
    const imageCount = currentState?.media.filter((m) => m.media_type === "IMAGE").length || 0;
    const videoCount = currentState?.media.filter((m) => m.media_type === "VIDEO").length || 0;

    // File validation
    if (type === "IMAGE") {
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn tệp tin hình ảnh (.jpg, .png, .webp...)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Dung lượng ảnh tối đa là 5MB.");
        return;
      }
      if (imageCount >= 5) {
        alert("Bạn đã tải lên tối đa 5 hình ảnh.");
        return;
      }
    } else {
      if (!file.type.startsWith("video/")) {
        alert("Vui lòng chọn tệp tin video (.mp4, .mov...)");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert("Dung lượng video tối đa là 20MB.");
        return;
      }
      if (videoCount >= 1) {
        alert("Bạn đã tải lên tối đa 1 video.");
        return;
      }
    }

    // Set uploading state
    setReviewStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        uploading: true,
      },
    }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/reviews/media", {
        method: "POST",
        body: formData,
      });

      const payload = await res.json();
      if (payload.success && payload.data) {
        const newMedia: ReviewMedia = {
          media_id: payload.data.media_id,
          public_url: payload.data.public_url,
          media_type: payload.data.media_type,
        };

        setReviewStates((prev) => ({
          ...prev,
          [itemId]: {
            ...prev[itemId],
            media: [...(prev[itemId]?.media || []), newMedia],
            uploading: false,
          },
        }));
      } else {
        alert(payload.message || "Tải lên tệp tin thất bại.");
        setReviewStates((prev) => ({
          ...prev,
          [itemId]: {
            ...prev[itemId],
            uploading: false,
          },
        }));
      }
    } catch (err) {
      console.error("Lỗi khi tải file lên API:", err);
      alert("Đã xảy ra lỗi kết nối khi tải file.");
      setReviewStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          uploading: false,
        },
      }));
    }
  };

  const handleRemoveMedia = (itemId: number, mediaId: number) => {
    setReviewStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        media: (prev[itemId]?.media || []).filter((m) => m.media_id !== mediaId),
      },
    }));
  };

  const handleSubmitReview = async (item: AccountOrderItem) => {
    const state = reviewStates[item.order_item_id];
    if (!state || !item.product_slug) return;

    setSubmitError(null);
    setSubmittingItemId(item.order_item_id);

    try {
      const res = await fetch(`/api/v1/product-lines/${item.product_slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_item_id: item.order_item_id,
          rating: state.rating,
          review_content: state.review_content,
          media_ids: state.media.map((m) => m.media_id),
        }),
      });

      const payload = await res.json();
      if (payload.success) {
        setReviewStates((prev) => ({
          ...prev,
          [item.order_item_id]: {
            ...prev[item.order_item_id],
            has_review: true,
            isEditing: false,
          },
        }));
        // Collapse expanded item
        setExpandedItemId(null);
      } else {
        setSubmitError(payload.message || "Không thể lưu đánh giá.");
      }
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      setSubmitError("Lỗi kết nối mạng, vui lòng thử lại sau.");
    } finally {
      setSubmittingItemId(null);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[4px] transition-opacity duration-300">
        <div className="relative w-[90%] max-w-[400px] overflow-hidden rounded-[20px] bg-white p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-black/5 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-inner">
            <svg
              className="h-10 w-10 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-[20px] font-extrabold text-black leading-tight">
            Đánh giá thành công!
          </h3>
          <p className="mt-2.5 text-[14px] font-light text-black/60 leading-relaxed">
            Cảm ơn bạn đã chia sẻ những phản hồi giá trị về sản phẩm cho Xéo Xọ.
          </p>

          <div className="absolute bottom-0 left-0 h-[3px] bg-[#cf5c43] progress-bar-shrink" style={{ width: '100%' }} />
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes shrink {
              from { width: 100%; }
              to { width: 0%; }
            }
            .progress-bar-shrink {
              animation: shrink 2s linear forwards;
            }
          `}} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[4px]">
      <div className="flex h-full max-h-[90vh] w-full max-w-[720px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5 md:px-8">
          <h2 className="text-[24px] font-extrabold leading-none text-black">
            Đánh giá sản phẩm
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-foreground transition-colors hover:bg-muted"
            aria-label="Đóng"
          >
            <span className="text-[24px] leading-none">×</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 space-y-5">
          {submitError && (
            <div className="rounded-[10px] bg-rose-50 border border-rose-100 p-4 text-[13px] text-rose-600 font-medium">
              {submitError}
            </div>
          )}

          {items.map((item) => {
            const state = reviewStates[item.order_item_id] || {
              rating: 5,
              review_content: "",
              has_review: item.has_review,
              media: [],
              isEditing: false,
              uploading: false,
            };
            const isExpanded = expandedItemId === item.order_item_id;
            const isSubmitting = submittingItemId === item.order_item_id;
            const isReadOnly = state.has_review && !state.isEditing;

            const imageCount = state.media.filter((m) => m.media_type === "IMAGE").length;
            const videoCount = state.media.filter((m) => m.media_type === "VIDEO").length;

            return (
              <div
                key={item.order_item_id}
                className={cn(
                  "overflow-hidden rounded-[14px] border transition-all duration-300",
                  isExpanded
                    ? "border-black shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                    : "border-black/10 hover:border-black/30"
                )}
              >
                {/* Product Card Header Summary */}
                <button
                  type="button"
                  onClick={() => handleCardClick(item)}
                  className="flex w-full items-center justify-between gap-4 bg-white p-4 text-left transition-colors hover:bg-slate-50/50"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[8px] border border-black/5 bg-secondary">
                      <Image
                        src={item.image_src}
                        alt={item.image_alt || item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-[15px] font-bold text-black leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[12px] text-black/50 mt-1 font-light leading-none">
                        {item.subtitle}
                      </p>
                      <p className="text-[12px] text-black/70 mt-1 font-light leading-none">
                        x {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {state.has_review ? (
                      <span className="rounded-[4px] bg-black px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider leading-none">
                        Đã đánh giá
                      </span>
                    ) : null}
                    <span className="text-[14px] font-bold text-black leading-none">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </button>

                {/* Expanded Rating/Feedback Form */}
                {isExpanded && (
                  <div className="border-t border-black/10 bg-[#fafafa] p-4 md:p-6 space-y-4">
                    {state.isLoadingExisting ? (
                      <div className="py-6 text-center text-[13px] font-light text-black/50">
                        Đang tải đánh giá cũ...
                      </div>
                    ) : isReadOnly ? (
                      <>
                        {/* Read-Only view of rating, comments, and media */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const starVal = i + 1;
                              const isSelected = starVal <= state.rating;
                              return (
                                <svg
                                  key={i}
                                  width={24}
                                  height={24}
                                  className={cn(
                                    "fill-current",
                                    isSelected ? "text-black" : "text-slate-200"
                                  )}
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className="text-[13px] font-semibold text-black">
                            Bình luận đã gửi:
                          </span>
                          <p className="rounded-[8px] border border-black/5 bg-white p-4 text-[13px] font-light italic leading-relaxed text-black/80">
                            {state.review_content || "(Không có nội dung bình luận)"}
                          </p>
                        </div>

                        {/* Read-only media display */}
                        {state.media && state.media.length > 0 && (
                          <div className="flex flex-col gap-2">
                            <span className="text-[13px] font-semibold text-black">
                              Ảnh và video đã đính kèm:
                            </span>
                            <div className="flex flex-wrap gap-3">
                              {state.media.map((m) => (
                                <div
                                  key={m.media_id}
                                  className="overflow-hidden rounded-[6px] border border-black/5 bg-white shadow-sm"
                                >
                                  {m.media_type === "IMAGE" ? (
                                    <a href={m.public_url} target="_blank" rel="noreferrer">
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
                          </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                          {state.is_edited ? (
                            <span className="text-[12px] font-light italic text-black/45">
                              Đánh giá này đã được chỉnh sửa và không thể chỉnh sửa thêm nữa.
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setReviewStates((prev) => ({
                                  ...prev,
                                  [item.order_item_id]: {
                                    ...prev[item.order_item_id],
                                    isEditing: true,
                                  },
                                }))
                              }
                              className="inline-flex min-h-[36px] items-center justify-center rounded-[6px] border border-black bg-white px-6 text-[13px] font-semibold text-black transition-colors hover:bg-black hover:text-white"
                            >
                              Chỉnh sửa đánh giá
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {state.has_review && (
                          <div className="rounded-[6px] bg-amber-50 border border-amber-200 p-3 mb-2 flex items-start gap-2">
                            <span className="text-[14px] leading-none select-none">⚠️</span>
                            <p className="text-[12px] text-amber-800 font-medium leading-normal">
                              Lưu ý: Đánh giá chỉ được chỉnh sửa duy nhất 1 lần. Sau khi gửi, bạn sẽ không thể chỉnh sửa thêm được nữa.
                            </p>
                          </div>
                        )}
                        {/* Star Rating Picker */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const starVal = i + 1;
                              const isSelected = starVal <= state.rating;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() =>
                                    handleRatingChange(item.order_item_id, starVal)
                                  }
                                  className="text-black transition-transform hover:scale-110 focus:outline-none"
                                >
                                  <svg
                                    width={32}
                                    height={32}
                                    className={cn(
                                      "fill-current transition-colors",
                                      isSelected ? "text-black" : "text-slate-300"
                                    )}
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Comment Textarea */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[13px] font-semibold text-black">
                            Bình luận:
                          </label>
                          <textarea
                            value={state.review_content}
                            onChange={(e) =>
                              handleContentChange(item.order_item_id, e.target.value)
                            }
                            placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm với người mua khác nhé."
                            className="min-h-[100px] w-full rounded-[8px] border border-black/15 bg-white p-3.5 text-[13px] font-light text-black outline-none placeholder:text-black/30 focus:border-black"
                          />
                        </div>

                        {/* Previews for Uploaded Media */}
                        {state.media && state.media.length > 0 && (
                          <div className="flex flex-col gap-2 pt-1">
                            <span className="text-[12px] font-semibold text-black/60">
                              Ảnh và video đã tải lên:
                            </span>
                            <div className="flex flex-wrap gap-3">
                              {state.media.map((m) => (
                                <div
                                  key={m.media_id}
                                  className="relative overflow-hidden rounded-[6px] border border-black/10 bg-white"
                                >
                                  {m.media_type === "IMAGE" ? (
                                    <img
                                      src={m.public_url}
                                      alt="Tải lên"
                                      className="h-[72px] w-[72px] object-cover"
                                    />
                                  ) : (
                                    <video
                                      src={m.public_url}
                                      className="h-[72px] w-[120px] object-cover"
                                      muted
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMedia(item.order_item_id, m.media_id)}
                                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-[12px] font-bold text-white transition-colors hover:bg-black"
                                    title="Xóa"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Media Upload Buttons */}
                        <div className="flex flex-wrap gap-2.5 pt-1">
                          <label
                            className={cn(
                              "inline-flex min-h-[32px] cursor-pointer items-center gap-2 rounded-[5px] border border-[#f57560]/30 bg-[#fff5f3] px-3.5 text-[11px] font-semibold text-[#f57560] transition-colors hover:bg-[#ffece8]",
                              imageCount >= 5 && "opacity-50 cursor-not-allowed hover:bg-[#fff5f3]",
                              state.uploading && "pointer-events-none opacity-50"
                            )}
                          >
                            <Image
                              src="/icons/camera.svg"
                              alt="Camera Icon"
                              width={16}
                              height={16}
                              className="shrink-0"
                            />
                            Thêm ảnh ({imageCount}/5)
                            <input
                              type="file"
                              accept="image/*"
                              disabled={imageCount >= 5 || state.uploading}
                              onChange={(e) => handleFileUpload(item.order_item_id, e, "IMAGE")}
                              className="hidden"
                            />
                          </label>

                          <label
                            className={cn(
                              "inline-flex min-h-[32px] cursor-pointer items-center gap-2 rounded-[5px] border border-[#f57560]/30 bg-[#fff5f3] px-3.5 text-[11px] font-semibold text-[#f57560] transition-colors hover:bg-[#ffece8]",
                              videoCount >= 1 && "opacity-50 cursor-not-allowed hover:bg-[#fff5f3]",
                              state.uploading && "pointer-events-none opacity-50"
                            )}
                          >
                            <Image
                              src="/icons/video.svg"
                              alt="Video Icon"
                              width={22}
                              height={16}
                              className="shrink-0"
                            />
                            Thêm video ({videoCount}/1)
                            <input
                              type="file"
                              accept="video/*"
                              disabled={videoCount >= 1 || state.uploading}
                              onChange={(e) => handleFileUpload(item.order_item_id, e, "VIDEO")}
                              className="hidden"
                            />
                          </label>

                          {state.uploading && (
                            <span className="text-[11px] font-medium text-[#f57560] self-center animate-pulse">
                              Đang tải file lên...
                            </span>
                          )}
                        </div>


                      </>
                    )}
                  </div>
                )}

                {/* Collapsed view showing edit option for completed reviews */}
                {!isExpanded && state.has_review && (
                  <div className="border-t border-black/5 bg-[#fafafa] px-4 py-2.5 flex items-center justify-end gap-4 text-[12px] text-black">
                    {!state.is_edited && (
                      <button
                        type="button"
                        onClick={() =>
                          setReviewStates((prev) => ({
                            ...prev,
                            [item.order_item_id]: {
                              ...prev[item.order_item_id],
                              isEditing: true,
                            },
                          }))
                        }
                        className="font-light text-black/55 hover:text-black underline underline-offset-2"
                      >
                        Sửa
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCardClick(item)}
                      className="rounded-[4px] border border-black/20 bg-white px-4 py-1.5 font-medium transition-colors hover:bg-slate-50"
                    >
                      Xem lại đánh giá
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        {(() => {
          const allReviewedAndNotEditing = items.every((item) => {
            const state = reviewStates[item.order_item_id];
            return state && state.has_review && !state.isEditing;
          });

          return (
            <div className="flex items-center justify-end gap-4 border-t border-black/10 px-6 py-5 md:px-8">
              {allReviewedAndNotEditing ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-[44px] min-w-[140px] items-center justify-center rounded-[5px] border border-black bg-cover bg-center px-6 text-center text-[15px] font-bold text-white shadow-[0_8px_18px_rgba(207,92,67,0.18)] transition-opacity hover:opacity-90"
                  style={{ backgroundImage: "url('/images/button_background.png')" }}
                >
                  Đóng
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[44px] px-6 text-[15px] font-medium text-black/70 hover:text-black transition-colors"
                  >
                    Trở lại
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingAll}
                    onClick={handleFinish}
                    className="flex min-h-[44px] min-w-[140px] items-center justify-center rounded-[5px] border border-black bg-cover bg-center px-6 text-center text-[15px] font-bold text-white shadow-[0_8px_18px_rgba(207,92,67,0.18)] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-wait"
                    style={{ backgroundImage: "url('/images/button_background.png')" }}
                  >
                    {isSubmittingAll ? "Đang gửi..." : "Hoàn thành"}
                  </button>
                </>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
