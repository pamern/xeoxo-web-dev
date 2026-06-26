import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { productRoute } from "@/constants/routes";
import type { Product } from "@/types/product.types";

// Card sản phẩm dùng trong mọi lưới/carousel. Ảnh tỉ lệ ~3:4 + tên + giá.
export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const onSale = typeof product.salePrice === "number";

  return (
    <Link
      href={productRoute(product.slug)}
      className={cn("group flex flex-col gap-3", className)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-secondary">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 351px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-pill bg-primary px-3 py-1 text-xs text-primary-foreground">
            NEW
          </span>
        )}
        {onSale && (
          <span className="absolute right-3 top-3 rounded-pill bg-destructive px-3 py-1 text-xs text-destructive-foreground">
            SALE
          </span>
        )}
      </div>
      <h3 className="text-lg font-light leading-snug">{product.name}</h3>
      <div className="flex items-center gap-3">
        <span className={cn("text-lg font-bold", onSale && "text-destructive")}>
          {formatPrice(onSale ? product.salePrice! : product.price)}
        </span>
        {onSale && (
          <span className="text-sm font-light text-muted-foreground line-through">
            {formatPrice(product.price)}
          </span>
        )}
      </div>
    </Link>
  );
}
