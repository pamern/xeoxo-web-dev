import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { CancelOrderButton } from "@/components/molecules/CancelOrderButton";
import { ROUTES } from "@/constants/routes";
import { getOrderStatusPresentation } from "@/features/order/order-history";
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
  allowCancel = false,
  backHref,
  cancelContext,
  customerName,
  customerPhone,
  onOrderCancelled,
  order,
  showBackLink = true,
}: OrderDetailContentProps) {
  const status = getOrderStatusPresentation(order.order_status);
  const isCompleted = status.filter === "completed";
  const isCancelled = status.filter === "cancelled";
  const isReturned = status.filter === "returned";
  const isShipping = status.filter === "shipping";
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

  const isStep1Active = !["PENDING", "CANCELLED"].includes(
    order.order_status.toUpperCase(),
  );
  const isStep2Active = ["SHIPPING", "COMPLETED"].includes(
    order.order_status.toUpperCase(),
  );
  const isStep3Active = order.order_status.toUpperCase() === "COMPLETED";
  const isStep4Active = order.order_status.toUpperCase() === "RETURNED";

  const progressWidth = isStep4Active
    ? "90%"
    : isStep3Active
      ? "60%"
      : isStep2Active
        ? "30%"
        : "0%";

  const steps = [
    {
      active: isStep1Active,
      icon: "/icons/event.svg",
      label: "Xác nhận thông tin",
      time: formatDateTime(order.created_at),
    },
    {
      active: isStep2Active,
      icon: "/icons/freeship.svg",
      label: "Đã giao cho ĐVVC",
      time: formatDateTime(order.shipping?.shipped_at),
    },
    {
      active: isStep3Active,
      icon: "/icons/home.svg",
      label: "Đã nhận hàng",
      time: formatDateTime(order.shipping?.delivered_at),
    },
    {
      active: isStep4Active,
      icon: "/icons/like.svg",
      label: "Đã hoàn trả",
      time: formatDateTime(order.shipping?.delivered_at),
    },
  ];

  return (
    <div className="rounded-[26px] bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.12)] md:p-[40px]">
      <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-center">
        {showBackLink && backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-[18px] font-medium text-black transition-opacity hover:opacity-75"
          >
            <span className="text-[20px] font-bold">〈</span> Trở lại
          </Link>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center gap-3 text-[18px] text-black">
          <span className="font-light">Mã đơn hàng:</span>
          <span className="font-semibold">{order.order_code}</span>
          <span className="text-black/30">|</span>
          <span
            className={cn(
              "font-semibold",
              isCompleted && "text-black",
              isShipping && "text-[#ff593d]",
              isCancelled && "text-black/50",
              isReturned && "text-[#b46d1f]",
            )}
          >
            Đơn hàng {status.label.toLowerCase()}
          </span>
        </div>
      </div>

      <div className="mt-8 border-b border-black/10 px-4 pb-8">
        <div className="relative mx-auto flex w-full max-w-[800px] items-start justify-between">
          <div className="absolute left-[5%] right-[5%] top-[28px] -z-10 h-[3px] bg-black/10" />
          <div
            className="absolute left-[5%] top-[28px] -z-10 h-[3px] bg-[#ff593d] transition-all duration-500"
            style={{ width: progressWidth }}
            aria-hidden="true"
          />

          {steps.map((step) => (
            <div
              key={step.label}
              className="flex flex-1 flex-col items-center gap-2 text-center"
            >
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full border-2 bg-white transition-colors duration-300",
                  step.active
                    ? "border-[#ff593d] text-[#ff593d]"
                    : "border-black/10 text-black/30",
                )}
              >
                <Image
                  src={step.icon}
                  alt=""
                  width={24}
                  height={24}
                  className={cn(
                    "h-6 w-auto",
                    step.active
                      ? "brightness-0 saturate-100 invert-[41%] sepia-[90%] saturate-[2808%] hue-rotate-[344deg] brightness-[101%] contrast-[101%]"
                      : "opacity-30",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-sm font-semibold leading-tight",
                  step.active ? "text-black" : "text-black/40",
                )}
              >
                {step.label}
              </span>
              {step.time ? (
                <span className="text-[12px] font-light text-black/60">
                  {step.time}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6 rounded-xl border border-[#f5ebe0] bg-[#fffcf6] p-6 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[500px] text-sm font-light leading-relaxed text-black/85">
          {isCompleted
            ? `Nếu đơn hàng có vấn đề, bạn có thể liên hệ hỗ trợ trước ngày ${deadlineStr}.`
            : isCancelled
              ? getCancelledOrderMessage(order)
              : "Đơn hàng của bạn đang được xử lý hoặc vận chuyển."}
        </p>

        <div className="flex min-w-[200px] flex-col gap-3">
          {canCancel ? (
            <CancelOrderButton
              cancelContext={cancelContext}
              onCancelled={onOrderCancelled}
              orderId={order.order_id}
              orderCode={order.order_code}
            />
          ) : null}
          {isCompleted ? (
            <Button
              href={ROUTES.PRODUCT(order.items[0]?.product_slug || "")}
              size="custom"
              variant="imagePill"
              backgroundImage="/images/button_background.png"
              className="min-h-[48px] w-full rounded-pill px-6 text-center text-[16px] font-bold text-white shadow-[0_10px_20px_rgba(207,92,67,0.2)]"
            >
              Đánh giá
            </Button>
          ) : null}
          {canReturn ? (
            <Link
              href={ROUTES.POLICY("return")}
              className="flex min-h-[44px] items-center justify-center rounded-pill border-2 border-black bg-white text-[15px] font-medium text-black transition-colors hover:bg-black hover:text-white"
            >
              Liên hệ hỗ trợ
            </Link>
          ) : null}
          {order.items[0]?.product_slug ? (
            <Link
              href={ROUTES.PRODUCT(order.items[0].product_slug)}
              className="flex min-h-[44px] items-center justify-center rounded-pill border-2 border-black bg-white text-[15px] font-medium text-black transition-colors hover:bg-black hover:text-white"
            >
              Mua lại
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex h-1.5 w-full overflow-hidden rounded-full">
        <div className="flex-1 bg-[#ff593d]" />
        <div className="flex-1 bg-[#a3cef1]" />
        <div className="flex-1 bg-[#f7b0a3]" />
        <div className="flex-1 bg-[#b7e4c7]" />
        <div className="flex-1 bg-[#ff593d]" />
        <div className="flex-1 bg-[#a3cef1]" />
      </div>

      <div className="mt-8 grid gap-8 rounded-xl border border-black/10 bg-white p-8 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="mb-2 border-b border-black/5 pb-2 text-[20px] font-bold text-black">
            Địa Chỉ Nhận Hàng
          </h3>
          <p className="text-[18px] font-bold text-black">
            {order.shipping?.recipient_name || customerName || "Chưa cập nhật"}
          </p>
          <p className="text-[16px] text-black/75">
            {order.shipping?.recipient_phone ||
              customerPhone ||
              "Chưa cập nhật SĐT"}
          </p>
          <p className="mt-1 text-[16px] leading-relaxed text-black/70">
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

        <div className="flex flex-col justify-between gap-4 text-left md:items-end md:text-right">
          <div className="w-full">
            <h3 className="mb-2 border-b border-black/5 pb-2 text-[20px] font-bold text-black md:text-right">
              Vận chuyển
            </h3>
            {["SHIPPING", "COMPLETED", "RETURNED"].includes(
              order.order_status.toUpperCase(),
            ) ? (
              <>
                <p className="text-[18px] font-medium text-black">
                  {order.shipping?.shipping_provider || "Giao hàng tiết kiệm"}
                </p>
                {order.shipping?.tracking_code ? (
                  <p className="mt-1 font-mono text-[15px] text-black/60">
                    Mã vận đơn: {order.shipping.tracking_code}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-[16px] font-light italic text-black/50 md:text-right">
                Chưa bàn giao đơn vị vận chuyển
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-black/10 bg-white">
        <div className="border-b border-black/10 bg-black/[0.02] px-6 py-4">
          <h3 className="text-[18px] font-bold text-black">
            Sản phẩm đơn hàng
          </h3>
        </div>
        <div className="divide-y divide-black/5 p-6">
          {order.items.map((item) => (
            <div
              key={item.order_item_id}
              className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 flex-1 items-center gap-[30px]">
                <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden border border-black/5 bg-secondary">
                  <Image
                    src={item.image_src}
                    alt={item.image_alt || item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                  <p className="truncate text-[20px] font-medium leading-[1.2] text-black">
                    {item.title}
                  </p>
                  <p className="text-[16px] font-extralight text-black/70">
                    {item.subtitle}
                  </p>
                  <p className="text-[16px] font-extralight text-black">
                    x {item.quantity}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right text-[18px] font-normal text-black">
                {formatPrice(item.price)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ml-auto mt-8 flex max-w-[500px] flex-col gap-4 rounded-xl border border-black/10 bg-white p-8">
        <div className="flex justify-between text-base text-black/70">
          <span className="font-light">Tạm tính</span>
          <span className="font-medium text-black">
            {formatPrice(order.total_amount - order.shipping_fee)}
          </span>
        </div>

        <div className="flex justify-between text-base text-black/70">
          <span className="font-light">Voucher ưu đãi</span>
          <span className="font-medium text-black">
            -{formatPrice(order.reward_discount_amount)}
          </span>
        </div>

        <div className="flex justify-between border-b border-black/5 pb-4 text-base text-black/70">
          <span className="font-light">Phí giao hàng</span>
          <span className="font-medium text-black">
            {order.shipping_fee > 0
              ? formatPrice(order.shipping_fee)
              : "Miễn phí"}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[18px] font-light text-black underline">
            Thành tiền
          </span>
          <span className="text-[30px] font-extrabold text-[#ff593d]">
            {formatPrice(order.total_amount)}
          </span>
        </div>
      </div>
    </div>
  );
}
