"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import {
  getMeasurementFields,
  MEASUREMENT_FIELDS,
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

const EMPTY_VALUES = Object.fromEntries(
  MEASUREMENT_FIELDS.map((field) => [field.key, ""]),
) as MeasurementValues;

export function CustomizeModal({
  gender,
  basePrice,
  onClose,
}: {
  gender: Gender;
  basePrice: number;
  onClose: () => void;
}) {
  const [values, setValues] = useState<MeasurementValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<MeasurementErrors>({});
  const [touched, setTouched] = useState<Partial<Record<MeasurementKey, boolean>>>({});
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fields = getMeasurementFields(gender);
  const genderLabel = gender === "nam" ? "Nam" : "Nữ";
  const customPrice = basePrice * 1.2;

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

  function update(key: MeasurementKey, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    setSubmitted(false);
    if (touched[key]) {
      setErrors((current) => ({
        ...current,
        [key]: validateMeasurementField(key, value, gender),
      }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateMeasurements(values, gender);
    setTouched(Object.fromEntries(fields.map((field) => [field.key, true])));
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitted(true);
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
