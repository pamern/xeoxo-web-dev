"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";
import type { AuthCustomer, AuthUser } from "@/types/auth.types";
import type {
  CustomerGender,
  UpdateCustomerProfileValues,
} from "@/types/customer.types";

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_LABELS = [
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

const MONTH_SHORT_LABELS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

function getDisplayValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : "Chưa cập nhật";
}

function mapGenderLabel(gender?: string | null) {
  switch (gender) {
    case "MALE":
      return "Nam";
    case "FEMALE":
      return "Nữ";
    case "OTHER":
      return "Khác";
    default:
      return "Chưa cập nhật";
  }
}

function parseDateValue(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatBirthdayLabel(value: string) {
  const date = parseDateValue(value);

  if (!date) {
    return "Chọn ngày sinh";
  }

  return date.toLocaleDateString("vi-VN");
}

function clampDateToMonth(year: number, month: number, day: number) {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDayOfMonth));
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const trailingDays = 6 - ((lastDay.getDay() + 6) % 7);
  const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  for (let index = leadingDays; index > 0; index -= 1) {
    days.push({
      date: new Date(year, month, 1 - index),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }

  for (let day = 1; day <= trailingDays; day += 1) {
    days.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
    });
  }

  return days;
}

function createInitialValues(
  user: AuthUser | null,
  customer: AuthCustomer | null,
): UpdateCustomerProfileValues {
  return {
    customer_name:
      customer?.customer_name?.trim() || user?.fullName?.trim() || "",
    email: customer?.email?.trim() || user?.email?.trim() || "",
    phone: customer?.phone?.trim() || "",
    gender: (customer?.gender as CustomerGender | null) ?? "",
    birthday: customer?.birthday ?? "",
  };
}

