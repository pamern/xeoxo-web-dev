import { ProductCard } from "@/components/molecules/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product.types";

// Lưới sản phẩm cho trang danh mục/bộ sưu tập, kèm empty state.
export function ProductGrid({
  products,
  className,
  cardClassName,
  cardImageClassName,
  quickAddOnHover = false,
}: {
  products: Product[];
  className?: string;
  cardClassName?: string;
  cardImageClassName?: string;
  quickAddOnHover?: boolean;
}) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Hiện chưa có sản phẩm nào trong mục này.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3.5 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 xl:grid-cols-4 xl:gap-x-4 xl:gap-y-7",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={`${product.id}-${index}`}
          product={product}
          className={cardClassName}
          imageClassName={cardImageClassName}
          quickAddOnHover={quickAddOnHover}
        />
      ))}
    </div>
  );
}
