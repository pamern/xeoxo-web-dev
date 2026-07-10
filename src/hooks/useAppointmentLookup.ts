"use client";

import { useCallback, useEffect, useState } from "react";
import {
  appointmentService,
  type CancelAppointmentValues,
} from "@/services/appointment.service";
import type {
  AppointmentLookupDto,
  AppointmentLookupValues,
} from "@/types/appointment-lookup.types";

export function useAppointmentLookup(
  initialValues?: Partial<AppointmentLookupValues>,
) {
  const [result, setResult] = useState<AppointmentLookupDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [hasSearched, setHasSearched] = useState(false);

  const lookup = useCallback(async (values: AppointmentLookupValues) => {
    setIsLoading(true);
    setErrorMessage(undefined);
    setHasSearched(true);

    try {
      const data = await appointmentService.lookupAppointment(values);
      setResult(data);
      return data;
    } catch (error) {
      setResult(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể tra cứu lịch hẹn.",
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setIsLoading(false);
    setIsCancelling(false);
    setErrorMessage(undefined);
    setHasSearched(false);
  }, []);

  const cancel = useCallback(
    async (appointmentId: number, values: CancelAppointmentValues = {}) => {
      setIsCancelling(true);
      setErrorMessage(undefined);

      try {
        const data = await appointmentService.cancelAppointment(
          appointmentId,
          values,
        );

        setResult((current) =>
          current && current.appointment_id === appointmentId
            ? {
                ...current,
                appointment_status: data.appointment_status,
              }
            : current,
        );

        return data;
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể hủy lịch hẹn.",
        );
        return null;
      } finally {
        setIsCancelling(false);
      }
    },
    [],
  );

  useEffect(() => {
    const appointmentCode = initialValues?.appointment_code?.trim();
    const contact = initialValues?.contact?.trim();

    if (!appointmentCode || !contact) {
      return;
    }

    void lookup({
      appointment_code: appointmentCode,
      contact,
    });
  }, [initialValues?.appointment_code, initialValues?.contact, lookup]);

  return {
    cancel,
    errorMessage,
    hasSearched,
    isCancelling,
    isLoading,
    lookup,
    reset,
    result,
  };
}
