"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CancelOrderButton } from "@/components/molecules/CancelOrderButton";
import { ProductReviewModal } from "@/components/organisms/ProductReviewModal/ProductReviewModal";
import { ROUTES } from "@/constants/routes";
import { getOrderStatusPresentation } from "@/features/order/order-history";
import { openChatForOrder } from "@/lib/chat-events";
import { cn, formatPrice } from "@/lib/utils";
import type { AccountOrderDetail } from "@/types/account-order.types";

type CancelOrderContext = {
  contact: string;
  contactType: "email" | "phone";
  source: "lookup" | "account";
};

type OrderDetailContentProps = {
  allowCancel?: boolean;
  backHref?: string;
  cancelContext?: CancelOrderContext;
  customer?: {
    customer_name: string | null;
    phone: string | null;
  };
  customerName?: string | null;
  customerPhone?: string | null;
  onOrderCancelled?: () => void | Promise<void>;
  order: AccountOrderDetail;
  showBackLink?: boolean;
};

function formatDateTime(dateStr?: string | null): string | null {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  const pad = (num: number) => String(num).padStart(2, "0");

  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(
    date.getDate(),
  )}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function getCancelledOrderMessage(order: AccountOrderDetail) {
  if (order.payment_status.toUpperCase() === "REFUNDED") {
    return "Đơn hàng này đã bị hủy và đã hoàn tiền thành công.";
  }

  if (["PENDING", "PROCESSING"].includes(order.refund_status ?? "")) {
    return "Đơn hàng này đã bị hủy. Hệ thống đang xử lý hoàn tiền cho bạn.";
  }

  if (["FAILED", "CANCELLED"].includes(order.refund_status ?? "")) {
    return "Đơn hàng này đã bị hủy, nhưng hoàn tiền đang gặp vấn đề. Vui lòng liên hệ hỗ trợ.";
  }

  return "Đơn hàng này đã bị hủy bỏ.";
}

