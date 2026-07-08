"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
<<<<<<< HEAD
import { OrderDetailContent } from "@/components/organisms/OrderDetailContent";
import { ROUTES } from "@/constants/routes";
import { useOrderLookup } from "@/hooks/useOrderLookup";
=======
import { ROUTES } from "@/constants/routes";
import { getOrderStatusPresentation } from "@/features/order/order-history";
import { useOrderLookup } from "@/hooks/useOrderLookup";
import { cn, formatPrice } from "@/lib/utils";
>>>>>>> 50e92c7 (feat: frontend lookup order)
import type { OrderLookupValues } from "@/types/order-lookup.types";

type OrderLookupExperienceProps = {
  initialValues?: Partial<OrderLookupValues>;
};

<<<<<<< HEAD
function detectContactType(contact: string): "email" | "phone" {
  return contact.includes("@") ? "email" : "phone";
=======
function formatDateTime(dateStr?: string | null): string | null {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  const pad = (num: number) => String(num).padStart(2, "0");

  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(
    date.getDate(),
  )}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function buildSupportDeadline(dateStr?: string | null) {
  if (!dateStr) {
    return "khi hết hạn hỗ trợ";
  }

  const date = new Date(dateStr);
  date.setDate(date.getDate() + 7);
  const pad = (num: number) => String(num).padStart(2, "0");

  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
>>>>>>> 50e92c7 (feat: frontend lookup order)
}

const journeySteps = [
  {
    icon: "/icons/event.svg",
    label: "Xác nhận thông tin",
  },
  {
    icon: "/icons/freeship.svg",
    label: "Đã giao cho ĐVVC",
  },
  {
    icon: "/icons/home.svg",
    label: "Đã nhận hàng",
  },
  {
    icon: "/icons/like.svg",
    label: "Hoàn trả hàng",
  },
] as const;

export function OrderLookupExperience({
  initialValues,
}: OrderLookupExperienceProps) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<OrderLookupValues>({
    contact: initialValues?.contact ?? "",
    order_code: initialValues?.order_code ?? "",
  });
  const { errorMessage, hasSearched, isLoading, lookup, reset, result } =
    useOrderLookup(initialValues);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextValues = {
      contact: formValues.contact.trim(),
      order_code: formValues.order_code.trim(),
    };

    const query = new URLSearchParams(nextValues);
    router.replace(`${ROUTES.ORDER_LOOKUP}?${query.toString()}`, {
      scroll: false,
    });

    await lookup(nextValues);
  };

  const handleReset = () => {
    setFormValues({
      contact: "",
      order_code: "",
    });
    reset();
    router.replace(ROUTES.ORDER_LOOKUP, {
      scroll: false,
    });
  };

<<<<<<< HEAD
  const refreshLookupResult = async () => {
    const nextValues = {
      contact: formValues.contact.trim(),
      order_code: formValues.order_code.trim(),
    };

    await lookup(nextValues);
  };

  const inputBaseClass =
    "h-[62px] w-full rounded-[100px] border border-black bg-white px-[26px] py-5 text-[18px] font-light text-black outline-none transition-colors placeholder:text-black/50 focus:border-black md:px-[50px]";
  const primaryActionClass =
    "min-h-[59px] min-w-[250px] rounded-[100px] border border-black bg-black px-[60px] py-5 text-[20px] font-bold text-white transition hover:bg-white hover:text-black md:min-w-[306px] md:px-[100px] md:text-[22px]";
  const secondaryActionClass =
    "min-h-[59px] min-w-[250px] rounded-[100px] border border-black bg-white px-[60px] py-5 text-[20px] font-bold text-black transition hover:bg-black hover:text-white md:min-w-[306px] md:px-[100px] md:text-[22px]";

  const normalizedContact = formValues.contact.trim();
