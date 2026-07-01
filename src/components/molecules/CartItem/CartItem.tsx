"use client";

import Image from "next/image";
import Link from "next/link";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { ROUTES } from "@/constants/routes";
import { getProductBySlug } from "@/data/queries";
import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/types/product.types";

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
    <span className="relative inline-block">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[38px] appearance-none rounded-pill border border-black bg-white pl-4 pr-9 text-sm font-medium text-black outline-none transition focus:ring-2 focus:ring-black/15"
      >
        {list.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-2/3 rotate-45 border-b-2 border-r-2 border-black"
      />
    </span>
  );
}

export function CartItem({
  item,
  selected = true,
  onSelectedChange,
  onQuantityChange,
  onVariantChange,
  onRemove,
}: {
  item: CartLine;
  selected?: boolean;
  onSelectedChange?: (checked: boolean) => void;
  onQuantityChange: (quantity: number) => void;
  onVariantChange: (next: { size?: string; color?: string }) => void;
  onRemove: () => void;
}) {
  const product = getProductBySlug(item.slug);
  const colorOptions = product?.colors.map((c) => c.name) ?? [item.color];
  const sizeOptions = product?.sizes ?? [item.size];

  return (
    <article className="grid grid-cols-[24px_minmax(92px,134px)_minmax(0,1fr)] items-center gap-4 border-b border-black/50 py-5 last:border-b-0 sm:gap-6">
      <label className="inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[2px] border-2 border-black bg-white">
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelectedChange?.(event.target.checked)}
          aria-label={`Chọn ${item.name}`}
          className="sr-only"
        />
        <span className={selected ? "h-[15px] w-[15px] rounded-[3px] bg-black" : "h-[15px] w-[15px] rounded-[3px] bg-white"} />
      </label>

      <div className="flex flex-col gap-2">
        <Link
          href={ROUTES.PRODUCT(item.slug)}
          className="relative h-[150px] w-full overflow-hidden bg-secondary sm:h-[180px]"
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 134px, 28vw"
            className="object-cover"
          />
        </Link>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-black/60 transition hover:text-black"
        >
          <Image src="/icons/xoa.svg" alt="" width={16} height={16} aria-hidden />
          Xóa
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Link
          href={ROUTES.PRODUCT(item.slug)}
          className="line-clamp-2 text-base font-semibold uppercase leading-snug text-black sm:text-lg"
        >
          {item.name}
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <VariantSelect
            value={item.color}
            options={colorOptions}
            ariaLabel={`Màu của ${item.name}`}
            onChange={(color) => onVariantChange({ color })}
          />
          <VariantSelect
            value={item.size}
            options={sizeOptions}
            ariaLabel={`Kích cỡ của ${item.name}`}
            onChange={(size) => onVariantChange({ size })}
          />
          <QuantityStepper value={item.quantity} min={1} onChange={onQuantityChange} />
          <span className="ml-auto text-right text-base font-bold uppercase text-black sm:text-lg">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </article>
  );
}
