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
    <span className="relative inline-block min-w-[86px] w-full">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[28px] w-full appearance-none rounded-pill border border-black bg-white pl-2.5 pr-6 text-xs font-semibold text-black outline-none transition focus:ring-2 focus:ring-black/15 text-center [text-align-last:center]"
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

    const statusLabel = variant.is_available ? "Còn hàng" : "Hết hàng";
    const existing = sizeMap.get(sizeName);

    if (!existing || (existing.disabled && variant.is_available)) {
      sizeMap.set(sizeName, {
        value: sizeName,
        label: `${sizeName} - ${statusLabel}`,
        disabled: !variant.is_available,
      });
    }
  }

  if (item.size && item.size !== "Customize" && !sizeMap.has(item.size)) {
    sizeMap.set(item.size, {
      value: item.size,
      label: `${item.size} - Hết hàng`,
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

    const found = av.find(
      (v) =>
        v.size_name === newSize &&
        v.color_name === item.color &&
        v.is_available,
    );
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
      className="grid cursor-pointer grid-cols-[32px_60px_minmax(0,1fr)] sm:grid-cols-[36px_72px_minmax(0,1fr)] items-center gap-4 border-b border-black/50 py-3 outline-none transition hover:bg-black/[0.025] focus-visible:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black/30 last:border-b-0 sm:gap-6"
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
          className="group relative h-[80px] w-full overflow-hidden bg-secondary outline-none ring-black/20 transition focus-visible:ring-4 sm:h-[96px]"
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

      <div className="flex min-w-0 flex-col gap-2">
        <Link
          href={productHref}
          className="line-clamp-2 text-xs font-semibold uppercase leading-snug text-black/90 underline-offset-4 transition hover:underline focus-visible:underline"
        >
          {item.name}
        </Link>

        <div className="grid grid-cols-[100px_90px_1fr] items-center gap-2 w-full sm:grid-cols-[110px_100px_1fr] sm:gap-4">
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

          <div className="flex justify-end pr-2 sm:pr-8">
            <span className="shrink-0 text-right text-[13px] font-semibold text-black whitespace-nowrap">
              {formatPrice(item.line_total)}
            </span>
          </div>
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