export function OrderDetailContent({
  allowCancel = true,
  backHref,
  cancelContext,
  customer,
  customerName,
  customerPhone,
  onOrderCancelled,
  order,
  showBackLink = true,
}: OrderDetailContentProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const status = getOrderStatusPresentation(order.order_status);
  const isCompleted = status.filter === "completed";
  const isCancelled = status.filter === "cancelled";
  const isReturned = status.filter === "returned";
  const isShipping =
    status.filter === "shipping" ||
    status.filter === "pending" ||
    status.filter === "confirmed";
  const canCancel =
    allowCancel &&
    ["PENDING", "CONFIRMED", "PACKING"].includes(
      order.order_status.toUpperCase(),
    );
  const canReturn = ["SHIPPING", "COMPLETED", "RETURNED"].includes(
    order.order_status.toUpperCase(),
  );

  const orderDate = new Date(order.created_at);
  const deadlineDate = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const deadlineStr = `${deadlineDate.getDate()}-${deadlineDate.getMonth() + 1}-${deadlineDate.getFullYear()}`;

  const step1Time = formatDateTime(order.created_at);
  const step2Time = formatDateTime(order.shipping?.shipped_at);
  const step3Time = formatDateTime(order.shipping?.delivered_at);
  const step4Time = formatDateTime(order.shipping?.delivered_at);
  const normalizedOrderStatus = order.order_status.toUpperCase();
  const baseActiveStepIndex =
    isCancelled || normalizedOrderStatus === "PENDING"
      ? -1
      : normalizedOrderStatus === "RETURNED"
        ? 3
        : normalizedOrderStatus === "COMPLETED"
          ? 2
          : normalizedOrderStatus === "SHIPPING"
            ? 1
            : 0;
  const shouldShowReturnedStep = normalizedOrderStatus === "RETURNED";
  const timelineSteps = [
    {
      label: "Xác nhận thông tin",
      time: step1Time,
      icon: "/icons/chi-tiet-don-hang/xac-nhan-thong-tin.svg",
    },
    {
      label: "Đã giao cho ĐVVC",
      time: step2Time,
      icon: "/icons/chi-tiet-don-hang/da-giao-dvvc.svg",
    },
    {
      label: "Đã nhận hàng",
      time: step3Time,
      icon: "/icons/chi-tiet-don-hang/da-nhan-hang.svg",
    },
    ...(shouldShowReturnedStep
      ? [
          {
            label: "Đã hoàn trả",
            time: step4Time,
            icon: "/icons/chi-tiet-don-hang/hoan-tra-hang.svg",
          },
        ]
      : []),
  ];
  const activeStepIndex = Math.min(
    baseActiveStepIndex,
    timelineSteps.length - 1,
  );
  const progressWidth = `${Math.max(activeStepIndex, 0) * (100 / Math.max(timelineSteps.length - 1, 1))}%`;
  const resolvedCustomerName =
    order.shipping?.recipient_name ??
    customer?.customer_name ??
    customerName ??
    "Chưa cập nhật";
  const resolvedCustomerPhone =
    order.shipping?.recipient_phone ??
    customer?.phone ??
    customerPhone ??
    "Chưa cập nhật SĐT";

  return (
    <div className="overflow-hidden rounded-xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.16)] md:p-8">
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
        {showBackLink ? (
          <Link
            href={backHref ?? ROUTES.ACCOUNT_ORDERS}
            className="inline-flex items-center gap-2 text-[13px] font-light text-black underline underline-offset-2 transition-opacity hover:opacity-75"
          >
            <span
              aria-hidden="true"
              className="h-4 w-4 rotate-45 border-b-2 border-l-2 border-black"
            />
            Trở lại
          </Link>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center gap-3 text-[14px] text-black">
          <span className="font-light">Mã đơn hàng:</span>
          <span className="font-light">{order.order_code}</span>
          <span className="text-black/30">|</span>
          <span
            className={cn(
              "font-light",
              isCompleted && "text-[#ff593d]",
              isShipping && "text-[#ff593d]",
              isCancelled && "text-black/50",
              isReturned && "text-[#b46d1f]",
            )}
          >
            Đơn hàng {status.label.toLowerCase()}
          </span>
        </div>
      </div>

      <div className="mt-7 overflow-x-auto px-1 pb-7 md:px-2">
        <div className="relative mx-auto flex min-w-[620px] max-w-[860px] items-start justify-between pt-2">
          <div
            className={cn(
              "absolute top-[24px] h-[2px] bg-black/10",
              shouldShowReturnedStep
                ? "left-[calc(12.5%+22px)] right-[calc(12.5%+22px)]"
                : "left-[calc(16.666%+22px)] right-[calc(16.666%+22px)]",
            )}
            aria-hidden="true"
          >
            <div
              className="h-full bg-[#ff593d] transition-all duration-500"
              style={{ width: activeStepIndex < 0 ? "0%" : progressWidth }}
            />
          </div>

          {timelineSteps.map((step, index) => {
            const active = activeStepIndex >= index;
            const isReturnedStep = step.label === "Đã hoàn trả";

            return (
              <div
                key={step.label}
                className="relative z-10 flex flex-1 flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border-[2px] transition-colors duration-300",
                    active
                      ? isReturnedStep
                        ? "border-[#ff593d] bg-[#ff593d] text-white"
                        : "border-[#ff593d] bg-white text-[#ff593d]"
                      : "border-black/10 bg-white text-black/30",
                  )}
                >
                  <Image
                    src={step.icon}
                    alt=""
                    width={24}
                    height={24}
                    className={cn(
                      "h-5 w-auto",
                      active
                        ? isReturnedStep
                          ? "brightness-0 invert"
                          : ""
                        : "opacity-30 grayscale",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "mt-2 min-h-[16px] text-[11px] font-normal leading-tight",
                    active ? "text-black" : "text-black/40",
                  )}
                >
                  {step.label}
                </span>
                {step.time ? (
                  <span className="mt-0.5 text-[10px] font-normal leading-tight text-black/70">
                    {step.time}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="-mx-6 mt-2 flex flex-col gap-6 bg-[#fffdf7] px-6 py-7 md:-mx-8 md:flex-row md:items-start md:justify-between md:px-8">
        <p className="max-w-[620px] text-[11px] font-light leading-relaxed text-black/85 md:pt-2">
          {isCompleted
            ? `Nếu đơn hàng có vấn đề, bạn có thể liên hệ hỗ trợ trước ngày ${deadlineStr}.`
            : isCancelled
              ? getCancelledOrderMessage(order)
              : "Đơn hàng của bạn đang được xử lý hoặc vận chuyển."}
        </p>

        <div className="flex w-full flex-col gap-2 md:w-[168px]">
          {canCancel ? (
            <CancelOrderButton
              cancelContext={cancelContext}
              onCancelled={onOrderCancelled}
              orderId={order.order_id}
              orderCode={order.order_code}
            />
          ) : null}
          {isCompleted ? (
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="flex min-h-[26px] w-full items-center justify-center rounded-[2px] border border-black bg-cover bg-center px-4 text-center text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(207,92,67,0.18)] transition-opacity hover:opacity-90"
              style={{ backgroundImage: "url('/images/button_background.png')" }}
            >
              {order.items.every((item) => item.has_review)
                ? "Xem đánh giá"
                : "Đánh giá"}
            </button>
          ) : null}
          {!isCancelled && !isReturned ? (
            <button
              type="button"
              onClick={() =>
                openChatForOrder({
                  orderCode: order.order_code,
                  statusLabel: status.label,
                  totalLabel: formatPrice(order.total_amount),
                })
              }
              className="flex min-h-[26px] items-center justify-center rounded-[2px] border border-black bg-transparent text-[11px] font-medium text-black transition-colors hover:bg-black hover:text-white"
            >
              Liên hệ hỗ trợ
            </button>
          ) : null}
          {canReturn ? (
            <Link
              href={ROUTES.POLICY("return")}
              className="flex min-h-[26px] items-center justify-center rounded-[2px] border border-black bg-transparent text-[11px] font-medium text-black transition-colors hover:bg-black hover:text-white"
            >
              {isCompleted ? "Đổi trả" : "Chính sách đổi trả"}
            </Link>
          ) : null}
          {isCompleted && order.items[0]?.product_slug ? (
            <Link
              href={ROUTES.PRODUCT(order.items[0].product_slug)}
              className="flex min-h-[26px] items-center justify-center rounded-[2px] border border-black bg-transparent text-[11px] font-medium text-black transition-colors hover:bg-black hover:text-white"
            >
              Mua lại
            </Link>
          ) : null}
        </div>
      </div>

      <div className="-mx-6 h-[3px] overflow-hidden md:-mx-8">
        <div className="flex h-full w-[130%] -translate-x-8">
          {Array.from({ length: 14 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "mx-1 h-full flex-1 -skew-x-[28deg]",
                index % 2 === 0 ? "bg-[#8bbbed]" : "bg-[#f28ea0]",
              )}
            />
          ))}
        </div>
      </div>

      <div className="-mx-6 grid gap-8 bg-[#fffdf7] px-6 py-5 md:-mx-8 md:grid-cols-[1fr_280px] md:px-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-[18px] font-bold text-black">Địa Chỉ Nhận Hàng</h3>
          <p className="text-[15px] font-bold text-black">{resolvedCustomerName}</p>
          <p className="text-[13px] text-black/80">{resolvedCustomerPhone}</p>
          <p className="max-w-[620px] text-[13px] leading-relaxed text-black/75">
            {order.shipping
              ? [
                  order.shipping.address_detail,
                  order.shipping.district_name,
                  order.shipping.province_name,
                ]
                  .filter(Boolean)
                  .join(", ")
              : "Chưa cập nhật địa chỉ giao hàng."}
          </p>
        </div>

        <div className="flex flex-col text-left md:items-end md:text-right">
          <div className="w-full">
            <h3 className="sr-only">Vận chuyển</h3>
            {["SHIPPING", "COMPLETED", "RETURNED"].includes(
              order.order_status.toUpperCase(),
            ) ? (
              <>
                <p className="text-[13px] font-light text-black/45">
                  {order.shipping?.shipping_provider || "Giao hàng tiết kiệm"}
                </p>
                {order.shipping?.tracking_code ? (
                  <p className="mt-1 text-[13px] font-light text-black/45">
                    {order.shipping.tracking_code}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-0 bg-white">
        <div className="divide-y divide-black/10 border-y border-black/10">
          {order.items.map((item) => (
            <div
              key={item.order_item_id}
              className="flex items-center justify-between gap-6 py-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-5">
                <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden border border-black/5 bg-secondary">
                  <Image
                    src={item.image_src}
                    alt={item.image_alt || item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                  <p className="truncate text-[15px] font-semibold leading-[1.2] text-black">
                    {item.title}
                  </p>
                  <p className="text-[13px] font-light text-black/70">
                    {item.subtitle}
                  </p>
                  <p className="text-[13px] font-light text-black">
                    x {item.quantity}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right text-[13px] font-semibold text-black">
                {formatPrice(item.price)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ml-auto mt-7 flex max-w-[460px] flex-col gap-0 bg-white">
        <div className="flex justify-between border-b border-black/10 py-2 text-[13px] text-black/70">
          <span className="font-light">Tạm tính</span>
          <span className="font-medium text-black">
            {formatPrice(order.total_amount - order.shipping_fee)}
          </span>
        </div>

        <div className="flex justify-between border-b border-black/10 py-2 text-[13px] text-black/70">
          <span className="font-light">Voucher ưu đãi</span>
          <span className="font-medium text-black">
            -{formatPrice(order.reward_discount_amount)}
          </span>
        </div>

        <div className="flex justify-between border-b border-black/10 py-2 text-[13px] text-black/70">
          <span className="font-light">Phí giao hàng</span>
          <span className="font-medium text-black">
            {order.shipping_fee > 0
              ? formatPrice(order.shipping_fee)
              : "Miễn phí"}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4">
          <span className="text-[13px] font-light text-black">Thành tiền</span>
          <span className="text-[20px] font-extrabold text-[#ff593d]">
            {formatPrice(order.total_amount)}
          </span>
        </div>
      </div>

      <div
        className="-mx-6 mt-8 h-[7px] bg-[url('/images/chi-tiet-don-hang-border-bottom.png')] bg-cover bg-center bg-repeat-x md:-mx-8"
        aria-hidden="true"
      />

      {isReviewModalOpen ? (
        <ProductReviewModal
          orderCode={order.order_code}
          items={order.items}
          onClose={() => setIsReviewModalOpen(false)}
          onFinished={() => {
            setIsReviewModalOpen(false);
            window.location.reload();
          }}
        />
      ) : null}
    </div>
  );
}
