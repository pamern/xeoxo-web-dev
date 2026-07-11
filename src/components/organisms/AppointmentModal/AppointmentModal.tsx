"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AppointmentForm,
  type AppointmentValues,
} from "@/components/organisms/AppointmentForm";
import { ActionSuccessModal } from "@/components/organisms/ActionSuccessModal";
import type { SelectOption } from "@/components/molecules/SelectField";
import type { TimeSlot } from "@/components/molecules/TimeSlotPicker";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { createAppointment } from "@/services/appointment.service";
import type { AppointmentDto } from "@/types/appointment.types";

export function AppointmentModal({
  branches,
  timeSlots,
  productLineId,
  onClose,
  className,
}: {
  branches: SelectOption[];
  timeSlots: TimeSlot[];
  productLineId?: number;
  onClose?: () => void;
  className?: string;
}) {
  const [createdAppointment, setCreatedAppointment] =
    useState<AppointmentDto | null>(null);
  const auth = useAuth();
  const [shouldTopAlign, setShouldTopAlign] = useState(false);
  const modalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function syncModalAlignment() {
      const modalHeight = modalRef.current?.offsetHeight ?? 0;
      const availableHeight = window.innerHeight - 40;
      setShouldTopAlign(modalHeight > availableHeight);
    }

    syncModalAlignment();
    window.addEventListener("resize", syncModalAlignment);

    return () => {
      window.removeEventListener("resize", syncModalAlignment);
    };
  }, []);

  const handleSuccessClose = () => {
    setCreatedAppointment(null);
    onClose?.();
  };

  async function handleSubmit(values: AppointmentValues) {
    const appointment = await createAppointment({
      full_name: values.fullName,
      phone: values.phone,
      email: values.email || undefined,
      branch_id: Number(values.branch),
      appointment_date: values.date,
      start_time: values.timeSlot,
      product_line_id: productLineId,
      customer_note: [
        values.fullName ? `Họ tên: ${values.fullName}` : "",
        values.phone ? `SĐT: ${values.phone}` : "",
        values.email ? `Email: ${values.email}` : "",
        values.note ? `Ghi chú: ${values.note}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    setCreatedAppointment(appointment);
  }

  return (
    <>
      <div
        className={cn(
          "flex w-full justify-center",
          shouldTopAlign
            ? "items-start"
            : "min-h-[calc(100dvh-40px)] items-center",
        )}
      >
        <section
          ref={modalRef}
          className={cn(
            "relative mx-auto flex w-full max-w-[860px] shrink-0 flex-col overflow-visible rounded-[22px] bg-white px-5 pb-0 pt-5 shadow-[0_18px_54px_rgba(0,0,0,0.28)] sm:px-6 sm:pt-6",
            className,
          )}
        >
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white transition hover:bg-black/5"
          >
            <Image src="/icons/close-black.svg" alt="" width={36} height={36} aria-hidden />
          </button>

          <header className="pb-3 text-center">
            <h1 className="text-xl font-bold uppercase leading-none text-black">
              Đặt lịch may đo
            </h1>
            <div className="mx-auto mt-2 h-[5px] w-[min(100%,300px)] overflow-hidden bg-[url('/images/bg-gia-nhap-btn.png')] bg-cover bg-center" />
          </header>

          <div className="relative mx-auto flex min-h-0 w-full max-w-[720px] flex-1 flex-col overflow-visible rounded-[24px] border border-black/40 bg-white px-4 pb-0 pt-5 sm:px-6 sm:pt-6">
            <AppointmentForm
              branches={branches}
              timeSlots={timeSlots}
              onSubmit={handleSubmit}
              showInlineSuccessMessage={false}
              showGenderField={false}
            />
          </div>
        </section>
      </div>

      {createdAppointment ? (
        <ActionSuccessModal
          title="Đặt lịch thành công"
          eyebrow="Xéo Xọ đã ghi nhận"
          message="Lịch hẹn của bạn đã được lưu thành công. Xéo Xọ đã sẵn sàng đón tiếp và tư vấn số đo cho bạn tại chi nhánh đã chọn."
          codeLabel="Mã lịch hẹn"
          codeValue={createdAppointment.appointment_code}
          primaryLabel="Xem lịch hẹn"
          primaryHref={
            auth.isAuthenticated ? ROUTES.ACCOUNT_APPOINTMENTS : ROUTES.APPOINTMENT
          }
          primaryAction={handleSuccessClose}
          secondaryLabel="Tiếp tục mua hàng"
          secondaryHref={ROUTES.HOME}
          secondaryAction={handleSuccessClose}
          onClose={handleSuccessClose}
        />
      ) : null}
    </>
  );
}
