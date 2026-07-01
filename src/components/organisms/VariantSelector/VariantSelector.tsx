import { cn } from "@/lib/utils";
import type { ProductColor } from "@/types/product.types";

export function VariantSelector({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
}: {
  colors: ProductColor[];
  sizes: string[];
  selectedColor: ProductColor;
  selectedSize: string;
  onColorChange: (color: ProductColor) => void;
  onSizeChange: (size: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-bold">
          Màu Sắc: <span className="font-bold">{selectedColor.name}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {colors.map((option) => (
            <button
              key={option.name}
              type="button"
              onClick={() => onColorChange(option)}
              aria-label={option.name}
              aria-pressed={option.name === selectedColor.name}
              className={cn(
                "inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-pill border px-4 text-sm font-bold transition-colors",
                option.name === selectedColor.name
                  ? "border-[3px] border-primary"
                  : "border-border hover:border-primary"
              )}
            >
              <span
                className="h-5 w-5 rounded-full border border-border"
                style={{ backgroundColor: option.hex }}
              />
              {option.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="flex w-full items-center justify-between gap-3 text-sm">
          <span className="font-bold">Kích thước: {selectedSize}</span>
          <span className="flex gap-3 text-xs font-bold text-[#3568ff] underline underline-offset-4">
            <button type="button">Bảng kích thước</button>
            <button type="button">Hướng dẫn chọn size</button>
          </span>
        </legend>
        <div className="flex flex-wrap gap-3">
          {sizes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSizeChange(option)}
              aria-pressed={option === selectedSize}
              className={cn(
                "h-[43px] w-[102px] rounded-pill border-[3px] text-base transition-colors",
                option === selectedSize
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:border-primary"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
