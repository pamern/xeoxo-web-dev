// import { ProductCard } from "@/components/molecules/ProductCard";
// import { SectionHeading } from "@/components/molecules/SectionHeading";
// import { cn } from "@/lib/utils";
// import type { Product } from "@/types/product.types";

// // Một hàng sản phẩm cuộn ngang (carousel) + tiêu đề. Dùng ở trang chủ & catalog.
// export function ProductRow({
//   title,
//   products,
//   actionHref,
//   quickAddOnHover = false,
//   cardClassName,
//   className,
// }: {
//   title?: string;
//   products: Product[];
//   actionHref?: string;
//   quickAddOnHover?: boolean;
//   cardClassName?: string;
//   className?: string;
// }) {
//   if (products.length === 0) return null;

//   return (
//     <section className={cn("product-row-shell", className)}>
//       {title && <SectionHeading title={title} actionHref={actionHref} />}
//       <div className="product-row-track">
//         {products.map((product) => (
//           <ProductCard
//             key={product.id}
//             product={product}
//             className={
//               cardClassName ?? "min-w-0 w-full"
//             }
//             quickAddOnHover={quickAddOnHover}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }

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
    <section className="site-container flex flex-col gap-5 py-8 md:gap-6 md:py-10">
      <SectionHeading title={title} actionHref={actionHref} />
      <div className="no-scrollbar grid auto-cols-[15rem] grid-flow-col gap-4 overflow-x-auto pb-4 sm:auto-cols-[17rem] lg:grid-flow-row lg:grid-cols-4 lg:auto-cols-auto lg:overflow-visible lg:gap-x-3.5 lg:gap-y-6 xl:gap-x-4 xl:gap-y-7">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className={
              cardClassName ?? "min-w-0 w-full"
            }
            quickAddOnHover={quickAddOnHover}
          />
        ))}
      </div>
    </section>
  );
}