"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AppointmentForm,
  type AppointmentValues,
} from "@/components/organisms/AppointmentForm";
import { ActionSuccessModal } from "@/components/organisms/ActionSuccessModal";
import type { SelectOption } from "@/components/molecules/SelectField";
import type { TimeSlot } from "@/components/molecules/TimeSlotPicker";
import { ROUTES } from "@/constants/routes";
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
      <section
        className={cn(
          "relative mx-auto w-full max-w-[860px] rounded-[20px] bg-white px-5 pb-7 pt-6 sm:px-9 sm:pt-8",
          className,
        )}
      >
        <button
          type="button"
          aria-label="Đóng"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white transition hover:bg-black/5 sm:right-5 sm:top-5"
        >
          <Image src="/icons/close-black.svg" alt="" width={44} height={44} aria-hidden />
        </button>

        <header className="mb-2 border-b border-black/20 pb-5 pr-12 text-left">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#f15a42]">
            Xéo Xọ tư vấn may đo
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-black sm:text-[32px]">
            Đặt lịch may đo
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-black/60">
            Chọn thời gian và chi nhánh phù hợp để được tư vấn số đo trực tiếp.
          </p>
          <span className="mt-3 inline-flex rounded-pill bg-[#fff0e8] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#f15a42]">
            Miễn phí may đo
          </span>
        </header>

        <div className="mx-auto w-full max-w-[960px] overflow-visible bg-white">
          <AppointmentForm
            branches={branches}
            timeSlots={timeSlots}
            onSubmit={handleSubmit}
            showInlineSuccessMessage={false}
          />
        </div>
      </section>

      {createdAppointment ? (
        <ActionSuccessModal
          title="Đặt Lịch Thành Công"
          eyebrow="Xéo Xọ đã ghi nhận"
          message="Lịch hẹn của bạn đã được lưu thành công. Xéo Xọ sẽ chuẩn bị sẵn sàng để đón tiếp và tư vấn số đo cho bạn tại chi nhánh đã chọn."
          codeLabel="Mã lịch hẹn"
          codeValue={createdAppointment.appointment_code}
          primaryLabel="Tiếp tục khám phá"
          primaryHref={ROUTES.PRODUCTS}
          primaryAction={handleSuccessClose}
          secondaryLabel="Đóng"
          secondaryAction={handleSuccessClose}
          onClose={handleSuccessClose}
        />
      ) : null}
    </>
  );
}
