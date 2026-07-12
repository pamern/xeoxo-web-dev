"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppointmentCancelConfirmModal } from "@/components/organisms/AppointmentCancelConfirmModal";
import { ROUTES } from "@/constants/routes";
import { useAppointmentLookup } from "@/hooks/useAppointmentLookup";
import type {
  AppointmentLookupValues,
} from "@/types/appointment-lookup.types";

type AppointmentLookupExperienceProps = {
  initialValues?: Partial<AppointmentLookupValues>;
};

type AppointmentLookupCardData = {
  appointment_id: number;
  appointment_code: string;
  branch_address: string;
  branch_name: string;
  date_label: string;
  duration_label: string;
  service_name: string;
  status: "upcoming" | "completed" | "cancelled";
  status_label: string;
  time_label: string;
};

function getStatusClasses(status: string) {
  if (status === "CONFIRMED") {
    return "border-[#ff593d]/20 bg-[#fff1ec] text-[#cf5c43]";
  }

  if (status === "COMPLETED") {
    return "border-[#9ac7a7]/30 bg-[#edf8ef] text-[#2f7a45]";
  }

  if (status === "CANCELLED" || status === "NO_SHOW") {
    return "border-[#d4d4d4]/30 bg-[#f8f8f8] text-[#525252]";
  }

  return "border-black/10 bg-black/[0.03] text-black/65";
}

function formatAppointmentDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) {
    return dateValue;
  }

  return `Ngày ${Number(day)} tháng ${Number(month)} năm ${year}`;
}

