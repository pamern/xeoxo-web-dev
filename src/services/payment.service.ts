import { API } from "@/constants/routes";
import { getApiErrorMessage, type ApiResponse } from "@/types/api.types";
import type { PaymentMethodDto } from "@/types/payment.types";

export const paymentService = {
  async getPaymentMethods() {
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
};
