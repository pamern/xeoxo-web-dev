"use client";

import { useState } from "react";
import { customerService } from "@/services/customer.service";
import type { AuthCustomer } from "@/types/auth.types";
import type { UpdateCustomerProfileValues } from "@/types/customer.types";
import { updateCustomerProfileSchema } from "@/validations/customer/update-customer-profile.schema";

export function useCustomerProfile(initialCustomer: AuthCustomer | null) {
  const [customer, setCustomer] = useState<AuthCustomer | null>(initialCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  async function updateProfile(values: UpdateCustomerProfileValues) {
    const parsed = updateCustomerProfileSchema.safeParse(values);

    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ?? "Dữ liệu cập nhật không hợp lệ.",
      );
      setSuccessMessage(undefined);
      return { ok: false };
    }

    setIsSubmitting(true);
    setErrorMessage(undefined);
    setSuccessMessage(undefined);

    try {
      const updatedCustomer = await customerService.updateProfile(values);
      setCustomer(updatedCustomer);
      setSuccessMessage("Thông tin cá nhân đã được cập nhật.");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("xeoxo:profile-updated"));
      }

      return { ok: true, customer: updatedCustomer };
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật thông tin khách hàng.",
      );
      return { ok: false };
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    customer,
    isSubmitting,
    errorMessage,
    successMessage,
    updateProfile,
  };
}
