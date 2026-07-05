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

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Xem chi tiết ${item.name}`}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      className="grid cursor-pointer grid-cols-[24px_minmax(92px,134px)_minmax(0,1fr)] items-center gap-4 border-b border-black/50 py-5 outline-none transition hover:bg-black/[0.025] focus-visible:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black/30 last:border-b-0 sm:gap-6"
    >
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
          href={productHref}
          aria-label={`Xem chi tiết ${item.name}`}
          className="group relative h-[150px] w-full overflow-hidden bg-secondary outline-none ring-black/20 transition focus-visible:ring-4 sm:h-[180px]"
        >
          <Image
            src={item.thumbnail || "/images/placeholder.png"}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 134px, 28vw"
            className="object-cover transition duration-300 group-hover:scale-105"
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
          href={productHref}
          className="line-clamp-2 text-base font-semibold uppercase leading-snug text-black underline-offset-4 transition hover:underline focus-visible:underline sm:text-lg"
        >
          {item.name}
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <VariantSelect
            value={item.color}
            options={colorOptions}
            ariaLabel={`Màu của ${item.name}`}
            onChange={handleColorChange}
          />
          <VariantSelect
            value={item.size}
            options={sizeOptions}
            ariaLabel={`Kích cỡ của ${item.name}`}
            onChange={handleSizeChange}
          />
          <QuantityStepper value={item.quantity} min={1} onChange={onQuantityChange} />
          <span className="ml-auto text-right text-base font-bold uppercase text-black sm:text-lg">
            {formatPrice(item.line_total)}
          </span>
        </div>
      </div>
    </article>
  );
}
