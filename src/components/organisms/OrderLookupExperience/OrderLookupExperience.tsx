"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OrderDetailContent } from "@/components/organisms/OrderDetailContent";
import { ROUTES } from "@/constants/routes";
import { useOrderLookup } from "@/hooks/useOrderLookup";
import type { OrderLookupValues } from "@/types/order-lookup.types";

type OrderLookupExperienceProps = {
  initialValues?: Partial<OrderLookupValues>;
};

function detectContactType(contact: string): "email" | "phone" {
  return contact.includes("@") ? "email" : "phone";
}

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

  const refreshLookupResult = async () => {
    const nextValues = {
      contact: formValues.contact.trim(),
      order_code: formValues.order_code.trim(),
    };

    await lookup(nextValues);
  };

  const inputBaseClass =
    "h-12 w-full rounded-pill border border-black bg-white px-4 text-[15px] font-light text-black outline-none transition-colors placeholder:text-black/45 focus:border-black md:h-[52px] md:px-5 md:text-base";
  const primaryActionClass =
    "min-h-[46px] min-w-[156px] rounded-pill border border-black bg-black px-6 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black md:min-h-[48px] md:min-w-[172px] md:px-7 md:text-[15px]";
  const secondaryActionClass =
    "min-h-[46px] min-w-[156px] rounded-pill border border-black bg-white px-6 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white md:min-h-[48px] md:min-w-[172px] md:px-7 md:text-[15px]";

  const normalizedContact = formValues.contact.trim();

  return (
    <div className="space-y-8">
      <section className="mx-auto max-w-[1529px]">
        <div className="bg-white p-5 md:p-8">
          <div className="flex flex-col justify-between gap-4 pb-5 sm:flex-row sm:items-center">
            <div className="w-full space-y-3">
              <h1 className="text-[1.9rem] font-bold leading-[1.12] text-black md:text-[2.35rem]">
                Tra cứu đơn hàng
              </h1>
              <div
                aria-hidden="true"
                className="h-[5px] w-full bg-[length:100%_100%] bg-center bg-no-repeat"
                style={{ backgroundImage: "url(/images/header-line-up.png)" }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-0">
            <div className="grid gap-4 pb-6 lg:grid-cols-2 xl:gap-8">
              <label className="space-y-2">
                <span className="px-1 text-[13px] font-medium text-black/80 md:text-sm">
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

              <label className="space-y-2">
                <span className="px-1 text-[13px] font-medium text-black/80 md:text-sm">
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

            <div className="border-t border-black/10 pt-5">
              <div className="flex flex-wrap items-center justify-end gap-4">
                <button type="submit" className={primaryActionClass}>
                  {isLoading ? "Đang tra cứu..." : "Tra cứu"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className={secondaryActionClass}
                >
                  Làm mới
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {errorMessage ? (
        <section className="mx-auto max-w-[1529px] border border-[#cf5c43] bg-[#fff4f0] px-5 py-4 text-[#a64e3b] md:px-8">
          <p className="text-sm font-medium md:text-[15px]">{errorMessage}</p>
        </section>
      ) : null}

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
    </div>
  );
}
