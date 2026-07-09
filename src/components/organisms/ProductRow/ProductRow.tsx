import { ProductCard } from "@/components/molecules/ProductCard";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { Product } from "@/types/product.types";

// Một hàng sản phẩm cuộn ngang (carousel) + tiêu đề. Dùng ở trang chủ & catalog.
export function ProductRow({
  title,
  products,
  actionHref,
  quickAddOnHover = false,
  cardClassName,
}: {
  title: string;
  products: Product[];
  actionHref?: string;
  quickAddOnHover?: boolean;
  cardClassName?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="homepage-shell flex flex-col gap-6 py-10">
      <SectionHeading title={title} actionHref={actionHref} />
      <div className="homepage-product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className={cardClassName}
            quickAddOnHover={quickAddOnHover}
          />
        ))}
      </div>
    </section>
  );
}
