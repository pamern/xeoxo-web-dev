"use client";

import { useEffect, useState, KeyboardEvent, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { CustomizeModal } from "@/components/organisms/CustomizeModal";
import { useSharedMeasurements } from "@/hooks/useSharedMeasurements";
import { createCustomizationRequest } from "@/services/customization.service";
import { ROUTES } from "@/constants/routes";
import { formatPrice } from "@/lib/utils";
import type { CartItemDto } from "@/types/cart.types";
import type { MeasurementValues } from "@/features/size-recommendation/size-recommendation";

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
        className="h-[38px] appearance-none rounded-pill border border-black bg-white pl-4 pr-9 text-body-sm font-medium text-black outline-none transition focus:ring-2 focus:ring-black/15"
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

function CustomSizeSelect({
  value,
  options,
  isCustomized,
  onChange,
  onCustomizeClick,
}: {
  value: string;
  options: string[];
  isCustomized: boolean;
  onChange: (value: string) => void;
  onCustomizeClick: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [isOpen]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative flex h-[38px] min-w-[80px] items-center justify-center rounded-pill border border-black bg-white px-7 text-body-sm font-medium text-black outline-none transition focus:ring-2 focus:ring-black/15"
      >
        {isCustomized ? (
          <span className="flex items-center justify-center">
            <img src="/icons/custom.svg" alt="Customize" className="h-5 w-6 object-contain" />
          </span>
        ) : (
          <span className="text-center">{value}</span>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-2/3 rotate-45 border-b-2 border-r-2 border-black"
        />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 z-50 mt-1 min-w-[80px] -translate-x-1/2 rounded-[8px] border border-black bg-white py-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-center px-4 py-2 text-center text-body-sm hover:bg-black/[0.05]"
            >
              {option}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              onCustomizeClick();
              setIsOpen(false);
            }}
            className="flex w-full items-center justify-center px-4 py-2 hover:bg-[#fff4ee]"
          >
            <img src="/icons/custom.svg" alt="Customize" className="h-5 w-6 object-contain" />
          </button>
        </div>
      )}
    </div>
  );
}

const SIZE_ORDER: Record<string, number> = {
  "XXS": 1,
  "XS": 2,
  "S": 3,
  "M": 4,
  "L": 5,
  "XL": 6,
  "XXL": 7,
  "XXXL": 8,
  "2XL": 7,
  "3XL": 8,
  "FREESIZE": 9,
  "FREE SIZE": 9,
  "FREE": 9,
  "OS": 9,
};

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const orderA = SIZE_ORDER[a.trim().toUpperCase()] || 99;
    const orderB = SIZE_ORDER[b.trim().toUpperCase()] || 99;
    return orderA - orderB;
  });
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
  onVariantChange: (next: { variant_id: number | null; item_type?: "STANDARD" | "CUSTOMIZED"; customization_id?: number | null }) => void;
  onRemove: () => void;
}) {
  const router = useRouter();
  const productHref = ROUTES.PRODUCT(item.slug);
  const [productDetail, setProductDetail] = useState<any>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/product-lines/${item.slug}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setProductDetail(res.data);
        }
      })
      .catch(() => {});
  }, [item.slug]);

  const gender = productDetail?.gender || (item.name.toLowerCase().includes("nam") ? "nam" : "nu");
  const { values: sharedMeasurementValues } = useSharedMeasurements(gender);

  const av = item.available_variants || [];
  const colorOptions = av.length
    ? Array.from(new Set(av.map((v) => v.color_name)))
    : [item.color].filter(Boolean);

  const baseSizeOptions = sortSizes(
    av.length
      ? Array.from(new Set(av.map((v) => v.size_name)))
      : [item.size].filter(Boolean)
  );

  const handleSizeChange = (newSize: string) => {
    const found = av.find((v) => v.size_name === newSize && v.color_name === item.color);
    if (found) {
      onVariantChange({
        variant_id: found.variant_id,
        item_type: "STANDARD",
        customization_id: null,
      });
    }
  };

  const handleColorChange = (newColor: string) => {
    const found = av.find((v) => v.color_name === newColor && v.size_name === item.size);
    if (found) {
      onVariantChange({
        variant_id: found.variant_id,
        item_type: isCustomized ? "CUSTOMIZED" : "STANDARD",
        customization_id: item.customization_id,
      });
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

  function parseMeasurementValues(values: MeasurementValues) {
    const parsedMeasurements: Record<string, number> = {};
    for (const [key, value] of Object.entries(values)) {
      const num = parseFloat(value);
      if (!Number.isNaN(num)) parsedMeasurements[key] = num;
    }
    return parsedMeasurements;
  }

  const handleCustomizeSubmit = async (values: MeasurementValues, note: string, saveAsDefault: boolean) => {
    try {
      const componentId = productDetail?.components?.[0]?.component_id;
      if (!componentId) return;

      const request = await createCustomizationRequest({
        component_id: componentId,
        measurements: parseMeasurementValues(values),
        customer_note: note,
        save_as_default: saveAsDefault,
      });

      onVariantChange({
        variant_id: null,
        item_type: "CUSTOMIZED",
        customization_id: request.customization_id,
      });
      setIsCustomizeOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const firstComponent = productDetail?.components?.[0];
  const componentType = firstComponent?.component_type || "AO";
  const basePrice = firstComponent?.min_price || item.unit_price;

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Xem chi tiết ${item.name}`}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      className="grid cursor-pointer grid-cols-[24px_110px_1fr] items-center gap-3 border-b border-black/50 py-5 outline-none transition hover:bg-black/[0.025] focus-visible:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black/30 last:border-b-0 sm:gap-4"
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
          className="group relative h-[140px] w-[110px] overflow-hidden bg-secondary outline-none ring-black/20 transition focus-visible:ring-4"
        >
          <Image
            src={item.thumbnail || "/images/placeholder.png"}
            alt={item.name}
            fill
            sizes="110px"
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

      <div className="flex min-w-0 flex-col gap-4">
        <Link
          href={productHref}
          className="line-clamp-2 text-base font-semibold uppercase leading-snug text-black underline-offset-4 transition hover:underline focus-visible:underline sm:text-lg"
        >
          {item.name}
        </Link>

        <div className="flex flex-row items-center justify-between w-full gap-2 flex-nowrap">
          <div className="flex flex-row items-center gap-2 flex-wrap sm:flex-nowrap">
            <VariantSelect
              value={item.color}
              options={colorOptions}
              ariaLabel={`Màu của ${item.name}`}
              onChange={handleColorChange}
            />
            <CustomSizeSelect
              value={item.size}
              options={baseSizeOptions}
              isCustomized={isCustomized}
              onChange={handleSizeChange}
              onCustomizeClick={() => setIsCustomizeOpen(true)}
            />
            <QuantityStepper value={item.quantity} min={1} onChange={onQuantityChange} />
          </div>
          <div className="ml-auto flex h-[38px] items-center">
            <span className="shrink-0 text-right text-base font-bold uppercase text-black sm:text-lg">
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

      {isCustomizeOpen && (
        <CustomizeModal
          gender={gender}
          componentType={componentType}
          initialValues={measurements || sharedMeasurementValues}
          canPersistMeasurements={false}
          hasPersistedMeasurements={false}
          basePrice={basePrice}
          onClose={() => setIsCustomizeOpen(false)}
          onClearMeasurements={() => {}}
          onValuesChange={() => {}}
          onSubmit={handleCustomizeSubmit}
        />
      )}
    </article>
  );
}
