import { ProductCard } from "@/components/molecules/ProductCard";
import type { Product } from "@/types/product.types";

// Lưới sản phẩm cho trang danh mục/bộ sưu tập, kèm empty state.
export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Hiện chưa có sản phẩm nào trong mục này.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
