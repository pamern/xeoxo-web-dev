"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import { SelectField, type SelectOption } from "@/components/molecules/SelectField";
import type { TimeSlot } from "@/components/molecules/TimeSlotPicker";
import { cn } from "@/lib/utils";

export type AppointmentValues = {
  fullName: string;
  phone: string;
  email: string;
  gender: "nam" | "nu";
  branch: string;
  date: string;
  timeSlot: string;
  note: string;
};

const TODAY = getLocalDateValue(new Date());

const DEFAULT_VALUES: AppointmentValues = {
  fullName: "",
  phone: "",
  email: "",
  gender: "nam",
  branch: "",
  date: TODAY,
  timeSlot: "",
  note: "",
};

const fieldClassName =
  "h-11 w-full rounded-[22px] border border-black/30 bg-white px-5 text-body font-light text-black outline-none transition-colors placeholder:text-black/40 focus:border-black focus:ring-2 focus:ring-black/10";

const compactFieldClassName =
  "h-11 w-full rounded-[22px] border border-black/30 bg-white px-5 text-body font-light text-black outline-none transition-colors placeholder:text-black/40 focus:border-black focus:ring-2 focus:ring-black/10";

type AppointmentErrors = Partial<Record<keyof AppointmentValues, string>>;

export function AppointmentForm({
  branches,
  timeSlots,
  onSubmit,
}: {
  branches: SelectOption[];
  timeSlots: TimeSlot[];
  onSubmit?: (values: AppointmentValues) => void | Promise<void>;
}) {
  const timeOptions = timeSlots.map((slot) => ({
    label: slot.label,
    value: slot.id,
  }));

  const [values, setValues] = useState<AppointmentValues>({
    ...DEFAULT_VALUES,
    branch: branches[0]?.value ?? "",
    timeSlot: timeSlots[0]?.id ?? "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [errors, setErrors] = useState<AppointmentErrors>({});

  function update<K extends keyof AppointmentValues>(key: K, value: AppointmentValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
    setSubmitError(undefined);
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: validateField(key, value) }));
    }
  }

  function handleBlur<K extends keyof AppointmentValues>(key: K) {
    setErrors((current) => ({
      ...current,
      [key]: validateField(key, values[key]),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateAppointment(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setIsSubmitting(true);
    setSubmitError(undefined);
    try {
      await onSubmit?.(values);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Không thể đặt lịch hẹn.",
      );
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white pt-6">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 px-0 pb-7">
        <FieldRow label="Họ và tên:">
          <FieldControl error={errors.fullName}>
            <input name="fullName" value={values.fullName} onChange={(event) => update("fullName", event.target.value)} onBlur={() => handleBlur("fullName")} placeholder="Nhập họ và tên" aria-invalid={Boolean(errors.fullName)} className={fieldInputClass(compactFieldClassName, errors.fullName)} />
          </FieldControl>
        </FieldRow>

        <FieldRow label="Số điện thoại:">
          <FieldControl error={errors.phone}>
            <input name="phone" inputMode="tel" value={values.phone} onChange={(event) => update("phone", event.target.value)} onBlur={() => handleBlur("phone")} placeholder="Nhập số điện thoại" aria-invalid={Boolean(errors.phone)} className={fieldInputClass(compactFieldClassName, errors.phone)} />
          </FieldControl>
        </FieldRow>

        <FieldRow label="Email cá nhân:">
          <FieldControl error={errors.email}>
            <input name="email" type="email" value={values.email} onChange={(event) => update("email", event.target.value)} onBlur={() => handleBlur("email")} placeholder="Nhập email (không bắt buộc)" aria-invalid={Boolean(errors.email)} className={fieldInputClass(compactFieldClassName, errors.email)} />
          </FieldControl>
        </FieldRow>

        <FieldRow label="Giới tính">
          <div className="grid gap-4 sm:grid-cols-2">
            <GenderPill
              active={values.gender === "nam"}
              onClick={() => update("gender", "nam")}
            >
              Nam
            </GenderPill>
            <GenderPill
              active={values.gender === "nu"}
              onClick={() => update("gender", "nu")}
            >
              Nữ
            </GenderPill>
          </div>
        </FieldRow>

        <FieldRow label="Chi nhánh:">
          <FieldControl error={errors.branch}><SelectField
            label=""
            name="branch"
            value={values.branch}
            options={branches}
            onChange={(event) => update("branch", event.target.value)}
            className={cn(fieldInputClass(fieldClassName, errors.branch), "px-5 pr-12")}
            wrapperClassName="gap-0"
          /></FieldControl>
        </FieldRow>

        <FieldRow label="Ngày hẹn:">
          <FieldControl error={errors.date}><input
            name="date"
            type="date"
            value={values.date}
            min={TODAY}
            onChange={(event) => update("date", event.target.value)}
            onBlur={() => handleBlur("date")}
            aria-invalid={Boolean(errors.date)}
            className={cn(
              fieldInputClass(fieldClassName, errors.date),
              "cursor-pointer px-5 [color-scheme:light]",
            )}
          /></FieldControl>
        </FieldRow>

        <FieldRow label="Giờ hẹn:">
          <FieldControl error={errors.timeSlot}><SelectField
            label=""
            name="timeSlot"
            value={values.timeSlot}
            options={timeOptions}
            onChange={(event) => update("timeSlot", event.target.value)}
            className={cn(fieldInputClass(fieldClassName, errors.timeSlot), "px-5 pr-12")}
            wrapperClassName="gap-0"
          /></FieldControl>
        </FieldRow>

        <FieldRow label="Ghi chú:">
          <textarea
            name="note"
            value={values.note}
            onChange={(event) => update("note", event.target.value)}
            maxLength={500}
            placeholder="Ghi chú thêm cho Xéo Xọ (tối đa 500 ký tự)"
            rows={3}
            className="w-full resize-none rounded-[12px] border border-black/30 bg-white px-4 py-3 text-body font-light text-black outline-none transition-colors placeholder:text-black/40 focus:border-black focus:ring-2 focus:ring-black/10"
          />
        </FieldRow>
      </div>

      <div
        className="flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-[14px] bg-cover bg-center px-5 py-4 text-center"
        style={{ backgroundImage: "url(/images/bg-gia-nhap-btn.png)" }}
      >
        {submitted && (
          <p className="text-body-sm font-medium text-white">
            Đã ghi nhận thông tin đặt lịch.
          </p>
        )}
        {submitError && (
          <p className="text-body-sm font-medium text-white">{submitError}</p>
        )}
        <Button
          type="submit"
          variant="outline"
          size="md"
          disabled={isSubmitting}
          className="h-11 w-full max-w-[300px] rounded-pill border border-white bg-transparent px-6 text-lg font-bold normal-case text-white hover:bg-white hover:text-black"
        >
          Lưu Biểu mẫu
        </Button>
      </div>
    </form>
  );
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2.5 md:grid-cols-[185px_minmax(0,1fr)] md:items-center">
      <span className="whitespace-nowrap text-body-lg font-bold leading-tight text-black md:pl-1 md:text-[20px]">
        {label}
      </span>
      {children}
    </div>
  );
}

function FieldControl({ error, children }: { error?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {children}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}

function fieldInputClass(base: string, error?: string) {
  return cn(
    base,
    error && "border-red-500 text-red-700 focus:border-red-500 focus:ring-red-100",
  );
}

function GenderPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-11 rounded-[22px] border border-black/30 bg-white px-6 text-[20px] font-bold leading-none text-black transition-colors md:text-button",
        active && "bg-black text-white"
      )}
    >
      {children}
    </button>
  );
}

function getLocalDateValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function validateField(
  key: keyof AppointmentValues,
  value: AppointmentValues[keyof AppointmentValues],
) {
  const text = String(value).trim();
  if (["fullName", "phone", "branch", "date", "timeSlot"].includes(key) && !text) {
    return "Vui lòng nhập thông tin này";
  }
  if (key === "fullName" && text.length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
  if (key === "phone" && !/^(?:\+?84|0)\d{9}$/.test(text.replace(/\s/g, ""))) {
    return "Số điện thoại không hợp lệ";
  }
  if (key === "email" && text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return "Email không hợp lệ";
  }
  if (key === "date" && text && text < TODAY) return "Ngày hẹn không được ở trong quá khứ";
  return undefined;
}

function validateAppointment(values: AppointmentValues): AppointmentErrors {
  const errors: AppointmentErrors = {};
  (Object.keys(values) as Array<keyof AppointmentValues>).forEach((key) => {
    const error = validateField(key, values[key]);
    if (error) errors[key] = error;
  });
  return errors;
}