=======
  const status = result
    ? getOrderStatusPresentation(result.order_status)
    : null;
  const canSupport =
    result &&
    ["SHIPPING", "COMPLETED", "RETURNED"].includes(
      result.order_status.toUpperCase(),
    );
  const canReorder = Boolean(result?.items[0]?.product_slug);
  const isStep1Active =
    result &&
    !["PENDING", "CANCELLED"].includes(result.order_status.toUpperCase());
  const isStep2Active =
    result &&
    ["SHIPPING", "COMPLETED"].includes(result.order_status.toUpperCase());
  const isStep3Active =
    result && result.order_status.toUpperCase() === "COMPLETED";
  const isStep4Active =
    result && result.order_status.toUpperCase() === "RETURNED";
  const progressWidth = !result
    ? "0%"
    : isStep4Active
      ? "90%"
      : isStep3Active
        ? "60%"
        : isStep2Active
          ? "30%"
          : "0%";
  const detailCardClass = "border border-black bg-[#fffdf7]";
  const inputBaseClass =
    "h-[62px] w-full rounded-[100px] border border-black bg-white px-[26px] py-5 text-[18px] font-extralight text-black outline-none placeholder:text-black md:px-[50px]";
  const steps = [
    {
      ...journeySteps[0],
      active: Boolean(isStep1Active),
      time: formatDateTime(result?.created_at),
    },
    {
      ...journeySteps[1],
      active: Boolean(isStep2Active),
      time: formatDateTime(result?.shipping?.shipped_at),
    },
    {
      ...journeySteps[2],
      active: Boolean(isStep3Active),
      time: formatDateTime(result?.shipping?.delivered_at),
    },
    {
      ...journeySteps[3],
      active: Boolean(isStep4Active),
      time: formatDateTime(result?.shipping?.delivered_at),
    },
  ];
>>>>>>> 50e92c7 (feat: frontend lookup order)

  return (
    <div className="space-y-10">
      <section className="mx-auto max-w-[1529px]">
<<<<<<< HEAD
        <div className="bg-white p-6 md:p-[40px]">
          <div className="flex flex-col justify-between gap-4 pb-6 sm:flex-row sm:items-center">
            <div className="w-full space-y-3">
              <h1 className="text-[34px] font-bold leading-[1.24] text-black md:text-[44px]">
                Tra cứu đơn hàng
              </h1>
              <div
                aria-hidden="true"
                className="h-[5px] w-full bg-[length:100%_100%] bg-center bg-no-repeat"
                style={{ backgroundImage: "url(/images/header-line-up.png)" }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-0">
            <div className="grid gap-5 pb-8 lg:grid-cols-2 xl:gap-[50px]">
              <label className="space-y-[9px]">
                <span className="px-[10px] text-[15px] font-medium text-black">
=======
        <div className="space-y-0">
          <div className="space-y-5 px-0 pb-[30px] pt-5 md:px-[40px] md:pt-[50px] xl:px-[100px]">
            <h1 className="text-[34px] font-bold leading-[1.24] text-black md:text-[44px]">
              Tra cứu đơn hàng
            </h1>
            <div className="h-[10px] w-full bg-black" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="grid gap-5 px-0 pb-8 md:px-[60px] lg:grid-cols-2 xl:gap-[50px] xl:px-[150px] xl:pb-0">
              <label className="space-y-[9px]">
                <span className="px-[10px] text-[15px] font-normal text-black">
>>>>>>> 50e92c7 (feat: frontend lookup order)
                  Mã đơn hàng:
                </span>
                <input
                  id="order_code"
                  name="order_code"
                  value={formValues.order_code}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      order_code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Mã đơn hàng của bạn"
                  className={inputBaseClass}
                />
              </label>

              <label className="space-y-[9px]">
<<<<<<< HEAD
                <span className="px-[10px] text-[15px] font-medium text-black">
=======
                <span className="px-[10px] text-[15px] font-normal text-black">
>>>>>>> 50e92c7 (feat: frontend lookup order)
                  Số điện thoại/Email đặt hàng:
                </span>
                <input
                  id="contact"
                  name="contact"
                  value={formValues.contact}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      contact: event.target.value,
                    }))
                  }
                  placeholder="Số điện thoại/Email của bạn"
                  className={inputBaseClass}
                />
              </label>
            </div>

