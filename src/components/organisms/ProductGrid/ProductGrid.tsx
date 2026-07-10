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
        "grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 xl:grid-cols-4",
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
