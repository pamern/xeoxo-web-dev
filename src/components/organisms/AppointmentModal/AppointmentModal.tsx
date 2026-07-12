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
      <div className="fixed inset-0 z-[140] overflow-y-auto">
        <div className="relative z-10 flex min-h-full items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity" onClick={onClose} />

          <section
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-modal-title"
            className={cn(
              "relative w-[90%] sm:w-[40vw] max-w-[480px] min-w-[320px] rounded-[24px] bg-white px-4 pb-5 pt-5 sm:px-5 sm:pb-6 sm:pt-6 shadow-2xl overflow-visible",
              className
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng đặt lịch hẹn"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white transition hover:bg-black/5 sm:right-5 sm:top-5"
            >
              <Image src="/icons/close-black.svg" alt="" width={44} height={44} aria-hidden />
            </button>

            <header className="border-b border-black/20 pb-5 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#f15a42]">
                Xéo Xọ Đặt lịch
              </p>
              <h1 id="appointment-modal-title" className="mt-1 text-2xl font-bold sm:text-[2rem] text-black">
                Đặt lịch may đo
              </h1>
            </header>

            <div className="relative mt-6">
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
      </div>

      {createdAppointment ? (
        <ActionSuccessModal
          title="Đặt lịch thành công"
          eyebrow="Xéo Xọ đã ghi nhận"
          message="Lịch hẹn của bạn đã được lưu thành công. Xéo Xọ đã sẵn sàng đón tiếp và tư vấn số đo cho bạn tại chi nhánh đã chọn."
          codeLabel="Mã lịch hẹn"
          codeValue={createdAppointment.appointment_code}
          primaryLabel="Theo dõi lịch hẹn"
          primaryHref={
            auth.isAuthenticated ? ROUTES.ACCOUNT_APPOINTMENTS : ROUTES.APPOINTMENT
          }
          primaryAction={handleSuccessClose}
          secondaryLabel="Tiếp tục mua sắm"
          secondaryHref={ROUTES.PRODUCTS}
          secondaryAction={handleSuccessClose}
          onClose={handleSuccessClose}
        />
      ) : null}
    </>
  );
}
