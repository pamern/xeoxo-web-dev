import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import type { ProductSizeOptionDto } from "@/types/product-api.types";
import type { ProductColor } from "@/types/product.types";

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
    (size) => size.size_name.trim().toUpperCase() !== "CUSTOM",
  );
  const customSelected = selectedSize.trim().toUpperCase() === "CUSTOM";
  const hasAvailableVariant = regularSizes.some((size) => size.is_available);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="text-sm font-bold">
          Màu sắc: <span className="font-bold">{selectedColor.name}</span>
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
                "inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-pill border-[3px] px-4 text-sm font-bold text-white transition-colors",
                option.name === selectedColor.name
                  ? "border-input"
                  : "border-border hover:border-primary hover:bg-primary",
                !hasAvailableVariant &&
                  "cursor-not-allowed border-gray-300 bg-gray-300 text-gray-500 opacity-50",
              )}
              style={{ backgroundColor: option.hex }}
            >
              <span
                className={cn(
                  "h-5 w-5 rounded-full border",
                  option.name === selectedColor.name
                    ? "border-white/40"
                    : "border-white/60",
                )}
                style={{ backgroundColor: option.hex }}
              />
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
          {regularSizes.map((option) => (
            <button
              key={option.variant_id}
              type="button"
              onClick={() => onSizeChange(option.size_name)}
              disabled={!option.is_available}
              aria-pressed={option.size_name === selectedSize}
              aria-label={`${option.size_name}${option.is_available ? "" : " - het hang"}`}
              className={cn(
                "relative h-[43px] w-[72px] rounded-pill border-[3px] text-base transition-colors",
                !option.is_available &&
                  "cursor-not-allowed border-gray-300 bg-gray-300 text-gray-500 opacity-50",
                option.size_name === selectedSize && option.is_available
                  ? "border-primary bg-primary text-primary-foreground"
                  : option.is_available &&
                    "border-input bg-white hover:border-primary hover:bg-primary hover:text-primary-foreground",
              )}
            >
              {option.size_name}
            </button>
          ))}
          <Button
            type="button"
            onClick={onOpenCustomize}
            disabled={!hasAvailableVariant}
            variant="customPill"
            size="custom"
            iconSrc="/icons/custom.svg"
            iconSize={38}
            iconClassName={cn(
              "h-8 w-9 object-contain transition group-hover:invert group-active:invert",
              customSelected && "invert",
            )}
            aria-label="Customize size"
            aria-pressed={customSelected}
            className={cn(
              "group gap-1.5",
              customSelected &&
                "border-primary bg-primary text-primary-foreground",
              !hasAvailableVariant &&
                "cursor-not-allowed border-gray-300 bg-gray-300 text-gray-500 opacity-50",
            )}
          >
            Customize
          </Button>
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