<<<<<<< HEAD
            <div className="space-y-[30px] border-t border-black/10 pb-1 pt-[25px]">
              <div className="flex flex-wrap items-center justify-end gap-4">
                <button type="submit" className={primaryActionClass}>
                  {isLoading ? "Đang tra cứu..." : "Tra cứu"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className={secondaryActionClass}
                >
=======
            <div className="space-y-[30px] px-0 pb-5 pt-[25px] md:px-[60px] xl:px-[150px]">
              <div className="h-[2px] w-full bg-[#c4c4c4]" />
              <div className="flex flex-wrap items-center justify-end gap-4">
                <button
                  type="submit"
                  className="min-h-[59px] min-w-[250px] rounded-[100px] border border-black bg-black px-[60px] py-5 text-[20px] font-bold text-white transition hover:bg-white hover:text-black md:min-w-[306px] md:px-[100px] md:text-[22px]"
                >
                  {isLoading ? "Đang tra cứu..." : "Tra cứu"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-[59px] min-w-[250px] rounded-[100px] border border-black bg-black px-[60px] py-5 text-[20px] font-bold text-white transition hover:bg-white hover:text-black md:min-w-[319px] md:px-[100px] md:text-[22px]"
                >
>>>>>>> 50e92c7 (feat: frontend lookup order)
                  Làm mới
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {errorMessage ? (
<<<<<<< HEAD
        <section className="mx-auto max-w-[1529px] border border-[#cf5c43] bg-[#fff4f0] px-6 py-5 text-[#a64e3b] md:px-[40px]">
=======
        <section className="mx-auto max-w-[1529px] border border-[#cf5c43] bg-[#fff2ee] px-6 py-5 text-[#a64e3b]">
>>>>>>> 50e92c7 (feat: frontend lookup order)
          <p className="text-[18px] font-medium">{errorMessage}</p>
        </section>
      ) : null}

<<<<<<< HEAD
      {result ? (
        <section className="mx-auto max-w-[1529px]">
          <OrderDetailContent
            allowCancel
            cancelContext={{
              contact: normalizedContact,
              contactType: detectContactType(normalizedContact),
              source: "lookup",
            }}
            onOrderCancelled={refreshLookupResult}
            order={result}
            showBackLink={false}
          />
        </section>
      ) : null}
=======
      {!hasSearched && !result ? (
        <section className="mx-auto max-w-[1529px] border border-black bg-[#fffdf7] px-6 py-10 text-center">
          <p className="text-[18px] font-light leading-relaxed text-black/68">
            Nhập mã đơn hàng và số điện thoại/email đã đặt để hiển thị chi tiết
            đơn hàng theo đúng bố cục trong thiết kế.
          </p>
        </section>
      ) : null}

      {result && status ? (
        <div className="mx-auto max-w-[1529px] space-y-[30px]">
          <section
            className={cn(
              detailCardClass,
              "px-6 py-[30px] md:px-[60px] xl:px-[120px]",
            )}
          >
            <div className="space-y-6 xl:px-[100px]">
              <div className="flex flex-wrap items-center gap-6 text-[18px] md:text-[22px]">
                <Link
                  href={ROUTES.ORDER_LOOKUP}
                  className="inline-flex w-fit items-center font-light underline underline-offset-4"
                >
                  Trở lại
                </Link>

                <div className="flex flex-wrap items-center gap-2 text-[18px] font-light text-black md:gap-[30px] md:text-[22px]">
                  <span>Mã vận đơn:</span>
                  <span>{result.order_code}</span>
                  <span
                    className={cn(
                      status.tone === "shipping" && "text-[#ff593d]",
                      status.tone === "completed" && "text-black",
                      status.tone === "cancelled" && "text-black/55",
                      status.tone === "returned" && "text-[#b46d1f]",
                    )}
                  >
                    Đơn hàng {status.label.toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="border border-black bg-white px-5 py-8 md:px-[50px] md:py-[50px]">
                <div className="relative mx-auto max-w-[1329px]">
                  <div className="absolute left-[7%] right-[7%] top-8 h-[2px] bg-black/10" />
                  <div
                    className="absolute left-[7%] top-8 h-[2px] bg-[#ff593d] transition-all duration-500"
                    style={{ width: progressWidth }}
                  />

                  <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 md:gap-x-10 xl:gap-x-[60px]">
                    {steps.map((step) => (
                      <div
                        key={step.label}
                        className="relative z-[1] flex flex-col items-center gap-3 text-center"
                      >
                        <div
                          className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white",
                            step.active
                              ? "border-[#cf5c43]"
                              : "border-black/10",
                          )}
                        >
                          <Image
                            src={step.icon}
                            alt=""
                            width={26}
                            height={26}
                            className={cn(
                              step.active
                                ? "brightness-0 saturate-100 invert-[43%] sepia-[49%] saturate-[1376%] hue-rotate-[329deg] brightness-[92%] contrast-[89%]"
                                : "opacity-30",
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-[13px] font-bold leading-tight md:text-[15px]",
                            step.active ? "text-black" : "text-black/40",
                          )}
                        >
                          {step.label}
                        </span>
                        <span className="text-[11px] font-light text-black/55 md:text-xs">
                          {step.time ?? "Đang chờ cập nhật"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className={cn(
              detailCardClass,
              "px-6 py-[30px] md:px-[50px] md:py-[30px]",
            )}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <p className="max-w-[669px] text-[13px] font-light leading-relaxed text-black">
                Nếu hàng nhận được có vấn đề, bạn có thể yêu cầu Trả hàng/Hoàn
                tiền trước {buildSupportDeadline(result.created_at)}
              </p>

              <div className="flex flex-col items-start gap-[13px]">
                <button className="min-w-[267px] rounded-[100px] border border-black bg-black px-8 py-3 text-[18px] font-bold text-white transition hover:bg-white hover:text-black">
                  Đánh giá
                </button>
                {canSupport ? (
                  <button
                    onClick={() => router.push(ROUTES.POLICY("return"))}
                    className="min-w-[267px] rounded-[100px] border border-black bg-white px-8 py-3 text-[18px] font-normal text-black transition hover:bg-black hover:text-white"
                  >
                    Liên hệ Đổi trả
                  </button>
                ) : null}
                {canReorder ? (
                  <button
                    onClick={() =>
                      router.push(ROUTES.PRODUCT(result.items[0].product_slug!))
                    }
                    className="min-w-[267px] rounded-[100px] border border-black bg-white px-8 py-3 text-[18px] font-normal text-black transition hover:bg-black hover:text-white"
                  >
                    Mua lại
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <section
            className={cn(detailCardClass, "px-6 py-[30px] md:px-[50px]")}
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[510px] space-y-[25px]">
                <h3 className="text-[28px] font-normal leading-[1.15] text-black md:text-[32px]">
                  Địa Chỉ Nhận Hàng
                </h3>
                <div className="space-y-2">
                  <p className="text-[24px] font-normal text-black md:text-[28px]">
                    {result.shipping?.recipient_name ?? "Chưa cập nhật"}
                  </p>
                  <p className="text-[18px] font-light text-black">
                    {result.shipping?.recipient_phone ?? "Chưa cập nhật SĐT"}
                  </p>
                  <p className="text-[18px] font-light leading-relaxed text-black">
                    {result.shipping
                      ? [
                          result.shipping.address_detail,
                          result.shipping.district_name,
                          result.shipping.province_name,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : "Chưa cập nhật địa chỉ giao hàng."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:min-w-[320px] lg:items-end lg:text-right">
                <p className="text-[18px] font-light text-black">
                  {result.shipping?.shipping_provider ?? "Đang xử lý nội bộ"}
                </p>
                <p className="text-[18px] font-light text-black">
                  {result.shipping?.tracking_code ?? "Chưa có mã vận đơn"}
                </p>
              </div>
            </div>
          </section>

          <section className="border border-black bg-white px-6 py-[10px] md:px-[50px]">
            <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_814px]">
              <div className="space-y-0">
                {result.items.map((item) => (
                  <article
                    key={item.order_item_id}
                    className="border-b border-black/15 py-8 first:border-t first:border-black/15"
                  >
                    <div className="flex items-start gap-[30px]">
                      <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden bg-secondary">
                        <Image
                          src={item.image_src}
                          alt={item.image_alt || item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 space-y-2">
                          <h4 className="text-[20px] font-normal leading-[1.3] text-black md:text-[22px]">
                            {item.title}
                          </h4>
                          <p className="text-[16px] font-extralight text-black md:text-[18px]">
                            {item.subtitle}
                          </p>
                        </div>
                        <div className="shrink-0 space-y-2 text-left md:min-w-[120px] md:text-right">
                          <p className="text-[18px] font-normal text-black">
                            {formatPrice(item.price)}
                          </p>
                          <p className="text-[18px] font-extralight text-black">
                            x {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="space-y-[15px] px-0 pb-6 pt-2 md:px-[50px] xl:pt-8">
                <div className="flex items-center justify-between text-[18px] font-light text-black">
                  <span>Tạm tính</span>
                  <span>
                    {formatPrice(result.total_amount - result.shipping_fee)}
                  </span>
                </div>
                <div className="h-px w-full bg-black/15" />
                <div className="flex items-center justify-between text-[18px] font-light text-black">
                  <span>Voucher ưu đãi</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <div className="h-px w-full bg-black/15" />
                <div className="flex items-center justify-between text-[18px] font-light text-black">
                  <span>Phí giao hàng</span>
                  <span>
                    {result.shipping_fee > 0
                      ? formatPrice(result.shipping_fee)
                      : "Miễn phí"}
                  </span>
                </div>
                <div className="h-px w-full bg-black/15" />
                <div className="flex items-end justify-between gap-4">
                  <span className="text-[18px] font-light text-black">
                    Thành tiền
                  </span>
                  <span className="text-[28px] font-bold text-[#ff593d]">
                    {formatPrice(result.total_amount)}
                  </span>
                </div>
              </aside>
            </div>
          </section>
        </div>
      ) : null}
>>>>>>> 50e92c7 (feat: frontend lookup order)
    </div>
  );
}
