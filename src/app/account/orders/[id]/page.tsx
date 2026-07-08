import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import {
  AccountNavigation,
  type AccountNavItem,
} from "@/components/organisms/AccountNavigation/AccountNavigation";
import { PolicyClosingNote } from "@/components/organisms/PolicyClosingNote";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import {
  getAuthenticatedUser,
  getCustomerProfileByAccountId,
} from "@/features/auth/auth.service";
import { getCustomerOrderDetail } from "@/features/order/account-order.service";
import { getOrderStatusPresentation } from "@/features/order/order-history";
import { createClient } from "@/lib/supabase/server";
import { cn, formatPrice } from "@/lib/utils";
import { CancelOrderButton } from "@/components/molecules/CancelOrderButton";
import { Button } from "@/components/atoms/Button";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng",
  description: "Xem chi tiết thông tin và trạng thái đơn hàng của bạn.",
};

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  { label: "Hồ sơ thông tin", href: ROUTES.ACCOUNT_PROFILE },
  { label: "Lịch sử mua hàng", href: ROUTES.ACCOUNT_ORDERS },
  { label: "Quản lý lịch hẹn", href: ROUTES.ACCOUNT_APPOINTMENTS },
  { label: "Sổ địa chỉ", href: ROUTES.ACCOUNT_ADDRESSES },
  { label: "Đánh giá và phản hồi" },
  { label: "Câu hỏi thường gặp", href: ROUTES.FAQ_ACCOUNT },
  { label: "Đăng xuất", action: "logout" },
];

