import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types/product.types";

// Card sản phẩm dùng trong mọi lưới/carousel. Ảnh tỉ lệ ~3:4 + tên + giá.
export function ProductCard({
  product,
  className,
  imageClassName,
}: {
  product: Product;
  className?: string;
  imageClassName?: string;
}) {
  const onSale = typeof product.salePrice === "number";

  return (
    <Link
      href={ROUTES.PRODUCT(product.slug)}
      className={cn("group flex flex-col gap-3", className)}
    >
      <div
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-secondary",
          imageClassName
        )}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 351px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-pill bg-primary px-3 py-1 text-caption text-primary-foreground">
            NEW
          </span>
        )}
        {onSale && (
          <span className="absolute right-3 top-3 rounded-pill bg-destructive px-3 py-1 text-caption text-destructive-foreground">
            SALE
          </span>
        )}
      </div>
      <h3 className="text-body-lg font-light leading-snug">{product.name}</h3>
      <div className="flex items-center gap-3">
        <span className={cn("text-body-lg font-bold", onSale && "text-destructive")}>
          {formatPrice(onSale ? product.salePrice! : product.price)}
        </span>
        {onSale && (
          <span className="text-body-sm font-light text-muted-foreground line-through">
            {formatPrice(product.price)}
          </span>
        )}
      </div>
    </Link>
  );
}
