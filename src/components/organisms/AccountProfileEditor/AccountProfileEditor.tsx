"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";
import { cn } from "@/lib/utils";
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

const BIRTHDAY_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

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

  return BIRTHDAY_FORMATTER.format(date);
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
    <div className="mt-6">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="max-w-[680px]">
          <div className="grid gap-4 md:grid-cols-2 md:gap-x-6">
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
              <input
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="form-control rounded-[14px]"
                placeholder="Nhập email"
                autoComplete="email"
                type="email"
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

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <Button
              type="submit"
              variant="solid"
              size="lg"
              isLoading={isSubmitting}
              className="h-11 w-full max-w-[300px] text-sm font-extrabold uppercase md:text-base"
            >
              Lưu thông tin
            </Button>
            <Button
              type="button"
              variant="secondaryPill"
              size="lg"
              disabled={isSubmitting}
              className="h-11 w-full max-w-[200px] text-sm font-bold md:text-base"
              onClick={handleCancel}
            >
              Hủy
            </Button>
          </div>
        </form>
      ) : (
        <>
          <dl className="grid gap-y-3 md:max-w-[680px] md:grid-cols-[160px_minmax(0,1fr)] md:gap-x-8">
            <ProfileRow
              label="Họ và tên:"
              value={getDisplayValue(displayValues.customer_name)}
              emphasizeValue
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

          <div className="mt-8">
            <Button
              type="button"
              variant="solid"
              size="lg"
              className="h-11 w-full max-w-[460px] text-sm font-extrabold uppercase md:text-base"
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
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-extrabold">{label}</span>
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
    <div className="rounded-[12px] border border-black/10 bg-secondary px-4 py-2.5">
      <p className="text-sm font-medium text-black">{value}</p>
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
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    selectedDate ?? new Date(2000, 0, 1),
  );
  const today = useMemo(() => new Date(), []);
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const currentYear = today.getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1940 + 1 },
    (_, index) => currentYear - index,
  );

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

  function handleSelect(date: Date) {
    onChange(formatDateValue(date));
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setIsOpen(false);
  }

  function handleToggle() {
    setVisibleMonth(
      selectedDate ??
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1),
    );
    setIsOpen((current) => !current);
  }

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-[14px] border border-black/40 bg-white px-4 text-left text-sm transition-colors",
          isOpen && "border-black",
        )}
        aria-label="Mở lịch chọn ngày sinh"
      >
        <span className={cn(value ? "text-black" : "text-black/35")}>
          {formatBirthdayLabel(value)}
        </span>
        <span
          aria-hidden
          className={cn(
            "mb-[2px] mr-1 inline-block h-3 w-3 rotate-45 border-b-2 border-r-2 border-[#f15a42] transition-transform",
            isOpen && "translate-y-[1px] rotate-[225deg]",
          )}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full max-w-[380px] overflow-hidden rounded-[18px] border border-black/10 bg-white p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
          <div className="mb-3 grid grid-cols-[1fr_1fr] gap-2">
            <select
              value={String(visibleMonth.getMonth())}
              onChange={(event) =>
                setVisibleMonth((current) =>
                  clampDateToMonth(
                    current.getFullYear(),
                    Number(event.target.value),
                    selectedDate?.getDate() ?? 1,
                  ),
                )
              }
              className="h-9 rounded-[14px] border border-black/20 bg-white px-3 text-sm outline-none focus:border-black"
            >
              {MONTH_LABELS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={String(visibleMonth.getFullYear())}
              onChange={(event) =>
                setVisibleMonth((current) =>
                  clampDateToMonth(
                    Number(event.target.value),
                    current.getMonth(),
                    selectedDate?.getDate() ?? 1,
                  ),
                )
              }
              className="h-9 rounded-[14px] border border-black/20 bg-white px-3 text-sm outline-none focus:border-black"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-xs font-bold uppercase tracking-[0.12em] text-foreground/45"
              >
                {label}
              </div>
            ))}
            {calendarDays.map(({ date, isCurrentMonth }) => {
              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
              const isToday = isSameDay(date, today);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleSelect(date)}
                  className={cn(
                    "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors",
                    isCurrentMonth ? "text-black" : "text-black/28",
                    isSelected && "bg-[#f15a42] font-bold text-white",
                    isToday && !isSelected && "border border-black/20",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="text-xs font-medium text-foreground/62 transition-colors hover:text-foreground"
            >
              Xóa ngày
            </button>
            <button
              type="button"
              onClick={() => handleSelect(today)}
              className="rounded-full border border-black px-4 py-2 text-xs font-bold transition-colors hover:bg-black hover:text-white"
            >
              Hôm nay
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProfileRow({
  label,
  value,
  emphasizeValue = false,
}: {
  label: string;
  value: string;
  emphasizeValue?: boolean;
}) {
  return (
    <div className="contents">
      <dt className="text-[15px] font-semibold text-foreground/88 md:text-base">
        {label}
      </dt>
      <dd
        className={cn(
          "text-[15px] text-foreground/82 md:text-base",
          emphasizeValue ? "font-semibold text-foreground" : "font-normal",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
