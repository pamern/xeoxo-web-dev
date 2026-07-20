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
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  ariaLabel: string;
  onChange: (value: string) => void;
}) {
  const list = options.some((option) => option.value === value)
    ? options
    : [{ value, label: value }, ...options];

  return (
    <span className="relative inline-block w-full min-w-0 sm:min-w-[86px]">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-pill border border-black bg-white pl-2.5 pr-7 text-center text-xs font-normal text-black outline-none transition focus:ring-2 focus:ring-black/15 [text-align-last:center] sm:h-[28px] sm:pr-6"
      >
        {list.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
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
  onCustomize,
  onRemove,
}: {
  item: CartItemDto;
  selected?: boolean;
  onSelectedChange?: (checked: boolean) => void;
  onQuantityChange: (quantity: number) => void;
  onVariantChange: (next: { variant_id: number }) => void;
  onCustomize?: () => void;
  onRemove: () => void;
}) {
  const router = useRouter();
  const productHref = ROUTES.PRODUCT(item.slug);
  const av = item.available_variants || [];

  const sizeMap = new Map<
    string,
    {
      value: string;
      label: string;
      disabled?: boolean;
    }
  >();

  for (const variant of av) {
    const sizeName = variant.size_name;
    if (!sizeName || sizeName === "Customize") {
      continue;
    }

    const existing = sizeMap.get(sizeName);

    if (!existing || (existing.disabled && variant.is_available)) {
      sizeMap.set(sizeName, {
        value: sizeName,
        label: sizeName,
        disabled: !variant.is_available,
      });
    }
  }

  if (item.size && item.size !== "Customize" && !sizeMap.has(item.size)) {
    sizeMap.set(item.size, {
      value: item.size,
      label: item.size,
      disabled: true,
    });
  }

  const sizeOptions = [
    ...Array.from(sizeMap.values()),
    {
      value: "Customize",
      label: "Customize",
    },
  ];

  const handleSizeChange = (newSize: string) => {
    if (newSize === "Customize") {
      onCustomize?.();
      return;
    }

    let found = av.find(
      (v) =>
        v.size_name === newSize &&
        v.color_name?.trim().toLowerCase() === item.color?.trim().toLowerCase() &&
        v.is_available,
    );
    if (!found) {
      found = av.find(
        (v) =>
          v.size_name === newSize &&
          v.is_available,
      );
    }

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
      className="grid w-full min-w-0 cursor-pointer grid-cols-[24px_68px_minmax(0,1fr)] items-start gap-2.5 overflow-hidden border-b border-black/50 py-4 outline-none transition hover:bg-black/[0.025] focus-visible:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black/30 last:border-b-0 sm:grid-cols-[36px_72px_minmax(0,1fr)] sm:items-center sm:gap-6 sm:overflow-visible sm:py-3"
    >
      <label className="mt-1 inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center justify-self-center rounded-[2px] border-2 border-black bg-white transition hover:border-black/70 sm:mt-0 sm:h-[18px] sm:w-[18px]">
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
          className="group relative h-[88px] w-full overflow-hidden rounded-[4px] bg-secondary outline-none ring-black/20 transition focus-visible:ring-4 sm:h-[96px] sm:rounded-none"
        >
          <Image
            src={item.thumbnail || "/images/placeholder.png"}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 72px, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-black/60 transition hover:text-black"
        >
          <Image src="/icons/xoa.svg" alt="" width={13} height={13} aria-hidden />
          Xóa
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-2.5 sm:gap-2">
        <Link
          href={productHref}
          className="line-clamp-2 text-xs font-semibold uppercase leading-snug text-black/90 underline-offset-4 transition hover:underline focus-visible:underline"
        >
          {item.name}
        </Link>

        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[110px_100px_1fr] sm:gap-4">
          <div className="flex justify-start">
            <VariantSelect
              value={item.size}
              options={sizeOptions}
              ariaLabel={`Kích cỡ của ${item.name}`}
              onChange={handleSizeChange}
            />
          </div>
          <div className="flex justify-start">
            <QuantityStepper value={item.quantity} min={1} onChange={onQuantityChange} />
          </div>

          <div className="col-span-2 flex min-w-0 justify-end border-t border-black/10 pt-2 sm:col-span-1 sm:border-t-0 sm:pt-0 sm:pr-8">
            <span className="max-w-full truncate text-right text-[13px] font-semibold text-black sm:shrink-0 sm:whitespace-nowrap">
              {formatPrice(item.line_total)}
            </span>
          </div>
        </div>

        {isCustomized && (
          <div className="mt-2 rounded-[8px] bg-black/[0.03] p-3 text-body-sm text-black/70">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
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
                {note}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
