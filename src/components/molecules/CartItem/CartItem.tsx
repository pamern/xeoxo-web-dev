"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { ROUTES } from "@/constants/routes";
import { formatPrice } from "@/lib/utils";
import type { CartItemDto } from "@/types/cart.types";

function VariantSelect({
  value,
  options,
  ariaLabel,
  onChange,
}: {
  value: string;
  options: string[];
  ariaLabel: string;
  onChange: (value: string) => void;
}) {
  const list = options.includes(value) ? options : [value, ...options];
  return (
    <span className="relative inline-block w-full">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[28px] w-full appearance-none rounded-pill border border-black bg-white pl-2.5 pr-6 text-xs font-semibold text-black outline-none transition focus:ring-2 focus:ring-black/15 text-center [text-align-last:center]"
      >
        {list.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-black"
      />
    </span>
  );
}


const MEASUREMENT_LABELS: Record<string, string> = {
  height: "Chiều cao",
  weight: "Cân nặng",
  bust: "Vòng ngực",
  waist: "Vòng eo",
  hip: "Vòng mông",
  shoulder: "Ngang vai",
  neck: "Vòng cổ",
  sleeve: "Dài tay",
  upperArm: "Bắp tay",
};

export function CartItem({
  item,
  selected = true,
  onSelectedChange,
  onQuantityChange,
  onVariantChange,
  onRemove,
}: {
  item: CartItemDto;
  selected?: boolean;
  onSelectedChange?: (checked: boolean) => void;
  onQuantityChange: (quantity: number) => void;
  onVariantChange: (next: { variant_id: number }) => void;
  onRemove: () => void;
}) {
  const router = useRouter();
  const productHref = ROUTES.PRODUCT(item.slug);
  const av = item.available_variants || [];
  const colorOptions = av.length
    ? Array.from(new Set(av.map((v) => v.color_name)))
    : [item.color].filter(Boolean);

  const sizeOptions = av.length
    ? Array.from(new Set(av.map((v) => v.size_name)))
    : [item.size].filter(Boolean);

  const handleSizeChange = (newSize: string) => {
    const found = av.find((v) => v.size_name === newSize && v.color_name === item.color);
    if (found) {
      onVariantChange({ variant_id: found.variant_id });
    }
  };

  const handleColorChange = (newColor: string) => {
    const found = av.find((v) => v.color_name === newColor && v.size_name === item.size);
    if (found) {
      onVariantChange({ variant_id: found.variant_id });
    }
  };

  const openProduct = () => router.push(productHref);

  const handleRowClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, input, select, option, label, a")) return;
    openProduct();
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target as HTMLElement;
    if (target.closest("button, input, select, option, label, a")) return;
    event.preventDefault();
    openProduct();
  };

  const isCustomized = item.item_type === "CUSTOMIZED";
  const snapshot = typeof item.customization_snapshot === "string"
    ? (() => { try { return JSON.parse(item.customization_snapshot); } catch { return null; } })()
    : item.customization_snapshot;

  const measurements = (snapshot as any)?.measurements || {};
  const note = (snapshot as any)?.note;

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Xem chi tiết ${item.name}`}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      className="grid cursor-pointer grid-cols-[32px_80px_minmax(0,1fr)] sm:grid-cols-[36px_96px_minmax(0,1fr)] items-center gap-4 border-b border-black/50 py-4 outline-none transition hover:bg-black/[0.025] focus-visible:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black/30 last:border-b-0 sm:gap-6"
    >
      <label className="justify-self-center inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border-2 border-black bg-white cursor-pointer transition hover:border-black/70">
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelectedChange?.(event.target.checked)}
          aria-label={`Chọn ${item.name}`}
          className="sr-only"
        />
        <span className={selected ? "h-[10px] w-[10px] rounded-[1px] bg-black" : "h-[10px] w-[10px] rounded-[1px] bg-white"} />
      </label>

      <div className="flex flex-col gap-2">
        <Link
          href={productHref}
          aria-label={`Xem chi tiết ${item.name}`}
          className="group relative h-[110px] w-full overflow-hidden bg-secondary outline-none ring-black/20 transition focus-visible:ring-4 sm:h-[130px]"
        >
          <Image
            src={item.thumbnail || "/images/placeholder.png"}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 96px, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 self-start text-body-sm font-medium text-black/60 transition hover:text-black"
        >
          <Image src="/icons/xoa.svg" alt="" width={16} height={16} aria-hidden />
          Xóa
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-2.5">
        <Link
          href={productHref}
          className="line-clamp-2 text-sm font-semibold uppercase leading-snug text-black underline-offset-4 transition hover:underline focus-visible:underline sm:text-base"
        >
          {item.name}
        </Link>

        <div className="grid grid-cols-[90px_70px_1fr_75px_2fr_auto] sm:grid-cols-[120px_90px_1fr_80px_2fr_auto] items-center gap-2 sm:gap-3 w-full">
          <VariantSelect
            value={item.color}
            options={colorOptions}
            ariaLabel={`Màu của ${item.name}`}
            onChange={handleColorChange}
          />
          {isCustomized ? (
            <span className="inline-flex h-[28px] items-center justify-center rounded-pill border border-[#f15a42] bg-[#fff4ee] px-2 text-[11px] font-bold text-[#f15a42] w-full text-center">
              Customize
            </span>
          ) : (
            <VariantSelect
              value={item.size}
              options={sizeOptions}
              ariaLabel={`Kích cỡ của ${item.name}`}
              onChange={handleSizeChange}
            />
          )}
          <div aria-hidden />
          <QuantityStepper value={item.quantity} min={1} onChange={onQuantityChange} />
          <div aria-hidden />
          <span className="text-right text-body-sm font-bold uppercase text-black sm:text-base justify-self-end whitespace-nowrap pr-2 sm:pr-4">
            {formatPrice(item.line_total)}
          </span>
        </div>

        {isCustomized && (
          <div className="mt-2 rounded-[8px] bg-black/[0.03] p-3 text-body-sm text-black/70">
            <p className="font-bold text-black/80">Số đo Customize:</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
              {Object.entries(measurements)
                .filter(([, val]) => val !== undefined && val !== null && String(val).trim() !== "")
                .map(([key, val]) => {
                  const label = MEASUREMENT_LABELS[key] || key;
                  const unit = key === "weight" ? "kg" : "cm";
                  return (
                    <span key={key} className="bg-white px-2 py-0.5 rounded border border-black/10 text-xs font-medium text-black/75">
                      {label}: {val as string | number}{unit}
                    </span>
                  );
                })}
            </div>
            {note && (
              <p className="mt-2 text-xs italic text-black/60">
                <span className="font-semibold not-italic text-black/75">Ghi chú:</span> {note}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
