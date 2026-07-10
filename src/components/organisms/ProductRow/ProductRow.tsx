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
    <section className="mx-auto flex w-full max-w-site flex-col gap-6 px-6 py-10 xl:px-[100px]">
      <SectionHeading title={title} actionHref={actionHref} />
      <div className="no-scrollbar -mx-6 flex gap-6 overflow-x-auto px-6 pb-8 xl:-mx-[100px] xl:px-[100px] lg:grid lg:grid-cols-4 lg:mx-0 lg:px-0 lg:overflow-x-visible">
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
