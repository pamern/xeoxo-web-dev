"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addressService,
  type CreateAddressValues,
  type UpdateAddressValues,
} from "@/services/address.service";
import type { CustomerAddress } from "@/types/customer.types";

export function useAddresses(
  enabled = true,
  initialAddresses?: CustomerAddress[],
) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>(
    initialAddresses ?? [],
  );
  const [isLoading, setIsLoading] = useState(enabled && !initialAddresses);
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
    if (!enabled) {
      setAddresses([]);
      setIsLoading(false);
      setErrorMessage(undefined);
      return;
    }

    if (initialAddresses) {
      setAddresses(initialAddresses);
      setIsLoading(false);
      setErrorMessage(undefined);
    }
  }, [enabled, initialAddresses]);

  useEffect(() => {
    if (!enabled || initialAddresses) {
      return;
    }

    void refetch();
  }, [enabled, initialAddresses, refetch]);

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

  async function updateAddress(addressId: number, values: UpdateAddressValues) {
    setIsMutating(true);
    setErrorMessage(undefined);

    try {
      const address = await addressService.updateAddress(addressId, values);
      await refetch();
      return { ok: true, address };
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể cập nhật địa chỉ.",
      );
      return { ok: false };
    } finally {
      setIsMutating(false);
    }
  }

  async function deleteAddress(addressId: number) {
    setIsMutating(true);
    setErrorMessage(undefined);

    try {
      const result = await addressService.deleteAddress(addressId);
      await refetch();
      return { ok: true, result };
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể xóa địa chỉ.",
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
    updateAddress,
    deleteAddress,
  };
}