export function AccountProfileEditor({
  user,
  customer: initialCustomer,
}: {
  user: AuthUser | null;
  customer: AuthCustomer | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<UpdateCustomerProfileValues>(
    createInitialValues(user, initialCustomer),
  );
  const {
    customer,
    isSubmitting,
    errorMessage,
    successMessage,
    updateProfile,
  } = useCustomerProfile(initialCustomer);

  const currentCustomer = customer ?? initialCustomer;
  const displayValues = {
    customer_name:
      currentCustomer?.customer_name || user?.fullName || user?.email || "",
    phone: currentCustomer?.phone || "",
    gender: currentCustomer?.gender || "",
    email: currentCustomer?.email || user?.email || "",
    birthday: currentCustomer?.birthday || "",
  };

  function updateField<K extends keyof UpdateCustomerProfileValues>(
    key: K,
    nextValue: UpdateCustomerProfileValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: nextValue,
    }));
  }

  function handleCancel() {
    setValues(createInitialValues(user, currentCustomer));
    setIsEditing(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await updateProfile(values);

    if (result.ok) {
      setValues(createInitialValues(user, result.customer ?? currentCustomer));
      setIsEditing(false);
    }
  }

  return (
    <div className="mt-8">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="max-w-[760px]">
          <div className="grid gap-5 md:grid-cols-2 md:gap-x-8">
            <Field label="Họ và tên">
              <input
                value={values.customer_name}
                onChange={(event) =>
                  updateField("customer_name", event.target.value)
                }
                className="form-control rounded-[14px]"
                placeholder="Nhập họ và tên"
                autoComplete="name"
              />
            </Field>

            <Field label="Số điện thoại">
              <input
                value={values.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="form-control rounded-[14px]"
                placeholder="Nhập số điện thoại"
                autoComplete="tel"
              />
            </Field>

            <Field label="Email">
              <ReadOnlyFieldValue
                value={getDisplayValue(displayValues.email)}
              />
            </Field>

            <Field label="Giới tính">
              <select
                value={values.gender}
                onChange={(event) =>
                  updateField(
                    "gender",
                    event.target.value as UpdateCustomerProfileValues["gender"],
                  )
                }
                className="form-control rounded-[14px]"
              >
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </Field>

            <Field label="Ngày sinh">
              <BirthdayPicker
                value={values.birthday}
                onChange={(nextValue) => updateField("birthday", nextValue)}
              />
            </Field>
          </div>

          {errorMessage ? (
            <p className="mt-5 text-sm font-medium text-destructive">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="mt-5 text-sm font-medium text-foreground/72">
              {successMessage}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <Button
              type="submit"
              variant="solid"
              size="lg"
              isLoading={isSubmitting}
              className="h-[54px] w-full max-w-[360px] text-base font-extrabold uppercase md:text-[18px]"
            >
              Lưu thông tin
            </Button>
            <Button
              type="button"
              variant="secondaryPill"
              size="lg"
              disabled={isSubmitting}
              className="h-[54px] w-full max-w-[240px] text-base font-bold md:text-[18px]"
              onClick={handleCancel}
            >
              Hủy
            </Button>
          </div>
        </form>
      ) : (
        <>
          <dl className="grid gap-y-4 md:max-w-[760px] md:grid-cols-[190px_minmax(0,1fr)] md:gap-x-12">
            <ProfileRow
              label="Họ và tên:"
              value={getDisplayValue(displayValues.customer_name)}
            />
            <ProfileRow
              label="Số điện thoại:"
              value={getDisplayValue(displayValues.phone)}
            />
            <ProfileRow
              label="Giới tính:"
              value={mapGenderLabel(displayValues.gender)}
            />
            <ProfileRow
              label="Email"
              value={getDisplayValue(displayValues.email)}
            />
            <ProfileRow
              label="Ngày sinh:"
              value={getDisplayValue(displayValues.birthday)}
            />
          </dl>

          {successMessage ? (
            <p className="mt-5 text-sm font-medium text-foreground/72">
              {successMessage}
            </p>
          ) : null}

          <div className="mt-10">
            <Button
              type="button"
              variant="solid"
              size="lg"
              className="h-[54px] w-full max-w-[560px] text-base font-extrabold uppercase md:text-[18px]"
              onClick={() => setIsEditing(true)}
            >
              Cập nhật thông tin cá nhân
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-base font-extrabold">{label}</span>
      {children}
    </label>
  );
}

function ReadOnlyFieldValue({
  value,
  helperText,
}: {
  value: string;
  helperText?: string;
}) {
  return (
    <div className="rounded-[14px] border border-black/10 bg-secondary px-4 py-3">
      <p className="text-base font-medium text-black">{value}</p>
      {helperText ? (
        <p className="mt-1 text-xs font-medium text-black/55">{helperText}</p>
      ) : null}
    </div>
  );
}

function BirthdayPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const selectedDate = parseDateValue(value);
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    selectedDate ?? new Date(2000, 0, 1),
  );
  const today = useMemo(() => new Date(), []);
  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const yearRangeStart = Math.floor(visibleMonth.getFullYear() / 12) * 12;
  const yearOptions = Array.from({ length: 12 }, (_, index) => yearRangeStart + index);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !pickerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function moveMonth(offset: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function moveYearRange(offset: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear() + offset * 12, current.getMonth(), 1),
    );
  }

  function handleSelect(date: Date) {
    onChange(formatDateValue(date));
    setInputValue(formatDateValue(date));
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setViewMode("days");
    setIsOpen(false);
  }

  function handleManualInput(nextValue: string) {
    setInputValue(nextValue);
  }

  function commitManualInput() {
    const normalizedValue = inputValue.trim();

    if (!normalizedValue) {
      onChange("");
      setInputValue("");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
      setInputValue(value);
      return;
    }

    const parsedDate = parseDateValue(normalizedValue);

    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      setInputValue(value);
      return;
    }

    onChange(formatDateValue(parsedDate));
    setInputValue(formatDateValue(parsedDate));
    setVisibleMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
  }

  function handleToggle() {
    setVisibleMonth(
      selectedDate ??
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1),
    );
    setViewMode("days");
    setIsOpen((current) => !current);
  }

  return (
    <div ref={pickerRef} className="relative">
      <div className="flex gap-3">
        <input
          value={inputValue}
          onChange={(event) => handleManualInput(event.target.value)}
          onBlur={commitManualInput}
          placeholder="YYYY-MM-DD"
          inputMode="numeric"
          className="form-control h-[54px] rounded-[14px]"
        />
        <button
          type="button"
          onClick={handleToggle}
          className="form-control flex h-[54px] w-[60px] shrink-0 items-center justify-center rounded-[14px] px-0 text-left"
          aria-label="Mở lịch chọn ngày sinh"
        >
          <span className="text-lg text-foreground/60">{isOpen ? "−" : "+"}</span>
        </button>
      </div>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+12px)] z-20 w-[340px] rounded-[24px] border border-black/8 bg-white p-5 shadow-[0_22px_60px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                viewMode === "days" ? moveMonth(-1) : moveYearRange(-1)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-xl transition-colors hover:bg-secondary"
              aria-label={viewMode === "days" ? "Tháng trước" : "Nhóm năm trước"}
            >
              ‹
            </button>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">
                Ngày sinh
              </p>
              <button
                type="button"
                onClick={() =>
                  setViewMode((current) =>
                    current === "days" ? "months" : "years",
                  )
                }
                className="mt-1 text-base font-extrabold transition-opacity hover:opacity-70"
              >
                {viewMode === "years"
                  ? `${yearRangeStart} - ${yearRangeStart + 11}`
                  : `${MONTH_LABELS[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`}
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                viewMode === "days" ? moveMonth(1) : moveYearRange(1)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-xl transition-colors hover:bg-secondary"
              aria-label={viewMode === "days" ? "Tháng sau" : "Nhóm năm sau"}
            >
              ›
            </button>
          </div>

          {viewMode === "days" ? (
            <div className="mt-5 grid grid-cols-7 gap-2 text-center">
              {WEEKDAY_LABELS.map((label) => (
                <span
                  key={label}
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/45"
                >
                  {label}
                </span>
              ))}
              {calendarDays.map(({ date, isCurrentMonth }) => {
                const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                const isToday = isSameDay(date, today);

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => handleSelect(date)}
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-black text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                        : isCurrentMonth
                          ? "text-foreground hover:bg-secondary"
                          : "text-foreground/28 hover:bg-secondary/70",
                      isToday && !isSelected ? "border border-black/20" : "",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          ) : null}

          {viewMode === "months" ? (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {MONTH_SHORT_LABELS.map((label, monthIndex) => {
                const isSelected =
                  selectedDate &&
                  selectedDate.getFullYear() === visibleMonth.getFullYear() &&
                  selectedDate.getMonth() === monthIndex;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const baseDay = selectedDate?.getDate() ?? 1;
                      setVisibleMonth(
                        clampDateToMonth(
                          visibleMonth.getFullYear(),
                          monthIndex,
                          baseDay,
                        ),
                      );
                      setViewMode("days");
                    }}
                    className={[
                      "rounded-[14px] px-3 py-3 text-sm font-semibold transition-colors",
                      isSelected
                        ? "bg-black text-white"
                        : "border border-black/10 bg-white text-black hover:bg-secondary",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {viewMode === "years" ? (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {yearOptions.map((year) => {
                const isSelected = selectedDate?.getFullYear() === year;

                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      const baseDay = selectedDate?.getDate() ?? 1;
                      setVisibleMonth(
                        clampDateToMonth(year, visibleMonth.getMonth(), baseDay),
                      );
                      setViewMode("months");
                    }}
                    className={[
                      "rounded-[14px] px-3 py-3 text-sm font-semibold transition-colors",
                      isSelected
                        ? "bg-black text-white"
                        : "border border-black/10 bg-white text-black hover:bg-secondary",
                    ].join(" ")}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setInputValue("");
                setViewMode("days");
                setIsOpen(false);
              }}
              className="text-sm font-medium text-foreground/62 transition-colors hover:text-foreground"
            >
              Xóa ngày
            </button>
            <button
              type="button"
              onClick={() => handleSelect(today)}
              className="rounded-full border border-black px-4 py-2 text-sm font-bold transition-colors hover:bg-black hover:text-white"
            >
              Hôm nay
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="contents">
      <dt className="text-lg font-extrabold md:text-[18px]">{label}</dt>
      <dd className="text-lg font-medium text-foreground/88 md:text-[18px]">
        {value}
      </dd>
    </div>
  );
}
