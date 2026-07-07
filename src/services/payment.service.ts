import { API } from "@/constants/routes";
import { cachedFetch } from "@/lib/requestCache";
import { getApiErrorMessage, type ApiResponse } from "@/types/api.types";
import type { PaymentMethodDto } from "@/types/payment.types";

const PAYMENT_METHODS_TTL_MS = 5 * 60_000;

export const paymentService = {
  async getPaymentMethods() {
    return cachedFetch(
      "payment-methods",
      async () => {
        const response = await fetch(API.PAYMENT_METHODS, {
          credentials: "include",
        });
        const payload = (await response.json()) as ApiResponse<PaymentMethodDto[]>;

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(
            getApiErrorMessage(payload, "Khong the tai phuong thuc thanh toan."),
          );
        }

        return payload.data;
      },
      PAYMENT_METHODS_TTL_MS,
    );
  },
};
