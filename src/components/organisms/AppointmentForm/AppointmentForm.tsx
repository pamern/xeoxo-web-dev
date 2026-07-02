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

const DATE_OPTIONS = createAppointmentDateOptions();

const DEFAULT_VALUES: AppointmentValues = {
  fullName: "",
  phone: "",
  email: "",
  gender: "nam",
  branch: "",
  date: DATE_OPTIONS[0]?.value ?? "",
  timeSlot: "",
  note: "",
};

const fieldClassName =
  "h-11 w-full rounded-[22px] border border-black bg-white px-5 text-[15px] font-light text-black outline-none transition-colors placeholder:text-black/45 focus:border-black focus:ring-2 focus:ring-black/10";

const compactFieldClassName =
  "h-11 w-full rounded-[22px] border border-black bg-white px-5 text-[15px] font-light text-black outline-none transition-colors placeholder:text-black/45 focus:border-black focus:ring-2 focus:ring-black/10";

export function AppointmentForm({
  branches,
  timeSlots,
  onSubmit,
}: {
  branches: SelectOption[];
  timeSlots: TimeSlot[];
  onSubmit?: (values: AppointmentValues) => void;
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

  function update<K extends keyof AppointmentValues>(key: K, value: AppointmentValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(values);
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white pt-7">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3.5 px-5 pb-6 md:px-6">
        <FieldRow label="Họ và tên:">
          <input
            name="fullName"
            value={values.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            required
            className={compactFieldClassName}
          />
        </FieldRow>

        <FieldRow label="Số điện thoại:">
          <input
            name="phone"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            required
            className={compactFieldClassName}
          />
        </FieldRow>

        <FieldRow label="Email cá nhân:">
          <input
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            className={compactFieldClassName}
          />
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
          <SelectField
            label=""
            name="branch"
            value={values.branch}
            options={branches}
            onChange={(event) => update("branch", event.target.value)}
            className={cn(fieldClassName, "px-5 pr-12")}
            wrapperClassName="gap-0"
          />
        </FieldRow>

        <FieldRow label="Ngày hẹn:">
          <SelectField
            label=""
            name="date"
            value={values.date}
            options={DATE_OPTIONS}
            onChange={(event) => update("date", event.target.value)}
            className={cn(fieldClassName, "px-5 pr-12")}
            wrapperClassName="gap-0"
          />
        </FieldRow>

        <FieldRow label="Giờ hẹn:">
          <SelectField
            label=""
            name="timeSlot"
            value={values.timeSlot}
            options={timeOptions}
            onChange={(event) => update("timeSlot", event.target.value)}
            className={cn(fieldClassName, "px-5 pr-12")}
            wrapperClassName="gap-0"
          />
        </FieldRow>

        <FieldRow label="Ghi chú:">
          <textarea
            name="note"
            value={values.note}
            onChange={(event) => update("note", event.target.value)}
            rows={1}
            className={cn(compactFieldClassName, "resize-none py-2.5")}
          />
        </FieldRow>
      </div>

      <div
        className="-mx-0 flex min-h-[92px] flex-col items-center justify-center gap-2 bg-cover bg-center px-5 py-5 text-center md:-mx-[18px] md:w-[calc(100%+36px)]"
        style={{ backgroundImage: "url(/images/bg-gia-nhap-btn.png)" }}
      >
        {submitted && (
          <p className="text-sm font-medium text-white drop-shadow">
            Đã ghi nhận thông tin đặt lịch.
          </p>
        )}
        <Button
          type="submit"
          variant="outline"
          size="md"
          className="h-12 w-full max-w-[320px] rounded-3xl border-[2px] border-white bg-black/5 px-6 text-[21px] font-bold normal-case text-white shadow-[0_3px_4px_rgba(0,0,0,0.22)] hover:bg-white/10 md:text-[23px]"
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
      <span className="whitespace-nowrap text-[18px] font-bold leading-tight text-black md:pl-1 md:text-[20px]">
        {label}
      </span>
      {children}
    </div>
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
        "h-11 rounded-[22px] border border-black bg-white px-6 text-[20px] font-bold leading-none text-black transition-colors md:text-[22px]",
        active && "bg-black text-white"
      )}
    >
      {children}
    </button>
  );
}

function createAppointmentDateOptions(): SelectOption[] {
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const value = date.toISOString().slice(0, 10);
    return {
      value,
      label: formatter.format(date),
    };
  });
}
