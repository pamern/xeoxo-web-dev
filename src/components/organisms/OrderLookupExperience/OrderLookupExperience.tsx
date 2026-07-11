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
    "h-[62px] w-full rounded-[100px] border border-black bg-white px-[26px] py-5 text-[1.125rem] font-light text-black outline-none transition-colors placeholder:text-black/50 focus:border-black md:px-[50px]";
  const primaryActionClass =
    "min-h-[59px] min-w-[250px] rounded-[100px] border border-black bg-black px-[60px] py-5 text-[1.25rem] font-bold text-white transition hover:bg-white hover:text-black md:min-w-[306px] md:px-[100px] md:text-[1.375rem]";
  const secondaryActionClass =
    "min-h-[59px] min-w-[250px] rounded-[100px] border border-black bg-white px-[60px] py-5 text-[1.25rem] font-bold text-black transition hover:bg-black hover:text-white md:min-w-[306px] md:px-[100px] md:text-[1.375rem]";

  const normalizedContact = formValues.contact.trim();

  return (
    <div className="space-y-10">
      <section className="mx-auto max-w-[1529px]">
        <div className="bg-white p-6 md:p-[40px]">
          <div className="flex flex-col justify-between gap-4 pb-6 sm:flex-row sm:items-center">
            <div className="w-full space-y-3">
              <h1 className="text-[2.125rem] font-bold leading-[1.24] text-black md:text-[2.75rem]">
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
                <span className="px-[10px] text-[0.9375rem] font-medium text-black">
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
                <span className="px-[10px] text-[0.9375rem] font-medium text-black">
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
                  Làm mới
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {errorMessage ? (
        <section className="mx-auto max-w-[1529px] border border-[#cf5c43] bg-[#fff4f0] px-6 py-5 text-[#a64e3b] md:px-[40px]">
          <p className="text-[1.125rem] font-medium">{errorMessage}</p>
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
