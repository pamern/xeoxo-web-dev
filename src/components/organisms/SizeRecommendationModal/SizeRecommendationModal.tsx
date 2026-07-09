"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import {
  getSizeChart,
  getMeasurementFields,
  MEASUREMENT_FIELDS,
  recommendSize,
  type MeasurementKey,
  type MeasurementValues,
  type MeasurementComponentType,
} from "@/features/size-recommendation/size-recommendation";
import { cn } from "@/lib/utils";
import type { ProductSizeOptionDto } from "@/types/product-api.types";
import type { Gender } from "@/types/product.types";
import {
  validateMeasurements,
  validateMeasurementField,
  type MeasurementErrors,
} from "@/validations/size-recommendation.schema";

const EMPTY_VALUES = Object.fromEntries(
  MEASUREMENT_FIELDS.map((field) => [field.key, ""]),
) as MeasurementValues;

type Recommendation = {
  size: string | null;
  confidence: "high" | "reference";
  isOffered: boolean;
  isAvailable: boolean;
};

export function SizeRecommendationModal({
  gender,
  componentType,
  sizes,
  initialValues,
  canPersistMeasurements = false,
  hasPersistedMeasurements = false,
  onClearMeasurements,
  onPersistMeasurements,
  onOpenAppointment,
  onOpenCustomize,
  onValuesChange,
  onClose,
}: {
  gender: Gender;
  componentType?: MeasurementComponentType;
  sizes: ProductSizeOptionDto[];
  initialValues?: Partial<MeasurementValues>;
  canPersistMeasurements?: boolean;
  hasPersistedMeasurements?: boolean;
  onClearMeasurements?: () => void;
  onPersistMeasurements?: (values: MeasurementValues) => Promise<void> | void;
  onOpenAppointment: () => void;
  onOpenCustomize: () => void;
  onValuesChange?: (values: MeasurementValues) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<MeasurementValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<MeasurementErrors>({});
  const [touched, setTouched] = useState<Partial<Record<MeasurementKey, boolean>>>({});
  const [result, setResult] = useState<Recommendation | null>(null);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [persistError, setPersistError] = useState<string>();
  const [isPersisting, setIsPersisting] = useState(false);
  const chart = getSizeChart(gender);
  const fields = getMeasurementFields(gender, componentType);
  const genderLabel = gender === "nam" ? "Nam" : "Nữ";

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

  useEffect(() => {
    setSaveAsDefault(hasPersistedMeasurements);
  }, [hasPersistedMeasurements]);

  function update(key: MeasurementKey, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    onValuesChange?.(next);
    setResult(null);
    setPersistError(undefined);
    if (touched[key]) {
      const error = validateMeasurementField(key, value, gender, componentType);
      setErrors((current) => ({ ...current, [key]: error }));
    }
  }

  function handleBlur(key: MeasurementKey) {
    setTouched((current) => ({ ...current, [key]: true }));
    const error = validateMeasurementField(key, values[key], gender, componentType);
    setErrors((current) => ({ ...current, [key]: error }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateMeasurements(values, gender, componentType);
    setTouched(Object.fromEntries(fields.map((field) => [field.key, true])));
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const recommendation = recommendSize(gender, values);
    const matchingVariant = sizes.find(
      (size) => size.size_name.trim().toUpperCase() === recommendation.size,
    );
    setResult({
      ...recommendation,
      isOffered: Boolean(matchingVariant),
      isAvailable: Boolean(matchingVariant?.is_available),
    });

    if (canPersistMeasurements && saveAsDefault && onPersistMeasurements) {
      setIsPersisting(true);
      setPersistError(undefined);
      try {
        await onPersistMeasurements(values);
      } catch (error) {
        setPersistError(
          error instanceof Error ? error.message : "Không thể lưu số đo mặc định.",
        );
      } finally {
        setIsPersisting(false);
      }
    }
  }

  function handleClear() {
    setValues(EMPTY_VALUES);
    setErrors({});
    setTouched({});
    setResult(null);
    setPersistError(undefined);
    onValuesChange?.(EMPTY_VALUES);
    onClearMeasurements?.();
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-3 backdrop-blur-[1px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-recommendation-title"
        className="relative max-h-[94dvh] w-full max-w-[1240px] overflow-y-auto rounded-[20px] bg-white px-5 pb-7 pt-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:px-9 sm:pt-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hướng dẫn chọn size"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white transition hover:bg-black/5 sm:right-5 sm:top-5"
        >
          <Image src="/icons/close-black.svg" alt="" width={44} height={44} aria-hidden />
        </button>

        <header className="border-b border-black/20 pb-5 pr-12">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#f15a42]">Xéo Xọ tư vấn size {genderLabel}</p>
          <h2 id="size-recommendation-title" className="mt-1 text-2xl font-bold sm:text-[32px]">
            Hướng dẫn chọn size
          </h2>
          <p className="mt-2 max-w-[760px] text-sm leading-relaxed text-black/60">
            Điền càng đầy đủ số đo, kết quả gợi ý càng chính xác.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <div className="grid gap-x-7 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => {
              const error = errors[field.key];
              const errorId = `${field.key}-error`;
              return (
                <label key={field.key} className="flex flex-col gap-1.5">
                  <span className={cn("text-sm font-bold", error && "text-red-600")}>
                    {field.label}{field.required && <span className="ml-1 text-[#f15a42]">*</span>}
                  </span>
                  <span className="relative">
                    <input
                      name={field.key}
                      type="text"
                      inputMode="decimal"
                      value={values[field.key]}
                      onChange={(event) => update(field.key, event.target.value)}
                      onBlur={() => handleBlur(field.key)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? errorId : undefined}
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
                  {error && (
                    <span id={errorId} role="alert" className="text-xs font-medium text-red-600">
                      {error}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button type="submit" variant="primaryPill" size="pill" className="bg-black text-white hover:bg-black/80">
              {isPersisting ? "Đang lưu..." : "Tính size phù hợp"}
            </Button>
            {canPersistMeasurements && (
              <span className="ml-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  title="Xóa dữ liệu đang nhập trên giao diện"
                  aria-label="Xóa dữ liệu đang nhập trên giao diện"
                  className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/20 bg-white transition hover:border-black hover:bg-black hover:text-white"
                >
                  <Image src="/icons/xoa.svg" alt="" width={17} height={17} className="transition group-hover:invert" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setSaveAsDefault((current) => !current)}
                  title="Lưu lại để sử dụng lần sau"
                  className={cn(
                    "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/20 bg-white text-black transition hover:border-black hover:bg-black hover:text-white",
                    saveAsDefault && "border-black/40",
                  )}
                >
                  {saveAsDefault ? <SavedIcon /> : <SaveIcon />}
                </button>
              </span>
            )}
          </div>
          {persistError && (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
              {persistError}
            </p>
          )}
        </form>

        <div aria-live="polite" className="mt-6">
          {result && result.size && result.isAvailable && (
            <div className="rounded-[14px] border border-emerald-300 bg-emerald-50 p-5">
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  {result.confidence === "high" ? "Độ phù hợp cao" : "Kết quả tham khảo"}
                </p>
                <p className="mt-1 text-xl font-bold">Size phù hợp với bạn: {result.size}</p>
                {result.confidence === "reference" && (
                  <p className="mt-1 text-sm text-black/60">Hãy bổ sung số đo cơ thể để tăng độ chính xác.</p>
                )}
              </div>
            </div>
          )}
          {result && result.size && result.isOffered && !result.isAvailable && (
            <div className="rounded-[14px] border border-[#f15a42]/40 bg-[#fff0e8] p-5">
              <p className="text-lg font-bold">Size {result.size} hiện đang hết hàng</p>
              <p className="mt-1 text-sm text-black/65">Đây là size phù hợp với số đo của bạn, nhưng sản phẩm hiện chưa còn size này.</p>
            </div>
          )}
          {result && (!result.size || !result.isOffered) && (
            <div className="rounded-[14px] border border-[#f15a42]/40 bg-[#fff0e8] p-5">
              <p className="text-sm leading-relaxed text-black/75">
                Sản phẩm chưa có size phù hợp với số đo của bạn. Bạn có thể đặt
                sản phẩm được Customize theo số đo riêng{" "}
                <button
                  type="button"
                  onClick={onOpenCustomize}
                  className="font-bold text-black underline underline-offset-4 hover:text-black/65"
                >
                  tại đây
                </button>
                .
              </p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-end justify-between gap-4 border-b border-black/25 pb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#f15a42]">Thông số sản phẩm</p>
              <h3 className="mt-1 text-xl font-bold">Bảng size {gender === "nam" ? "Nam" : "Nữ"}</h3>
            </div>
            <span className="text-xs text-black/45">Đơn vị: cm / kg</span>
          </div>
          <div className="mt-4 overflow-x-auto rounded-[12px] border border-black/15 bg-white">
            <table className="w-full min-w-[1040px] border-collapse text-center text-sm">
              <thead className="bg-black text-white">
                <tr>{chart.columns.map((column) => <th key={column} className="whitespace-nowrap px-5 py-3.5 font-bold">{column}</th>)}</tr>
              </thead>
              <tbody>
                {chart.rows.map((row) => (
                  <tr key={row.size} className={cn("border-t border-black/10", result?.size === row.size && "bg-[#ffe0d1]")}>
                    <th scope="row" className="px-5 py-3.5 text-base font-bold">{row.size}</th>
                    {chart.columns.slice(1).map((column) => <td key={column} className="whitespace-nowrap px-5 py-3.5">{row.display[column] ?? "—"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-black/55">
            * Thông số mang tính tham khảo và có thể chênh lệch nhẹ theo chất liệu, phom dáng hoặc độ co giãn của sản phẩm.
          </p>
        </div>

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
