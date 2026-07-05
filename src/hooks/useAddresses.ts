"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addressService,
  type CreateAddressValues,
} from "@/services/address.service";
import type { CustomerAddress } from "@/types/customer.types";

export function useAddresses(enabled = true) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const refetch = useCallback(async () => {
    if (!enabled) {
      setAddresses([]);
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
      return data;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể tải sổ địa chỉ.",
      );
      setAddresses([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  async function createAddress(values: CreateAddressValues) {
    setIsMutating(true);
    setErrorMessage(undefined);

    try {
      const address = await addressService.createAddress(values);
      await refetch();
      return { ok: true, address };
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể tạo địa chỉ mới.",
      );
      return { ok: false };
    } finally {
      setIsMutating(false);
    }
  }

  return {
    addresses,
    isLoading,
    isMutating,
    errorMessage,
    refetch,
    createAddress,
  };
}
