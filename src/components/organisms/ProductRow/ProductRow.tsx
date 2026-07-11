import { ProductCard } from "@/components/molecules/ProductCard";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product.types";

// Một hàng sản phẩm cuộn ngang (carousel) + tiêu đề. Dùng ở trang chủ & catalog.
export function ProductRow({
  title,
  products,
  actionHref,
  quickAddOnHover = false,
  cardClassName,
  className,
}: {
  title?: string;
  products: Product[];
  actionHref?: string;
  quickAddOnHover?: boolean;
  cardClassName?: string;
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className={cn("product-row-shell", className)}>
      {title && <SectionHeading title={title} actionHref={actionHref} />}
      <div className="product-row-track">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className={
              cardClassName ?? "w-[240px] shrink-0 md:w-[300px] lg:w-auto xl:w-auto"
            }
            quickAddOnHover={quickAddOnHover}
          />
        ))}
      </div>
    </section>
  );
}
