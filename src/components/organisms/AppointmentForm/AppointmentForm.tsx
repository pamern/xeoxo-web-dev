"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/atoms/Button";
import type { SelectOption } from "@/components/molecules/SelectField";
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
const CURRENT_YEAR = parseValueAsDate(TODAY).getFullYear();
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, index) => CURRENT_YEAR + index);
const MONTH_OPTIONS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const INPUT_DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

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
  "h-9 w-full rounded-pill border border-black/40 bg-white px-3.5 text-sm font-light text-black outline-none transition-colors placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-black/10";

type AppointmentErrors = Partial<Record<keyof AppointmentValues, string>>;

export function AppointmentForm({
  branches,
  timeSlots,
  onSubmit,
  showInlineSuccessMessage = true,
  showGenderField = true,
}: {
  branches: SelectOption[];
  timeSlots: TimeSlot[];
  onSubmit?: (values: AppointmentValues) => void | Promise<void>;
  showInlineSuccessMessage?: boolean;
  showGenderField?: boolean;
}) {
  const initialDate = useMemo(() => parseValueAsDate(TODAY), []);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const branchRef = useRef<HTMLDivElement | null>(null);
  const dateRef = useRef<HTMLDivElement | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);

  const [values, setValues] = useState<AppointmentValues>({
    ...DEFAULT_VALUES,
    branch: branches[0]?.value ?? "",
    timeSlot: timeSlots[0]?.id ?? "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [errors, setErrors] = useState<AppointmentErrors>({});
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, TODAY),
    [visibleMonth],
  );
  const selectedDate = useMemo(() => parseValueAsDate(values.date), [values.date]);
  const selectedTimeLabel =
    timeSlots.find((slot) => slot.id === values.timeSlot)?.label ?? "";
  const timeSlotsWithAvailability = useMemo(
    () =>
      timeSlots.map((slot) => ({
        ...slot,
        isDisabled: isTimeSlotDisabled(values.date, slot.id),
      })),
    [timeSlots, values.date],
  );
  const orderedTimeSlots = useMemo(() => {
    const morningSlots = timeSlotsWithAvailability.filter((slot) => {
      const hour = Number(slot.id.split(":")[0]);
      return hour < 12;
    });
    const afternoonSlots = timeSlotsWithAvailability.filter((slot) => {
      const hour = Number(slot.id.split(":")[0]);
      return hour >= 12;
    });

    return [...morningSlots, ...afternoonSlots];
  }, [timeSlotsWithAvailability]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (branchRef.current && !branchRef.current.contains(target)) {
        setIsBranchOpen(false);
      }

      if (dateRef.current && !dateRef.current.contains(target)) {
        setIsDateOpen(false);
      }

      if (timeRef.current && !timeRef.current.contains(target)) {
        setIsTimeOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const selectedSlot = timeSlotsWithAvailability.find(
      (slot) => slot.id === values.timeSlot,
    );

    if (selectedSlot && !selectedSlot.isDisabled) {
      return;
    }

    const firstAvailableSlot = timeSlotsWithAvailability.find(
      (slot) => !slot.isDisabled,
    );

    setValues((current) => ({
      ...current,
      timeSlot: firstAvailableSlot?.id ?? "",
    }));
  }, [timeSlotsWithAvailability, values.timeSlot]);

  function update<K extends keyof AppointmentValues>(key: K, value: AppointmentValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
    setSubmitError(undefined);

    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });

    if (timersRef.current[key]) {
      clearTimeout(timersRef.current[key]);
    }

    timersRef.current[key] = setTimeout(() => {
      const error = validateField(key, value, {
        ...values,
        [key]: value,
      });

      setErrors((current) => {
        if (error) {
          return { ...current, [key]: error };
        }

        const next = { ...current };
        delete next[key];
        return next;
      });
    }, 650);
  }

  function handleBlur<K extends keyof AppointmentValues>(key: K) {
    if (timersRef.current[key]) {
      clearTimeout(timersRef.current[key]);
    }

    let nextValue = values[key];
    if (key === "fullName") {
      nextValue = String(nextValue).trim().replace(/\s+/g, " ") as AppointmentValues[K];
    } else if (key === "phone") {
      nextValue = String(nextValue).trim() as AppointmentValues[K];
    } else if (key === "email") {
      nextValue = String(nextValue).trim().toLowerCase() as AppointmentValues[K];
    }

    if (nextValue !== values[key]) {
      setValues((current) => ({ ...current, [key]: nextValue }));
    }

    setErrors((current) => {
      const error = validateField(key, nextValue, {
        ...values,
        [key]: nextValue,
      });
      if (error) {
        return { ...current, [key]: error };
      }

      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleDateSelect(value: string) {
    const nextDate = parseValueAsDate(value);
    update("date", value);
    setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    setIsDateOpen(false);
  }

  function handleTimeSelect(value: string) {
    update("timeSlot", value);
    setIsTimeOpen(false);
  }

  function handleBranchSelect(value: string) {
    update("branch", value);
    setIsBranchOpen(false);
  }

  function handleMonthChange(monthIndex: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), monthIndex, 1));
  }

  function handleYearChange(year: number) {
    setVisibleMonth((current) => new Date(year, current.getMonth(), 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    Object.values(timersRef.current).forEach(clearTimeout);

    const normalizedValues = {
      ...values,
      fullName: values.fullName.trim().replace(/\s+/g, " "),
      phone: values.phone.trim(),
      email: values.email.trim().toLowerCase(),
    };

    setValues(normalizedValues);

    const nextErrors = validateAppointment(normalizedValues);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      await onSubmit?.(normalizedValues);
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
    <form onSubmit={handleSubmit} noValidate className="bg-transparent">
      <div className="mx-auto flex w-full flex-col gap-3 pb-5">
        <FieldRow label="Họ và tên">
          <FieldControl error={errors.fullName}>
            <input
              name="fullName"
              value={values.fullName}
              onChange={(event) => update("fullName", event.target.value)}
              onBlur={() => handleBlur("fullName")}
              placeholder="Nguyễn Văn A"
              aria-invalid={Boolean(errors.fullName)}
              className={fieldInputClass(fieldClassName, errors.fullName)}
            />
          </FieldControl>
        </FieldRow>

        <FieldRow label="Số điện thoại">
          <FieldControl error={errors.phone}>
            <input
              name="phone"
              inputMode="tel"
              value={values.phone}
              onChange={(event) => update("phone", event.target.value)}
              onBlur={() => handleBlur("phone")}
              placeholder="09xxxxxxxx"
              aria-invalid={Boolean(errors.phone)}
              className={fieldInputClass(fieldClassName, errors.phone)}
            />
          </FieldControl>
        </FieldRow>

        <FieldRow label="Email cá nhân">
          <FieldControl error={errors.email}>
            <input
              name="email"
              type="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="Nhập email (không bắt buộc)"
              aria-invalid={Boolean(errors.email)}
              className={fieldInputClass(fieldClassName, errors.email)}
            />
          </FieldControl>
        </FieldRow>

        {showGenderField ? (
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
        ) : null}

        <FieldRow label="Chi nhánh">
          <FieldControl error={errors.branch}>
            <div ref={branchRef} className="relative">
              <DropdownTrigger
                value={branches.find((branch) => branch.value === values.branch)?.label ?? ""}
                placeholder="Chá»n chi nhÃ¡nh"
                isOpen={isBranchOpen}
                onClick={() => {
                  setIsBranchOpen((current) => !current);
                  setIsDateOpen(false);
                  setIsTimeOpen(false);
                }}
              />

              {isBranchOpen ? (
                <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-[18px] border border-black/10 bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
                  <div className="flex flex-col gap-2.5">
                    {branches.map((branch) => {
                      const isSelected = values.branch === branch.value;

                      return (
                        <button
                          key={branch.value}
                          type="button"
                          onClick={() => handleBranchSelect(branch.value)}
                          className="flex items-center gap-3 text-left text-sm text-black transition-colors"
                        >
                          <span
                            className={cn(
                              "h-5 w-5 rounded-full border border-black/80",
                              isSelected && "border-[6px] border-[#f15a42]",
                            )}
                          />
                          <span className={cn("leading-snug", isSelected && "font-medium")}>
                            {branch.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </FieldControl>
        </FieldRow>

        <FieldRow label="Ngày hẹn">
          <FieldControl error={errors.date}>
            <div ref={dateRef} className="relative">
              <DropdownTrigger
                value={formatDateInputLabel(selectedDate)}
                placeholder="Chọn ngày hẹn"
                isOpen={isDateOpen}
                onClick={() => {
                  setIsDateOpen((current) => !current);
                  setIsTimeOpen(false);
                }}
              />

              {isDateOpen ? (
                <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full max-w-[380px] overflow-hidden rounded-[18px] border border-black/10 bg-white p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
                  <div className="mb-3 grid grid-cols-[1fr_1fr] gap-2">
                    <SelectMini
                      value={String(visibleMonth.getMonth())}
                      onChange={(event) => handleMonthChange(Number(event.target.value))}
                    >
                      {MONTH_OPTIONS.map((label, index) => (
                        <option key={label} value={index}>
                          {label}
                        </option>
                      ))}
                    </SelectMini>
                    <SelectMini
                      value={String(visibleMonth.getFullYear())}
                      onChange={(event) => handleYearChange(Number(event.target.value))}
                    >
                      {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </SelectMini>
                  </div>

                  <div className="grid grid-cols-7 gap-y-2 text-center">
                    {WEEKDAY_LABELS.map((label) => (
                      <div key={label} className="text-xs font-bold">
                        {label}
                      </div>
                    ))}

                    {calendarDays.map((day) => {
                      const isSelected = day.value === values.date;

                      return (
                        <button
                          key={`${day.value}-${day.isCurrentMonth}`}
                          type="button"
                          disabled={day.isDisabled}
                          onClick={() => handleDateSelect(day.value)}
                          className={cn(
                            "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors",
                            day.isCurrentMonth ? "text-black" : "text-black/28",
                            day.isDisabled &&
                              "cursor-not-allowed bg-black/[0.04] text-black/20",
                            isSelected && "bg-[#f15a42] font-bold text-white",
                          )}
                        >
                          {day.dayNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </FieldControl>
        </FieldRow>

        <FieldRow label="Giờ hẹn">
          <FieldControl error={errors.timeSlot}>
            <div ref={timeRef} className="relative">
              <DropdownTrigger
                value={selectedTimeLabel}
                placeholder="Chọn giờ hẹn"
                isOpen={isTimeOpen}
                onClick={() => {
                  setIsTimeOpen((current) => !current);
                  setIsDateOpen(false);
                }}
              />

              {isTimeOpen ? (
                <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full max-w-[500px] overflow-hidden rounded-[18px] border border-black/10 bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    {orderedTimeSlots.map((slot) => {
                      const isSelected = values.timeSlot === slot.id;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={slot.isDisabled}
                          onClick={() => handleTimeSelect(slot.id)}
                          className={cn(
                            "flex items-center gap-2.5 text-left text-sm text-black transition-colors",
                            slot.isDisabled && "cursor-not-allowed text-black/25",
                            isSelected && "font-bold text-[#f15a42]",
                          )}
                        >
                          <span
                            className={cn(
                              "h-5 w-5 rounded-full border border-black/80",
                              slot.isDisabled && "border-black/20",
                              isSelected && "border-[6px] border-[#f15a42]",
                            )}
                          />
                          <span>{slot.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </FieldControl>
        </FieldRow>

        <FieldRow label="Ghi chú">
          <FieldControl error={errors.note}>
            <textarea
              name="note"
              value={values.note}
              onChange={(event) => update("note", event.target.value)}
              maxLength={200}
              placeholder="Ghi chú thêm cho Xéo Xọ (tối đa 200 ký tự)"
              rows={2}
              className="min-h-[3.125rem] w-full resize-none rounded-[18px] border border-black/40 bg-white px-3.5 py-2 text-sm font-light text-black outline-none transition-colors placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </FieldControl>
        </FieldRow>
      </div>

      <div className="-mx-6 -mb-4 mt-6 px-2 pb-4 sm:-mx-8">
        <div className="relative flex min-h-[96px] flex-col items-center justify-center gap-2 overflow-visible rounded-none px-4 py-4 text-center sm:min-h-[108px]">
          <div className="pointer-events-none absolute inset-x-0 top-[-22px] z-0 h-11 bg-white" />
          {submitted && showInlineSuccessMessage ? (
            <p className="text-body-sm font-medium text-white">Đã ghi nhận thông tin đặt lịch.</p>
          ) : null}
          {submitError ? (
            <p className="text-body-sm font-medium text-white">{submitError}</p>
          ) : null}
          <div
            className="relative z-10 flex w-[calc(100%+36px)] max-w-none justify-center rounded-none bg-cover bg-center px-10 py-5 sm:w-[calc(100%+48px)]"
            style={{ backgroundImage: "url(/images/bg-gia-nhap-btn.png)" }}
          >
            <Button
              type="submit"
              variant="outline"
              size="md"
              disabled={isSubmitting}
              className="h-9 w-full max-w-[260px] rounded-pill border-2 border-white bg-transparent px-5 text-base font-bold normal-case text-white hover:bg-white hover:text-black"
            >
              Đặt lịch
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid items-start gap-2 md:grid-cols-[11.5rem_minmax(0,1fr)] md:gap-3">
      <span className="pt-2 text-base font-bold leading-tight text-black">
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
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </div>
  );
}

function fieldInputClass(base: string, error?: string) {
  return cn(
    base,
    error && "border-red-500 text-red-700 focus:border-red-500 focus:ring-red-100",
  );
}

function DropdownTrigger({
  value,
  placeholder,
  isOpen,
  onClick,
}: {
  value: string;
  placeholder: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-pill border border-black/40 bg-white px-4 text-left text-sm transition-colors",
        isOpen && "border-black",
      )}
    >
      <span className={cn(value ? "text-black" : "text-black/35")}>
        {value || placeholder}
      </span>
      <span
        aria-hidden
        className={cn(
          "mb-[2px] mr-1 inline-block h-3 w-3 rotate-45 border-b-2 border-r-2 border-[#f15a42] transition-transform",
          isOpen && "translate-y-[1px] rotate-[225deg]",
        )}
      />
    </button>
  );
}

function SelectMini({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="h-9 rounded-[14px] border border-black/20 bg-white px-3 text-sm outline-none focus:border-black"
    >
      {children}
    </select>
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
        "h-9 rounded-pill border border-black/30 bg-white px-4 text-sm font-bold leading-none text-black transition-colors",
        active && "bg-black text-white",
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

function parseValueAsDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateInputLabel(date: Date) {
  return INPUT_DATE_FORMATTER.format(date);
}

function buildCalendarDays(month: Date, minValue: string) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startOffset = firstDay.getDay();
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const minDate = parseValueAsDate(minValue);

  return Array.from({ length: totalCells }, (_, index) => {
    const dayDate = new Date(firstDay);
    dayDate.setDate(index - startOffset + 1);
    const value = getLocalDateValue(dayDate);

    return {
      value,
      dayNumber: dayDate.getDate(),
      isCurrentMonth: dayDate.getMonth() === month.getMonth(),
      isDisabled: dayDate < minDate,
    };
  });
}

function validateField(
  key: keyof AppointmentValues,
  value: AppointmentValues[keyof AppointmentValues],
  formValues: AppointmentValues,
) {
  const text = String(value).trim();
  if (["fullName", "phone", "branch", "date", "timeSlot"].includes(key) && !text) {
    return "Vui lòng nhập thông tin này";
  }
  if (key === "fullName" && text.length < 2) {
    return "Họ và tên phải có ít nhất 2 ký tự";
  }
  if (key === "phone" && !/^(?:\+?84|0)\d{9}$/.test(text.replace(/\s/g, ""))) {
    return "Số điện thoại không hợp lệ";
  }
  if (key === "email" && text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return "Email không hợp lệ";
  }
  if (key === "date" && text && text < TODAY) {
    return "Ngày hẹn không được ở trong quá khứ";
  }
  if (key === "timeSlot" && text && isTimeSlotDisabled(formValues.date, text)) {
    return "Khung giá» nÃ y pháº£i Ä‘Æ°á»£c Ä‘áº·t trÆ°á»›c Ã­t nháº¥t 1 giá»";
  }
  return undefined;
}

function validateAppointment(values: AppointmentValues): AppointmentErrors {
  const errors: AppointmentErrors = {};
  (Object.keys(values) as Array<keyof AppointmentValues>).forEach((key) => {
    const error = validateField(key, values[key], values);
    if (error) errors[key] = error;
  });
  return errors;
}

function isTimeSlotDisabled(dateValue: string, timeValue: string, now = new Date()) {
  const appointmentDateTime = buildAppointmentDateTime(dateValue, timeValue);

  if (Number.isNaN(appointmentDateTime.getTime())) {
    return true;
  }

  return appointmentDateTime.getTime() - now.getTime() < 60 * 60 * 1000;
}

function buildAppointmentDateTime(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}
