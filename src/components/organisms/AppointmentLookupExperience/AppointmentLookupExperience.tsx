"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type AppointmentLookupValues = {
  appointment_code: string;
  contact: string;
};

type AppointmentLookupExperienceProps = {
  initialValues?: Partial<AppointmentLookupValues>;
};

type MockAppointmentStatus = "confirmed" | "pending" | "completed";

type MockAppointmentDetail = {
  appointmentCode: string;
  branch: string;
  contact: string;
  consultant: string;
  dateLabel: string;
  note: string;
  service: string;
  status: MockAppointmentStatus;
  statusLabel: string;
  timeLabel: string;
};

const MOCK_APPOINTMENT: MockAppointmentDetail = {
  appointmentCode: "LH2607090121",
  branch: "Xéo Xọ Sài Gòn",
  contact: "0981812568",
  consultant: "Tư vấn viên Linh Chi",
  dateLabel: "Thứ Bảy, 12.07.2026",
  note: "Vui lòng đến sớm 10 phút để được chuẩn bị khu vực thử đồ.",
  service: "Tư vấn số đo và chỉnh phom trực tiếp",
  status: "confirmed",
  statusLabel: "Lịch hẹn đã xác nhận",
  timeLabel: "10:30 - 11:15",
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function getMockAppointment(values: AppointmentLookupValues) {
  const appointmentCode = values.appointment_code.trim().toUpperCase();
  const contact = values.contact.trim();

  if (!appointmentCode || !contact) {
    return null;
  }

  const matchesCode =
    normalizeText(appointmentCode) ===
    normalizeText(MOCK_APPOINTMENT.appointmentCode);
  const matchesContact =
    normalizeText(contact) === normalizeText(MOCK_APPOINTMENT.contact);

  if (!matchesCode || !matchesContact) {
    return null;
  }

  return MOCK_APPOINTMENT;
}

function getStatusClasses(status: MockAppointmentStatus) {
  if (status === "confirmed") {
    return "border-[#ff593d]/20 bg-[#fff1ec] text-[#cf5c43]";
  }

  if (status === "completed") {
    return "border-[#9ac7a7]/30 bg-[#edf8ef] text-[#2f7a45]";
  }

  return "border-black/10 bg-black/[0.03] text-black/65";
}

export function AppointmentLookupExperience({
  initialValues,
}: AppointmentLookupExperienceProps) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<AppointmentLookupValues>({
    appointment_code: initialValues?.appointment_code ?? "",
    contact: initialValues?.contact ?? "",
  });
  const [submittedValues, setSubmittedValues] = useState<AppointmentLookupValues>({
    appointment_code: initialValues?.appointment_code ?? "",
    contact: initialValues?.contact ?? "",
  });
  const [hasSearched, setHasSearched] = useState(
    Boolean(initialValues?.appointment_code && initialValues?.contact),
  );

  const result = useMemo(
    () => getMockAppointment(submittedValues),
    [submittedValues],
  );

  const showError = hasSearched && !result;

  const inputBaseClass =
    "h-[62px] w-full rounded-[100px] border border-black bg-white px-[26px] py-5 text-[18px] font-light text-black outline-none transition-colors placeholder:text-black/50 focus:border-black md:px-[50px]";
  const primaryActionClass =
    "min-h-[59px] min-w-[250px] rounded-[100px] border border-black bg-black px-[60px] py-5 text-[20px] font-bold text-white transition hover:bg-white hover:text-black md:min-w-[306px] md:px-[100px] md:text-[22px]";
  const secondaryActionClass =
    "min-h-[59px] min-w-[250px] rounded-[100px] border border-black bg-white px-[60px] py-5 text-[20px] font-bold text-black transition hover:bg-black hover:text-white md:min-w-[306px] md:px-[100px] md:text-[22px]";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextValues = {
      appointment_code: formValues.appointment_code.trim().toUpperCase(),
      contact: formValues.contact.trim(),
    };

    const query = new URLSearchParams(nextValues);
    router.replace(`${ROUTES.APPOINTMENT}?${query.toString()}`, {
      scroll: false,
    });

    setSubmittedValues(nextValues);
    setHasSearched(true);
  };

  const handleReset = () => {
    setFormValues({
      appointment_code: "",
      contact: "",
    });
    setSubmittedValues({
      appointment_code: "",
      contact: "",
    });
    setHasSearched(false);
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
                  id="appointment_code"
                  name="appointment_code"
                  value={formValues.appointment_code}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      appointment_code: event.target.value.toUpperCase(),
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
                  Tra cứu
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

      {showError ? (
        <section className="mx-auto max-w-[1529px] border border-[#cf5c43] bg-[#fff4f0] px-6 py-5 text-[#a64e3b] md:px-[40px]">
          <p className="text-[18px] font-medium">
            Không tìm thấy lịch hẹn phù hợp. Anh/chị vui lòng kiểm tra lại mã lịch
            hẹn và thông tin liên hệ.
          </p>
        </section>
      ) : null}

      {result ? (
        <section className="mx-auto max-w-[1529px] rounded-[26px] bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.12)] md:p-[40px]">
          <div className="flex flex-col gap-6 border-b border-black/10 pb-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-[18px] text-black">
                <span className="font-light">Mã lịch hẹn:</span>
                <span className="font-semibold">{result.appointmentCode}</span>
              </div>

              <div
                className={cn(
                  "inline-flex rounded-full border px-4 py-2 text-sm font-semibold",
                  getStatusClasses(result.status),
                )}
              >
                {result.statusLabel}
              </div>

              <p className="max-w-[720px] text-[16px] leading-relaxed text-black/72 md:text-[18px]">
                {result.note}
              </p>
            </div>

            <div className="rounded-[22px] border border-[#f5ebe0] bg-[#fffcf6] px-6 py-5 text-left shadow-[0_10px_24px_rgba(0,0,0,0.04)] lg:min-w-[360px]">
              <p className="text-sm font-medium uppercase tracking-[0.08em] text-[#cf5c43]">
                Khung giờ đã chọn
              </p>
              <p className="mt-3 text-[28px] font-bold leading-none text-black">
                {result.timeLabel}
              </p>
              <p className="mt-3 text-[16px] font-medium text-black/72">
                {result.dateLabel}
              </p>
              <p className="mt-2 text-[16px] font-medium text-black/72">
                {result.branch}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="rounded-[22px] border border-black/10 bg-white p-6">
              <h2 className="border-b border-black/5 pb-3 text-[22px] font-bold text-black">
                Thông tin lịch hẹn
              </h2>
              <dl className="mt-5 space-y-4 text-[16px] text-black/75">
                <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-4">
                  <dt className="font-medium text-black">Dịch vụ</dt>
                  <dd className="max-w-[300px] text-right">{result.service}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-4">
                  <dt className="font-medium text-black">Chi nhánh</dt>
                  <dd className="text-right">{result.branch}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-4">
                  <dt className="font-medium text-black">Ngày hẹn</dt>
                  <dd className="text-right">{result.dateLabel}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-medium text-black">Giờ hẹn</dt>
                  <dd className="text-right">{result.timeLabel}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[22px] border border-black/10 bg-white p-6">
              <h2 className="border-b border-black/5 pb-3 text-[22px] font-bold text-black">
                Thông tin liên hệ
              </h2>
              <dl className="mt-5 space-y-4 text-[16px] text-black/75">
                <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-4">
                  <dt className="font-medium text-black">Người phụ trách</dt>
                  <dd className="text-right">{result.consultant}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-4">
                  <dt className="font-medium text-black">SĐT/Email</dt>
                  <dd className="text-right">{result.contact}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-medium text-black">Ghi chú</dt>
                  <dd className="max-w-[300px] text-right">{result.note}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
