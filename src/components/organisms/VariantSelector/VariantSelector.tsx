import { cn } from "@/lib/utils";
import type { ProductSizeOptionDto } from "@/types/product-api.types";
import type { ProductColor } from "@/types/product.types";

function getReadableTextColor(hex: string) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "#ffffff";
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.58 ? "#111111" : "#ffffff";
}

function getDisplaySizeName(option: ProductSizeOptionDto) {
  const sizeName = option.size_name?.trim();
  return sizeName ? sizeName : "Freesize";
}

export function VariantSelector({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
  onOpenSizeGuide,
  onOpenSizeRecommendation,
  onOpenAppointment,
  onOpenCustomize,
}: {
  colors: ProductColor[];
  sizes: ProductSizeOptionDto[];
  selectedColor: ProductColor;
  selectedSize: string;
  onColorChange: (color: ProductColor) => void;
  onSizeChange: (size: string) => void;
  onOpenSizeGuide: () => void;
  onOpenSizeRecommendation: () => void;
  onOpenAppointment: () => void;
  onOpenCustomize: () => void;
}) {
  const regularSizes = sizes.filter(
    (size) => getDisplaySizeName(size).toUpperCase() !== "CUSTOM",
  );
  const customSelected = selectedSize.trim().toUpperCase() === "CUSTOM";
  const hasAvailableVariant = regularSizes.some((size) => size.is_available);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="text-sm font-bold">
          Màu sắc
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((option) => (
            <button
              key={option.name}
              type="button"
              onClick={() => onColorChange(option)}
              disabled={!hasAvailableVariant}
              aria-label={option.name}
              aria-pressed={option.name === selectedColor.name}
              className={cn(
                "inline-flex h-10 min-w-[120px] items-center justify-center rounded-[4px] border border-black px-5 text-sm font-bold transition-colors hover:opacity-90",
                option.name === selectedColor.name
                  ? "border-black"
                  : "border-black",
                !hasAvailableVariant &&
                  "cursor-not-allowed border-black bg-[#ededed] text-[#a3a3a3]",
              )}
              style={{
                backgroundColor: hasAvailableVariant ? option.hex : "#ededed",
                color: hasAvailableVariant
                  ? getReadableTextColor(option.hex)
                  : "#a3a3a3",
              }}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex w-full items-center justify-between gap-3 text-sm">
          <span className="font-bold">Kích thước</span>
          <span className="flex flex-wrap justify-end gap-3 text-caption font-bold text-[#3568ff] underline underline-offset-4">
            <button type="button" onClick={onOpenSizeGuide}>
              Hướng dẫn cách đo
            </button>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {regularSizes.map((option) => {
            const sizeName = getDisplaySizeName(option);

            return (
              <button
                key={option.variant_id}
                type="button"
                onClick={() => {
                  if (selectedSize === sizeName) {
                    onSizeChange("");
                  } else {
                    onSizeChange(sizeName);
                  }
                }}
                disabled={!option.is_available}
                aria-pressed={sizeName === selectedSize}
                aria-label={`${sizeName}${option.is_available ? "" : " - het hang"}`}
                className={cn(
                  "relative h-[28px] min-w-[42px] rounded-[4px] border border-black px-3 text-sm font-bold leading-none transition-colors",
                  !option.is_available &&
                    "cursor-not-allowed border-black bg-[#ededed] text-[#a3a3a3]",
                  sizeName === selectedSize && option.is_available
                    ? "bg-black text-white"
                    : option.is_available &&
                      "bg-white hover:bg-black hover:text-white",
                )}
              >
                {sizeName}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              if (selectedSize === "CUSTOM") {
                onSizeChange("");
              } else {
                onOpenCustomize();
              }
            }}
            disabled={!hasAvailableVariant}
            aria-label="Customize size"
            aria-pressed={customSelected}
            className={cn(
              "relative h-[28px] min-w-[92px] rounded-[4px] border border-black px-3 text-sm font-bold leading-none transition-colors",
              customSelected &&
                "bg-black text-white",
              !hasAvailableVariant &&
                "cursor-not-allowed border-black bg-[#ededed] text-[#a3a3a3]",
              hasAvailableVariant && !customSelected &&
                "bg-white hover:bg-black hover:text-white",
            )}
          >
            Customize
          </button>
        </div>

        <div className="mt-2 flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenAppointment}
            className="flex h-[43px] items-center justify-center rounded-full border border-black px-6 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
            style={{
              backgroundImage: "url(/images/bg-gia-nhap-btn.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            Đặt lịch may đo
          </button>
          <div className="flex items-center gap-1.5 text-sm font-bold text-[#111111]">
            <span className="text-black/60">&gt;</span>
            <button
              type="button"
              onClick={onOpenSizeRecommendation}
              className="underline underline-offset-4 hover:opacity-80"
            >
              Hướng dẫn chọn size
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