function formatTimeLabel(startTime: string, endTime: string) {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

function normalizeAppointmentResult(result: any): AppointmentLookupCardData {
  return {
    appointment_id: Number(result.appointment_id),
    appointment_code: result.appointment_code ?? "",
    branch_address: result.address ?? "Chưa cập nhật địa chỉ chi nhánh.",
    branch_name: result.branch_name ?? "Xéo Xọ",
    date_label: formatAppointmentDate(result.appointment_date),
    duration_label: "Thời lượng theo lịch hẹn",
    service_name: "Lịch hẹn tư vấn số đo",
    status: result.appointment_status === "COMPLETED"
      ? "completed"
      : result.appointment_status === "CANCELLED" || result.appointment_status === "NO_SHOW"
      ? "cancelled"
      : "upcoming",
    status_label:
      result.appointment_status === "COMPLETED"
        ? "Hoàn thành"
        : result.appointment_status === "CANCELLED"
        ? "Đã hủy"
        : result.appointment_status === "NO_SHOW"
        ? "Vắng mặt"
        : "Sắp diễn ra",
    time_label: formatTimeLabel(result.start_time, result.end_time),
  };
}

export function AppointmentLookupExperience({
  initialValues,
}: AppointmentLookupExperienceProps) {
  const router = useRouter();
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState<string>();
  const [appointmentToConfirm, setAppointmentToConfirm] =
    useState<AppointmentLookupCardData | null>(null);
  const [formValues, setFormValues] = useState<AppointmentLookupValues>({
    appointment_code: initialValues?.appointment_code ?? "",
    contact: initialValues?.contact ?? "",
  });
  const {
    cancel,
    errorMessage,
    isCancelling,
    isLoading,
    lookup,
    reset,
    result,
  } =
    useAppointmentLookup(initialValues);

  const normalizedResult = result ? normalizeAppointmentResult(result) : null;

  const inputBaseClass =
    "h-12 w-full rounded-pill border border-black bg-white px-4 text-[15px] font-light text-black outline-none transition-colors placeholder:text-black/45 focus:border-black md:h-[52px] md:px-5 md:text-base";
  const primaryActionClass =
    "min-h-[46px] min-w-[156px] rounded-pill border border-black bg-black px-6 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black md:min-h-[48px] md:min-w-[172px] md:px-7 md:text-[15px]";
  const secondaryActionClass =
    "min-h-[46px] min-w-[156px] rounded-pill border border-black bg-white px-6 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white md:min-h-[48px] md:min-w-[172px] md:px-7 md:text-[15px]";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextValues = {
      appointment_code: formValues.appointment_code.trim(),
      contact: formValues.contact.trim(),
    };

    const query = new URLSearchParams(nextValues);
    router.replace(`${ROUTES.APPOINTMENT}?${query.toString()}`, {
      scroll: false,
    });

    setCancelSuccessMessage(undefined);
    await lookup(nextValues);
  };

  const handleReset = () => {
    setFormValues({
      appointment_code: "",
      contact: "",
    });
    setAppointmentToConfirm(null);
    setCancelSuccessMessage(undefined);
    reset();
    router.replace(ROUTES.APPOINTMENT, {
      scroll: false,
    });
  };

  const handleCancelAppointment = async () => {
    if (!result) {
      return;
    }

    setAppointmentToConfirm(null);
    const cancelled = await cancel(result.appointment_id, {
      contact: formValues.contact.trim(),
    });

    if (cancelled) {
      setCancelSuccessMessage("Hủy lịch hẹn thành công.");
    }
  };

  return (
    <div className="space-y-8">
      <section className="mx-auto max-w-[1529px]">
        <div className="bg-white p-5 md:p-8">
          <div className="flex flex-col justify-between gap-4 pb-5 sm:flex-row sm:items-center">
            <div className="w-full space-y-3">
              <h1 className="text-[1.9rem] font-bold leading-[1.12] text-black md:text-[2.35rem]">
                Tra cứu lịch hẹn
              </h1>
              <div
                aria-hidden="true"
                className="h-[5px] w-full bg-[length:100%_100%] bg-center bg-no-repeat"
                style={{ backgroundImage: "url(/images/header-line-up.png)" }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-0">
            <div className="grid gap-4 pb-6 lg:grid-cols-2 xl:gap-8">
              <label className="space-y-2">
                <span className="px-1 text-[13px] font-medium text-black/80 md:text-sm">
                  Mã lịch hẹn:
                </span>
                <input
                  id="appointment_code"
                  name="appointment_code"
                  type="text"
                  value={formValues.appointment_code}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      appointment_code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Ví dụ: APT00000013"
                  className={inputBaseClass}
                />
              </label>

              <label className="space-y-2">
                <span className="px-1 text-[13px] font-medium text-black/80 md:text-sm">
                  Số điện thoại/Email đặt lịch:
                </span>
                <input
                  id="contact"
                  name="contact"
                  type="text"
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

            <div className="border-t border-black/10 pt-5">
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
        <section className="mx-auto max-w-[1529px] border border-[#cf5c43] bg-[#fff4f0] px-5 py-4 text-[#a64e3b] md:px-8">
          <p className="text-sm font-medium md:text-[15px]">{errorMessage}</p>
        </section>
      ) : null}

      {cancelSuccessMessage ? (
        <section className="mx-auto max-w-[1529px] border border-[#cf5c43]/25 bg-[#fff2ee] px-5 py-4 text-[#b14f3d] md:px-8">
          <p className="text-sm font-medium md:text-[15px]">{cancelSuccessMessage}</p>
        </section>
      ) : null}

      {normalizedResult ? (
        <article className="overflow-hidden border border-black/40 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col gap-4 px-4 py-5 md:px-6 md:py-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-[15px] leading-[1.3] tracking-[-0.01em] text-black/72">
                  <span className="font-bold text-black">{normalizedResult.service_name}</span>
                </p>
                <p className="text-[13px] leading-[1.4] tracking-[-0.01em] text-black/60">
                  {normalizedResult.branch_name}
                </p>
              </div>

              <span
                className={
                  `rounded-full px-3 py-1 text-[13px] font-bold leading-none tracking-[-0.015em] ${getStatusClasses(normalizedResult.status)}`
                }
              >
                {normalizedResult.status_label}
              </span>
            </div>

            <div className="relative -mx-4 border-t border-neutral-300 bg-white px-5 py-5 shadow-[0_14px_38px_rgba(0,0,0,0.08)] transition duration-200 hover:shadow-[0_18px_46px_rgba(0,0,0,0.12)] md:-mx-6 md:px-6 md:py-6">
              <div className="absolute -left-4 -top-px h-px w-4 bg-white" />
              <div className="absolute -right-4 -top-px h-px w-4 bg-white" />
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
                <div className="grid gap-2">
                  <p className="text-[14px] leading-[1.35] tracking-[-0.01em] text-black">
                    {normalizedResult.branch_address}
                  </p>
                  <p className="text-[12px] leading-[1.4] tracking-[-0.01em] text-black/60">
                    Mã lịch hẹn: {normalizedResult.appointment_code || normalizedResult.appointment_id}
                  </p>
                </div>

                <div className="grid gap-2 pr-4 text-right sm:pr-6">
                  <p className="whitespace-nowrap text-[15px] leading-[1.22] tracking-[-0.01em] text-black">
                    Thời gian: {normalizedResult.time_label}
                  </p>
                  <p className="whitespace-nowrap text-[15px] leading-[1.22] tracking-[-0.01em] text-black">
                    {normalizedResult.date_label}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {normalizedResult.status === "upcoming" ? (
                <button
                  type="button"
                  onClick={() => setAppointmentToConfirm(normalizedResult)}
                  disabled={isCancelling}
                  className="inline-flex h-12 items-center justify-center rounded-[8px] border border-black/20 bg-white px-6 text-sm font-medium text-black transition-colors duration-200 hover:border-black hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCancelling ? "Đang hủy..." : "Huỷ lịch"}
                </button>
              ) : null}
              <Link
                href={ROUTES.FAQ_ACCOUNT}
                className="inline-flex h-12 items-center justify-center rounded-[8px] border border-black bg-black px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-white hover:text-black"
              >
                Liên hệ
              </Link>
            </div>
          </div>
        </article>
      ) : null}

      {appointmentToConfirm ? (
        <AppointmentCancelConfirmModal
          appointment={appointmentToConfirm}
          isSubmitting={isCancelling}
          onClose={() => setAppointmentToConfirm(null)}
          onConfirm={() => void handleCancelAppointment()}
        />
      ) : null}
    </div>
  );
}
