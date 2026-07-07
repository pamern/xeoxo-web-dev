import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import type { ProductColor } from "@/types/product.types";
import type { ProductSizeOptionDto } from "@/types/product-api.types";

export function VariantSelector({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
}: {
  colors: ProductColor[];
  sizes: ProductSizeOptionDto[];
  selectedColor: ProductColor;
  selectedSize: string;
  onColorChange: (color: ProductColor) => void;
  onSizeChange: (size: string) => void;
}) {
  const regularSizes = sizes.filter(
    (size) => size.size_name.trim().toUpperCase() !== "CUSTOM",
  );
  const customSelected = selectedSize.trim().toUpperCase() === "CUSTOM";
  const hasAvailableVariant = sizes.some((size) => size.is_available);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="text-sm font-bold">
          Màu Sắc: <span className="font-bold">{selectedColor.name}</span>
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
                "inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-pill border-[3px] px-4 text-sm font-bold transition-colors",
                option.name === selectedColor.name
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary",
                !hasAvailableVariant &&
                  "cursor-not-allowed border-black/20 bg-black/5 text-black/35 line-through",
              )}
            >
              <span
                className={cn(
                  "h-5 w-5 rounded-full border",
                  option.name === selectedColor.name
                    ? "border-white/40"
                    : "border-border",
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
          <span className="font-bold">Kích thước: {selectedSize}</span>
          <span className="flex gap-3 text-caption font-bold text-[#3568ff] underline underline-offset-4">
            <button type="button">Bảng kích thước</button>
            <button type="button">Hướng dẫn chọn size</button>
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
              aria-label={`${option.size_name}${option.is_available ? "" : " - hết hàng"}`}
              className={cn(
                "relative h-[43px] w-[102px] rounded-pill border-[3px] text-base transition-colors",
                !option.is_available &&
                  "cursor-not-allowed border-black/20 bg-black/5 text-black/35 line-through",
                option.size_name === selectedSize && option.is_available
                  ? "border-primary bg-primary text-primary-foreground"
                  : option.is_available && "border-input hover:border-primary",
              )}
            >
              {option.size_name}
            </button>
          ))}
          <Button
            type="button"
            onClick={() => onSizeChange("Custom")}
            variant="customPill"
            size="custom"
            iconSrc="/icons/custom.svg"
            iconSize={38}
            iconClassName={cn(
              "h-8 w-9 object-contain transition group-active:invert",
              customSelected && "invert",
            )}
            aria-label="Custom size"
            aria-pressed={customSelected}
            className={cn(
              "group gap-1.5",
              customSelected &&
                "border-primary bg-primary text-primary-foreground",
            )}
          >
            Custom
          </Button>
        </div>
      </div>
    </div>
  );
}
