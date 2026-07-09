"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [formValues, setFormValues] = useState<AppointmentLookupValues>({
    appointment_id: initialValues?.appointment_id ?? "",
    contact: initialValues?.contact ?? "",
  });
  const { errorMessage, isLoading, lookup, reset, result } =
    useAppointmentLookup(initialValues);

  const normalizedResult = result ? normalizeAppointmentResult(result) : null;

  const inputBaseClass =
    "h-[62px] w-full rounded-[100px] border border-black bg-white px-[26px] py-5 text-[18px] font-light text-black outline-none transition-colors placeholder:text-black/50 focus:border-black md:px-[50px]";
  const primaryActionClass =
    "min-h-[59px] min-w-[250px] rounded-[100px] border border-black bg-black px-[60px] py-5 text-[20px] font-bold text-white transition hover:bg-white hover:text-black md:min-w-[306px] md:px-[100px] md:text-[22px]";
  const secondaryActionClass =
    "min-h-[59px] min-w-[250px] rounded-[100px] border border-black bg-white px-[60px] py-5 text-[20px] font-bold text-black transition hover:bg-black hover:text-white md:min-w-[306px] md:px-[100px] md:text-[22px]";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextValues = {
      appointment_id: formValues.appointment_id.trim(),
      contact: formValues.contact.trim(),
    };

    const query = new URLSearchParams(nextValues);
    router.replace(`${ROUTES.APPOINTMENT}?${query.toString()}`, {
      scroll: false,
    });

    await lookup(nextValues);
  };

  const handleReset = () => {
    setFormValues({
      appointment_id: "",
      contact: "",
    });
    reset();
    router.replace(ROUTES.APPOINTMENT, {
      scroll: false,
    });
  };

  return (
    <div className="space-y-10">
      <section className="mx-auto max-w-[1529px]">
        <div className="bg-white p-6 md:p-[40px]">
          <div className="flex flex-col justify-between gap-4 pb-6 sm:flex-row sm:items-center">
            <div className="w-full space-y-3">
              <h1 className="text-[34px] font-bold leading-[1.24] text-black md:text-[44px]">
                Tra cứu lịch hẹn
              </h1>
              <div
                aria-hidden="true"
                className="h-[5px] w-full bg-[length:100%_100%] bg-center bg-no-repeat"
                style={{ backgroundImage: "url(/images/header-line-up.png)" }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-0">
            <div className="grid gap-5 pb-8 lg:grid-cols-2 xl:gap-[50px]">
              <label className="space-y-[9px]">
                <span className="px-[10px] text-[15px] font-medium text-black">
                  Mã lịch hẹn:
                </span>
                <input
                  id="appointment_id"
                  name="appointment_id"
                  type="text"
                  value={formValues.appointment_id}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      appointment_id: event.target.value,
                    }))
                  }
                  placeholder="Mã lịch hẹn của bạn"
                  className={inputBaseClass}
                />
              </label>

              <label className="space-y-[9px]">
                <span className="px-[10px] text-[15px] font-medium text-black">
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

            <div className="space-y-[30px] border-t border-black/10 pb-1 pt-[25px]">
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
        <section className="mx-auto max-w-[1529px] border border-[#cf5c43] bg-[#fff4f0] px-6 py-5 text-[#a64e3b] md:px-[40px]">
          <p className="text-[18px] font-medium">{errorMessage}</p>
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
                    {normalizedResult.duration_label}
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
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center rounded-[8px] border border-black/20 bg-white px-6 text-sm font-medium text-black transition-colors duration-200 hover:border-black hover:bg-black/5"
              >
                Huỷ lịch
              </button>
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
    </div>
  );
}
