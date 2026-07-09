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
        <form onSubmit={handleSubmit} className="max-w-form">
          <div className="grid gap-5 md:grid-cols-2 md:gap-x-8">
            <Field label="Họ và tên">
              <input
                value={values.customer_name}
                onChange={(event) =>
                  updateField("customer_name", event.target.value)
                }
                className="form-control rounded-card"
                placeholder="Nhập họ và tên"
                autoComplete="name"
              />
            </Field>

            <Field label="Số điện thoại">
              <input
                value={values.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="form-control rounded-card"
                placeholder="Nhập số điện thoại"
                autoComplete="tel"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="form-control rounded-card"
                placeholder="Nhập email"
                autoComplete="email"
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
                className="form-control rounded-card"
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
            <p className="mt-5 text-body-sm font-medium text-destructive">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="mt-5 text-body-sm font-medium text-foreground/72">
              {successMessage}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <Button
              type="submit"
              variant="solid"
              size="lg"
              isLoading={isSubmitting}
              className="h-control w-full max-w-[360px] text-heading-content-sm font-extrabold uppercase"
            >
              Lưu thông tin
            </Button>
            <Button
              type="button"
              variant="secondaryPill"
              size="lg"
              disabled={isSubmitting}
              className="h-control w-full max-w-[240px] text-heading-content-sm font-bold"
              onClick={handleCancel}
            >
              Hủy
            </Button>
          </div>
        </form>
      ) : (
        <>
          <dl className="grid gap-y-4 md:max-w-form md:grid-cols-[190px_minmax(0,1fr)] md:gap-x-12">
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
            <p className="mt-5 text-body-sm font-medium text-foreground/72">
              {successMessage}
            </p>
          ) : null}

          <div className="mt-10">
            <Button
              type="button"
              variant="solid"
              size="lg"
              className="h-control w-full max-w-[560px] text-heading-content-sm font-extrabold uppercase"
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
      <span className="text-heading-content-sm font-extrabold">{label}</span>
      {children}
    </label>
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
  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth],
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

  function moveMonth(offset: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

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
        className="form-control flex h-control items-center justify-between rounded-card text-left"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {formatBirthdayLabel(value)}
        </span>
        <span className="text-heading-card text-foreground/60">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+12px)] z-20 w-[320px] rounded-[24px] border border-black/8 bg-white p-5 shadow-[0_22px_60px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-heading-card transition-colors hover:bg-secondary"
              aria-label="Tháng trước"
            >
              ‹
            </button>
            <div className="text-center">
              <p className="text-caption font-medium uppercase tracking-[0.18em] text-foreground/45">
                Ngày sinh
              </p>
              <p className="mt-1 text-heading-content-sm font-extrabold">
                {MONTH_LABELS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-heading-card transition-colors hover:bg-secondary"
              aria-label="Tháng sau"
            >
              ›
            </button>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 text-center">
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="text-caption font-bold uppercase tracking-[0.12em] text-foreground/45"
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
                    "flex h-10 w-10 items-center justify-center rounded-full text-body-sm font-medium transition-colors",
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

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="text-body-sm font-medium text-foreground/62 transition-colors hover:text-foreground"
            >
              Xóa ngày
            </button>
            <button
              type="button"
              onClick={() => handleSelect(today)}
              className="rounded-full border border-black px-4 py-2 text-button-sm transition-colors hover:bg-black hover:text-white"
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
      <dt className="text-heading-content-sm font-extrabold">{label}</dt>
      <dd className="text-body-lg font-medium text-foreground/88">
        {value}
      </dd>
    </div>
  );
}