function formatDateTime(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const pad = (num: number) => String(num).padStart(2, "0");
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}.${month}.${year}`;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const orderId = Number(id);

  if (Number.isNaN(orderId)) {
    notFound();
  }

  const supabase = await createClient();
  const authenticatedUser = await getAuthenticatedUser(supabase);

  if (!authenticatedUser) {
    notFound();
  }

  const customer = await getCustomerProfileByAccountId(authenticatedUser.id);
  if (!customer?.customer_id) {
    notFound();
  }

  const order = await getCustomerOrderDetail(orderId, Number(customer.customer_id));
  if (!order) {
    notFound();
  }

  const status = getOrderStatusPresentation(order.order_status);
  const isCompleted = status.filter === "completed";
  const isCancelled = status.filter === "cancelled";
  const isReturned = status.filter === "returned";
  const isShipping = status.filter === "shipping";
  const canCancel = ["PENDING", "CONFIRMED", "PACKING"].includes(order.order_status.toUpperCase());
  const canReturn = ["SHIPPING", "COMPLETED", "RETURNED"].includes(order.order_status.toUpperCase());

  // Calculate return deadline (e.g. 7 days after delivery/order date)
  const orderDate = new Date(order.created_at);
  const deadlineDate = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const deadlineStr = `${deadlineDate.getDate()}-${deadlineDate.getMonth() + 1}-${deadlineDate.getFullYear()}`;

  // Calculate step active states
  const isStep1Active = !["PENDING", "CANCELLED"].includes(order.order_status.toUpperCase());
  const isStep2Active = ["SHIPPING", "COMPLETED"].includes(order.order_status.toUpperCase());
  const isStep3Active = order.order_status.toUpperCase() === "COMPLETED";
  const isStep4Active = order.order_status.toUpperCase() === "RETURNED";

  // Progress Bar Width
  const progressWidth = isStep4Active
    ? "90%"
    : isStep3Active
      ? "60%"
      : isStep2Active
        ? "30%"
        : "0%";

  // Timeline dates
  const step1Time = formatDateTime(order.created_at);
  const step2Time = formatDateTime(order.shipping?.shipped_at);
  const step3Time = formatDateTime(order.shipping?.delivered_at);
  const step4Time = formatDateTime(order.shipping?.delivered_at);

  return (
    <SiteLayout>
      <div className="bg-background">
        <section className="mx-auto w-full max-w-site px-6 pt-6 xl:px-[100px]">
          <Breadcrumbs
            items={[
              { label: "", href: ROUTES.HOME, iconSrc: "/icons/home.svg", iconAlt: "Trang chủ" },
              { label: "Lịch sử đơn hàng", href: ROUTES.ACCOUNT_ORDERS },
              { label: "Chi tiết đơn hàng" },
            ]}
          />
        </section>

        <section className="mx-auto w-full max-w-site px-6 py-10 xl:px-[100px]">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column: Sidebar (20%) */}
            <div className="w-full lg:w-1/5 shrink-0">
              <AccountNavigation items={ACCOUNT_NAV_ITEMS} activeHref={ROUTES.ACCOUNT_ORDERS} variant="account" />
            </div>

            {/* Right Column: Main Content (80%) */}
            <div className="flex-1">
              <div className="border border-black bg-white rounded-none p-6 md:p-[40px]">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
                  <Link
                    href={ROUTES.ACCOUNT_ORDERS}
                    className="inline-flex items-center gap-2 text-[18px] font-medium text-black transition-opacity hover:opacity-75"
                  >
                    <span className="text-[20px] font-bold">〈</span> Trở lại
                  </Link>

                  <div className="flex flex-wrap items-center gap-3 text-[18px] text-black">
                    <span className="font-light">Mã đơn hàng:</span>
                    <span className="font-semibold">{order.order_code}</span>
                    <span className="text-black/30">|</span>
                    <span className={cn(
                      "font-semibold",
                      isCompleted && "text-black",
                      isShipping && "text-[#ff593d]",
                      isCancelled && "text-black/50",
                      isReturned && "text-[#b46d1f]"
                    )}>
                      Đơn hàng {status.label.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="mt-8 px-4 pb-8 border-b border-black/10">
                  <div className="relative flex items-start justify-between w-full max-w-[800px] mx-auto">
                    {/* Progress Bar Line */}
                    <div className="absolute top-[28px] left-[5%] right-[5%] h-[3px] bg-black/10 -z-10" />
                    <div 
                      className="absolute top-[28px] left-[5%] h-[3px] bg-[#ff593d] -z-10 transition-all duration-500" 
                      style={{ 
                        width: progressWidth
                      }} 
                      aria-hidden="true"
                    />

                    {/* Step 1: Xác nhận thông tin */}
                    <div className="flex flex-col items-center text-center gap-2 flex-1">
                      <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-300",
                        isStep1Active ? "border-[#ff593d] text-[#ff593d]" : "border-black/10 text-black/30"
                      )}>
                        <Image 
                          src="/icons/event.svg" 
                          alt="" 
                          width={24} 
                          height={24} 
                          className={cn(
                            "h-6 w-auto",
                            isStep1Active 
                              ? "brightness-0 saturate-100 invert-[41%] sepia-[90%] saturate-[2808%] hue-rotate-[344deg] brightness-[101%] contrast-[101%]"
                              : "opacity-30"
                          )}
                        />
                      </div>
                      <span className={cn(
                        "text-sm font-semibold leading-tight",
                        isStep1Active ? "text-black" : "text-black/40"
                      )}>Xác nhận thông tin</span>
                      {step1Time && <span className="text-[12px] font-light text-black/60">{step1Time}</span>}
                    </div>

                    {/* Step 2: Đã giao cho ĐVVC */}
                    <div className="flex flex-col items-center text-center gap-2 flex-1">
                      <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-300",
                        isStep2Active 
                          ? "border-[#ff593d] text-[#ff593d]" 
                          : "border-black/10 text-black/30"
                      )}>
                        <Image 
                          src="/icons/freeship.svg" 
                          alt="" 
                          width={24} 
                          height={24} 
                          className={cn(
                            "h-6 w-auto",
                            isStep2Active
                              ? "brightness-0 saturate-100 invert-[41%] sepia-[90%] saturate-[2808%] hue-rotate-[344deg] brightness-[101%] contrast-[101%]"
                              : "opacity-30"
                          )} 
                        />
                      </div>
                      <span className={cn(
                        "text-sm font-semibold leading-tight",
                        isStep2Active ? "text-black" : "text-black/40"
                      )}>Đã giao cho ĐVVC</span>
                      {step2Time && <span className="text-[12px] font-light text-black/60">{step2Time}</span>}
                    </div>

                    {/* Step 3: Đã nhận hàng */}
                    <div className="flex flex-col items-center text-center gap-2 flex-1">
                      <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-300",
                        isStep3Active 
                          ? "border-[#ff593d] text-[#ff593d]" 
                          : "border-black/10 text-black/30"
                      )}>
                        <Image 
                          src="/icons/home.svg" 
                          alt="" 
                          width={24} 
                          height={24} 
                          className={cn(
                            "h-6 w-auto",
                            isStep3Active
                              ? "brightness-0 saturate-100 invert-[41%] sepia-[90%] saturate-[2808%] hue-rotate-[344deg] brightness-[101%] contrast-[101%]"
                              : "opacity-30"
                          )} 
                        />
                      </div>
                      <span className={cn(
                        "text-sm font-semibold leading-tight",
                        isStep3Active ? "text-black" : "text-black/40"
                      )}>Đã nhận hàng</span>
                      {step3Time && <span className="text-[12px] font-light text-black/60">{step3Time}</span>}
                    </div>

                    {/* Step 4: Đã hoàn trả */}
                    <div className="flex flex-col items-center text-center gap-2 flex-1">
                      <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-300",
                        isStep4Active 
                          ? "border-[#ff593d] text-[#ff593d]" 
                          : "border-black/10 text-black/30"
                      )}>
                        <Image 
                          src="/icons/like.svg" 
                          alt="" 
                          width={24} 
                          height={24} 
                          className={cn(
                            "h-6 w-auto",
                            isStep4Active
                              ? "brightness-0 saturate-100 invert-[41%] sepia-[90%] saturate-[2808%] hue-rotate-[344deg] brightness-[101%] contrast-[101%]"
                              : "opacity-30"
                          )} 
                        />
                      </div>
                      <span className={cn(
                        "text-sm font-semibold leading-tight",
                        isStep4Active ? "text-black" : "text-black/40"
                      )}>Đã hoàn trả</span>
                      {step4Time && <span className="text-[12px] font-light text-black/60">{step4Time}</span>}
                    </div>
                  </div>
                </div>

                {/* Info Text & Action Box */}
                <div className="mt-8 bg-[#fffcf6] rounded-xl border border-[#f5ebe0] p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <p className="text-sm font-light leading-relaxed text-black/85 max-w-[500px]">
                    {isCompleted ? (
                      `Nếu đơn hàng có vấn đề, bạn có thể liên hệ hỗ trợ trước ngày ${deadlineStr}.`
                    ) : isCancelled ? (
                      "Đơn hàng này đã bị hủy bỏ."
                    ) : (
                      "Đơn hàng của bạn đang được xử lý hoặc vận chuyển."
                    )}
                  </p>
                  
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    {canCancel && (
                      <CancelOrderButton orderId={orderId} orderCode={order.order_code} />
                    )}
                    {isCompleted && (
                      <Button
                        href={ROUTES.PRODUCT(order.items[0]?.product_slug || "")}
                        size="custom"
                        variant="imagePill"
                        backgroundImage="/images/button_background.png"
                        className="min-h-[48px] w-full rounded-pill px-6 text-center text-[16px] font-bold text-white shadow-[0_10px_20px_rgba(207,92,67,0.2)]"
                      >
                        Đánh giá
                      </Button>
                    )}
                    {canReturn && (
                      <Link
                        href={ROUTES.POLICY("return")}
                        className="flex min-h-[44px] items-center justify-center rounded-pill border-2 border-black bg-white text-[15px] font-medium text-black transition-colors hover:bg-black hover:text-white"
                      >
                        Liên hệ hỗ trợ
                      </Link>
                    )}
                    {order.items[0]?.product_slug && (
                      <Link
                        href={ROUTES.PRODUCT(order.items[0].product_slug)}
                        className="flex min-h-[44px] items-center justify-center rounded-pill border-2 border-black bg-white text-[15px] font-medium text-black transition-colors hover:bg-black hover:text-white"
                      >
                        Mua lại
                      </Link>
                    )}
                  </div>
                </div>

                {/* Decorative Color Strip */}
                <div className="mt-8 h-1.5 w-full flex rounded-full overflow-hidden">
                  <div className="flex-1 bg-[#ff593d]" />
                  <div className="flex-1 bg-[#a3cef1]" />
                  <div className="flex-1 bg-[#f7b0a3]" />
                  <div className="flex-1 bg-[#b7e4c7]" />
                  <div className="flex-1 bg-[#ff593d]" />
                  <div className="flex-1 bg-[#a3cef1]" />
                </div>

                {/* Address & Shipping Details */}
                <div className="mt-8 grid gap-8 md:grid-cols-2 bg-white rounded-xl border border-black/10 p-8">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[20px] font-bold text-black border-b border-black/5 pb-2 mb-2">Địa Chỉ Nhận Hàng</h3>
                    <p className="text-[18px] font-bold text-black">{order.shipping?.recipient_name || customer.customer_name}</p>
                    <p className="text-[16px] text-black/75">{order.shipping?.recipient_phone || customer.phone}</p>
                    <p className="text-[16px] leading-relaxed text-black/70 mt-1">
                      {order.shipping ? (
                        [
                          order.shipping.address_detail,
                          order.shipping.district_name,
                          order.shipping.province_name,
                        ].filter(Boolean).join(", ")
                      ) : (
                        "Chưa cập nhật địa chỉ giao hàng."
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end justify-between text-left md:text-right gap-4">
                    <div className="w-full">
                      <h3 className="text-[20px] font-bold text-black border-b border-black/5 pb-2 mb-2 md:text-right">Vận chuyển</h3>
                      {["SHIPPING", "COMPLETED", "RETURNED"].includes(order.order_status.toUpperCase()) ? (
                        <>
                          <p className="text-[18px] font-medium text-black">
                            {order.shipping?.shipping_provider || "Giao hàng tiết kiệm"}
                          </p>
                          {order.shipping?.tracking_code && (
                            <p className="text-[15px] text-black/60 mt-1 font-mono">
                              Mã vận đơn: {order.shipping.tracking_code}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-[16px] font-light text-black/50 italic md:text-right">
                          Chưa bàn giao đơn vị vận chuyển
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product List */}
                <div className="mt-8 border border-black/10 rounded-xl overflow-hidden bg-white">
                  <div className="px-6 py-4 bg-black/[0.02] border-b border-black/10">
                    <h3 className="text-[18px] font-bold text-black">Sản phẩm đơn hàng</h3>
                  </div>
                  <div className="p-6 divide-y divide-black/5">
                    {order.items.map((item, idx) => (
                      <div key={item.order_item_id} className={cn("py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-6")}>
                        <div className="flex items-center gap-[30px] min-w-0 flex-1">
                          <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden bg-secondary border border-black/5">
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

                        <div className="text-[18px] font-normal text-black shrink-0 text-right">
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="mt-8 border border-black/10 rounded-xl p-8 bg-white max-w-[500px] ml-auto flex flex-col gap-4">
                  <div className="flex justify-between text-base text-black/70">
                    <span className="font-light">Tạm tính</span>
                    <span className="font-medium text-black">{formatPrice(order.total_amount - order.shipping_fee)}</span>
                  </div>

                  <div className="flex justify-between text-base text-black/70">
                    <span className="font-light">Voucher ưu đãi</span>
                    <span className="font-medium text-black">-{formatPrice(order.reward_discount_amount)}</span>
                  </div>

                  <div className="flex justify-between text-base text-black/70 border-b border-black/5 pb-4">
                    <span className="font-light">Phí giao hàng</span>
                    <span className="font-medium text-black">
                      {order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : "Miễn phí"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[18px] font-light text-black underline">Thành tiền</span>
                    <span className="text-[30px] font-extrabold text-[#ff593d]">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PolicyClosingNote />
      </div>
    </SiteLayout>
  );
}
