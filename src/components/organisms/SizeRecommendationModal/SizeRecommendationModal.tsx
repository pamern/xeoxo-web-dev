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
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/40 px-3 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-md sm:px-4 sm:pb-4 sm:pt-4 md:pt-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex w-full items-start justify-center">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-recommendation-title"
          className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-[900px] flex-col overflow-hidden rounded-[22px] bg-white px-4 pb-4 pt-4 shadow-[0_18px_54px_rgba(0,0,0,0.28)] sm:max-h-[calc(100dvh-32px)] sm:px-6 sm:pb-5 sm:pt-5 md:max-h-[calc(100dvh-48px)] md:pt-6"
        >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hướng dẫn chọn size"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white transition hover:bg-black/5 sm:right-4 sm:top-4"
        >
          <Image src="/icons/close-black.svg" alt="" width={36} height={36} aria-hidden />
        </button>

        <header className="shrink-0 pb-3 text-center sm:pb-4">
          <h2 id="size-recommendation-title" className="text-lg font-bold uppercase leading-none text-black sm:text-xl">
            Hướng dẫn chọn size
          </h2>
          <div className="mx-auto mt-2 h-[5px] w-[min(100%,300px)] overflow-hidden bg-[url('/images/bg-gia-nhap-btn.png')] bg-cover bg-center" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <form onSubmit={handleSubmit} noValidate className="mt-4 sm:mt-5">
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-3">
            {fields.map((field) => {
              const error = errors[field.key];
              const errorId = `${field.key}-error`;

              return (
                <label key={field.key} className="flex flex-col gap-1.5">
                  <span className={cn("text-sm font-bold leading-tight text-black", error && "text-red-600")}>
                    {field.label}
                    {field.required ? <span className="ml-1 text-[#f15a42]">*</span> : null}
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
                        "h-9 w-full rounded-pill border bg-white px-3.5 pr-10 text-sm font-light outline-none transition focus:ring-2",
                        error
                          ? "border-red-500 text-red-700 focus:ring-red-100"
                          : "border-black/30 focus:border-black focus:ring-black/10",
                      )}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-black/35">
                      {field.unit}
                    </span>
                  </span>
                  {error ? (
                    <span id={errorId} role="alert" className="text-xs font-medium text-red-600">
                      {error}
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <Button
              type="submit"
              variant="primaryPill"
              size="pill"
              className="border border-black bg-black text-white hover:bg-black/80"
            >
              {isPersisting ? "Đang lưu..." : "Tính size phù hợp"}
            </Button>

            {canPersistMeasurements ? (
              <span className="ml-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  title="Xóa dữ liệu đang nhập trên giao diện"
                  aria-label="Xóa dữ liệu đang nhập trên giao diện"
                  className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-white transition hover:border-black hover:bg-black hover:text-white"
                >
                  <Image
                    src="/icons/xoa.svg"
                    alt=""
                    width={17}
                    height={17}
                    className="transition group-hover:invert"
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setSaveAsDefault((current) => !current)}
                  title="Lưu lại để sử dụng lần sau"
                  className={cn(
                    "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-white text-black transition hover:border-black hover:bg-black hover:text-white",
                    saveAsDefault && "border-black/40",
                  )}
                >
                  {saveAsDefault ? <SavedIcon /> : <SaveIcon />}
                </button>
              </span>
            ) : null}
          </div>

          {persistError ? (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
              {persistError}
            </p>
          ) : null}
        </form>

        <div aria-live="polite" className="mt-5">
          {result && result.size && result.isAvailable ? (
            <div className="rounded-[14px] border border-emerald-300 bg-emerald-50 p-4">
              <div>
                <p className="text-xs font-bold text-emerald-800">
                  {result.confidence === "high" ? "Độ phù hợp cao" : "Kết quả tham khảo"}
                </p>
                <p className="mt-1 text-lg font-bold">Size phù hợp với bạn: {result.size}</p>
                {result.confidence === "reference" ? (
                  <p className="mt-1 text-sm text-black/60">
                    Hãy bổ sung số đo cơ thể để tăng độ chính xác.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {result && result.size && result.isOffered && !result.isAvailable ? (
            <div className="rounded-[14px] border border-[#f15a42]/40 bg-[#fff0e8] p-4">
              <p className="text-base font-bold">Size {result.size} hiện đang hết hàng</p>
              <p className="mt-1 text-sm text-black/65">
                Đây là size phù hợp với số đo của bạn, nhưng sản phẩm hiện chưa còn size này.
              </p>
            </div>
          ) : null}

          {result && (!result.size || !result.isOffered) ? (
            <div className="rounded-[14px] border border-[#f15a42]/40 bg-[#fff0e8] p-4">
              <p className="text-sm leading-relaxed text-black/75">
                Sản phẩm chưa có size phù hợp với số đo của bạn. Bạn có thể đặt sản phẩm được
                customize theo số đo riêng{" "}
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
          ) : null}
        </div>

        <div className="mt-6">
          <div className="pb-3 text-center">
            <h3 className="text-xl font-bold uppercase leading-none text-black">
              Thông số sản phẩm
            </h3>
            <div className="mx-auto mt-2 h-[5px] w-[min(100%,300px)] overflow-hidden bg-[url('/images/bg-gia-nhap-btn.png')] bg-cover bg-center" />
          </div>
          <div className="mt-2 text-right">
            <span className="text-xs text-black/45">Đơn vị: cm / kg</span>
          </div>
          <div className="mt-4 overflow-x-auto rounded-[12px] border border-black/15 bg-white">
            <table className="w-full min-w-[900px] border-collapse text-center text-[0.6875rem]">
              <thead className="bg-[#f15a42] text-white">
                <tr>
                  {chart.columns.map((column) => (
                    <th key={column} className="whitespace-nowrap px-4 py-3 font-bold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row) => (
                  <tr
                    key={row.size}
                    className={cn("border-t border-black/10", result?.size === row.size && "bg-[#ffe0d1]")}
                  >
                    <th scope="row" className="px-4 py-3 text-sm font-bold text-[#f15a42]">
                      {row.size}
                    </th>
                    {chart.columns.slice(1).map((column) => (
                      <td key={column} className="whitespace-nowrap px-4 py-3">
                        {row.display[column] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-black/55">
            * Thông số mang tính tham khảo và có thể chênh lệch nhẹ theo chất liệu, phom dáng hoặc độ co giãn của sản phẩm.
          </p>
        </div>

        </div>
        </section>
      </div>
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
