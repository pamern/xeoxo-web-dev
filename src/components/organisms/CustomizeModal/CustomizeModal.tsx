"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import {
  getMeasurementFields,
  MEASUREMENT_FIELDS,
  type MeasurementComponentType,
  type MeasurementKey,
  type MeasurementValues,
} from "@/features/size-recommendation/size-recommendation";
import { formatPrice, cn } from "@/lib/utils";
import type { Gender } from "@/types/product.types";
import {
  validateMeasurementField,
  validateMeasurements,
  type MeasurementErrors,
} from "@/validations/size-recommendation.schema";
import { saveProfile } from "@/services/measurement.service";

function parseMeasurementValues(values: MeasurementValues) {
  const parsed: Record<string, number> = {};
  for (const [key, val] of Object.entries(values)) {
    if (val !== undefined && val !== null && val !== "") {
      const num = parseFloat(String(val));
      if (!isNaN(num)) {
        parsed[key] = num;
      }
    }
  }
  return parsed;
}

const EMPTY_VALUES = Object.fromEntries(
  MEASUREMENT_FIELDS.map((field) => [field.key, ""]),
) as MeasurementValues;

export function CustomizeModal({
  gender,
  componentType,
  initialValues,
  canPersistMeasurements = false,
  hasPersistedMeasurements = false,
  basePrice,
  onClose,
  onClearMeasurements,
  onValuesChange,
  onSubmit,
}: {
  gender: Gender;
  componentType?: MeasurementComponentType;
  initialValues?: Partial<MeasurementValues>;
  canPersistMeasurements?: boolean;
  hasPersistedMeasurements?: boolean;
  basePrice: number;
  onClose: () => void;
  onClearMeasurements?: () => void;
  onValuesChange?: (values: MeasurementValues) => void;
  onSubmit: (values: MeasurementValues, note: string, saveAsDefault: boolean) => void;
}) {
  const [values, setValues] = useState<MeasurementValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<MeasurementErrors>({});
  const [touched, setTouched] = useState<Partial<Record<MeasurementKey, boolean>>>({});
  const [note, setNote] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const fields = getMeasurementFields(gender, componentType);
  const genderLabel = gender === "nam" ? "Nam" : "Nữ";
  const customPrice = basePrice * 1.2;

  useEffect(() => {
    setIsSaved(hasPersistedMeasurements);
  }, [hasPersistedMeasurements]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    setValues({
      ...EMPTY_VALUES,
      ...initialValues,
    });
  }, [initialValues]);

  function update(key: MeasurementKey, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    onValuesChange?.(next);
    setSubmitted(false);
    setIsSaved(false);
    setSaveAsDefault(false);
    setSaveMessage(null);
    setTouched((current) => ({ ...current, [key]: true }));
    setErrors((current) => {
      const error = validateMeasurementField(key, value, gender, componentType);
      if (error) {
        return { ...current, [key]: error };
      } else {
        const nextErr = { ...current };
        delete nextErr[key];
        return nextErr;
      }
    });
  }

  async function handleSaveToDbOrLocal() {
    setSaveMessage(null);
    setIsSaving(true);
    try {
      const filteredValues = Object.fromEntries(
        fields.map((field) => [field.key, values[field.key] ?? ""])
      ) as MeasurementValues;

      const parsed = parseMeasurementValues(filteredValues);

      if (canPersistMeasurements) {
        await saveProfile({ measurements: parsed });
        onValuesChange?.(filteredValues);
        setSaveMessage("Đã lưu số đo vào tài khoản.");
      } else {
        onValuesChange?.(filteredValues);
        setSaveMessage("Đã lưu số đo vào trình duyệt.");
      }
      setSaveAsDefault(true);
      setIsSaved(true);
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Không thể lưu số đo."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateMeasurements(values, gender, componentType);
    setTouched(Object.fromEntries(fields.map((field) => [field.key, true])));
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitted(true);

    const filteredValues = Object.fromEntries(
      fields.map((field) => [field.key, values[field.key] ?? ""])
    ) as MeasurementValues;

    onSubmit(filteredValues, note, canPersistMeasurements && saveAsDefault);
  }

  function handleClear() {
    setValues(EMPTY_VALUES);
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setSaveAsDefault(false);
    setIsSaved(false);
    setSaveMessage(null);
    onValuesChange?.(EMPTY_VALUES);
    onClearMeasurements?.();
  }

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 p-3 backdrop-blur-[1px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-title"
        className="relative max-h-[94dvh] w-full max-w-[1240px] overflow-y-auto rounded-[20px] bg-white px-5 pb-7 pt-6 sm:px-9 sm:pt-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng đặt đồ Customize"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white transition hover:bg-black/5 sm:right-5 sm:top-5"
        >
          <Image src="/icons/close-black.svg" alt="" width={44} height={44} aria-hidden />
        </button>

        <header className="border-b border-black/20 pb-5 pr-12">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#f15a42]">
            Xéo Xọ Customize {genderLabel}
          </p>
          <h2 id="customize-title" className="mt-1 text-2xl font-bold sm:text-[32px]">
            Đặt sản phẩm theo số đo riêng
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/60">
            Vui lòng điền đúng và đầy đủ các số đo để Xéo Xọ chuẩn bị sản phẩm vừa vặn với bạn.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <div className="grid gap-x-7 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => {
              const error = errors[field.key];
              return (
                <label key={field.key} className="flex flex-col gap-1.5">
                  <span className={cn("text-sm font-bold", error && "text-red-600")}>
                    {field.label}<span className="ml-1 text-[#f15a42]">*</span>
                  </span>
                  <span className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={values[field.key]}
                      onChange={(event) => update(field.key, event.target.value)}
                      onBlur={() => {
                        setTouched((current) => ({ ...current, [field.key]: true }));
                        setErrors((current) => ({
                          ...current,
                          [field.key]: validateMeasurementField(
                            field.key,
                            values[field.key],
                            gender,
                            componentType,
                            false,
                          ),
                        }));
                      }}
                      aria-invalid={Boolean(error)}
                      placeholder={`Nhập ${field.label.toLowerCase()}`}
                      className={cn(
                        "h-12 w-full rounded-[12px] border bg-white px-4 pr-12 text-base outline-none transition focus:ring-2",
                        error
                          ? "border-red-500 text-red-700 focus:ring-red-100"
                          : "border-black/30 focus:border-black focus:ring-black/10",
                      )}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-black/35">
                      {field.unit}
                    </span>
                  </span>
                  {error && <span className="text-xs font-medium text-red-600">{error}</span>}
                </label>
              );
            })}
          </div>

          <label className="mt-6 flex flex-col gap-1.5">
            <span className="text-sm font-bold">Ghi chú cho Xéo Xọ</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 500))}
              maxLength={500}
              rows={4}
              placeholder="Mô tả mong muốn về độ ôm, chiều dài hoặc chi tiết cần lưu ý..."
              className="w-full resize-none rounded-[12px] border border-black/30 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            />
            <span className="self-end text-xs text-black/45">{note.length}/500 ký tự</span>
          </label>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClear}
              title="Xóa số đo"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-white text-black transition hover:border-black hover:bg-black hover:text-white focus:outline-none"
            >
              <Image src="/icons/xoa.svg" alt="Xóa" width={16} height={16} className="transition group-hover:invert" />
            </button>
            <button
              type="button"
              onClick={handleSaveToDbOrLocal}
              disabled={isSaving}
              title={isSaved ? "Đã lưu số đo" : "Lưu lại số đo"}
              className={cn(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-white text-black transition hover:border-black hover:bg-black hover:text-white focus:outline-none",
                isSaved
                  ? "border-black/40"
                  : ""
              )}
            >
              {isSaving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isSaved ? (
                <SavedIcon />
              ) : (
                <SaveIcon />
              )}
              {saveMessage && (
                <span
                  role="status"
                  className={cn(
                    "absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[6px] border bg-white px-2.5 py-1 text-xs font-semibold shadow-sm",
                    isSaved ? "border-black/20 text-black" : "border-red-200 text-red-600",
                  )}
                >
                  {isSaved ? "Đã lưu" : saveMessage}
                </span>
              )}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[14px] border border-[#f15a42]/35 bg-[#fff4ee] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#f15a42]">Chi phí Customize</p>
              <p className="mt-2 text-sm leading-relaxed text-black/70">
                Sản phẩm được may theo số đo cá nhân sẽ thu thêm 20% giá sản phẩm. Mức giá được cập nhật khi bạn chọn chế độ này.
              </p>
              <p className="mt-3 text-lg font-bold">
                Giá dự kiến: {formatPrice(customPrice)}
              </p>
            </div>
            <div className="rounded-[14px] border border-black/15 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.08em]">Lưu ý quan trọng</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-black/70">
                <li>Sản phẩm Customize theo số đo cá nhân không áp dụng đổi trả.</li>
                <li>Thời gian may dự kiến khoảng 15 ngày làm việc, không tính thứ Bảy, Chủ nhật, ngày lễ và thời gian giao hàng.</li>
              </ul>
            </div>
          </div>

          <div
            className="mt-7 flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-[14px] bg-cover bg-center px-5 py-4 text-center"
            style={{ backgroundImage: "url(/images/bg-gia-nhap-btn.png)" }}
          >
            {submitted && <p className="text-sm font-medium text-white">Đã ghi nhận thông tin Customize.</p>}
            <Button
              type="submit"
              variant="outline"
              size="md"
              disabled={submitted}
              className="h-12 w-auto min-w-[240px] rounded-pill border border-white bg-transparent px-8 text-base font-bold text-white hover:bg-white hover:text-black"
            >
              Xác nhận Customize
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function SaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 3h12l2 2v16H5V3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 3v6h8V3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 21v-7h8v7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SavedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 3h12l2 2v16H5V3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 3v6h8V3" stroke="currentColor" strokeWidth="2" />
      <path d="m8 16 2.2 2.2L16 12.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
