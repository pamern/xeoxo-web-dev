import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types/product.types";

// Card san pham dung trong moi luoi/carousel. Anh ti le ~3:4 + ten + gia.
export function ProductCard({
  product,
  className,
  imageClassName,
  quickAddOnHover = false,
}: {
  product: Product;
  className?: string;
  imageClassName?: string;
  quickAddOnHover?: boolean;
}) {
  const quickAddSizes = product.sizes.slice(0, 5);
  const hoverImage = product.images[1] ?? product.images[0];
  const onSale = typeof product.salePrice === "number" && product.salePrice < product.price;

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
          className={cn(
            "object-cover transition duration-500",
            quickAddOnHover ? "group-hover:scale-110" : "group-hover:scale-105",
          )}
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
        {quickAddOnHover && hoverImage !== product.images[0] && (
          <Image
            src={hoverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 351px"
            aria-hidden
            className="object-cover opacity-0 transition duration-500 group-hover:scale-110 group-hover:opacity-100"
          />
        )}
        {quickAddOnHover && quickAddSizes.length > 0 && (
          <div className="absolute inset-x-5 bottom-0 translate-y-3 overflow-hidden rounded-t-[14px] border border-white/30 bg-[#2D2A2A]/20 px-4 pb-2.5 pt-1.5 text-white opacity-0 shadow-[0_14px_36px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.45),inset_1px_0_0_rgba(255,255,255,0.18),inset_-1px_0_0_rgba(255,255,255,0.12),inset_0_-18px_32px_rgba(0,0,0,0.12)] ring-1 ring-white/20 backdrop-blur-[10px] backdrop-saturate-150 backdrop-contrast-125 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/45"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.34),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.04)_38%,rgba(0,0,0,0.10)_100%)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -left-8 top-0 h-full w-20 rotate-12 bg-white/18 blur-[18px]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-3 top-1 h-8 rounded-full bg-white/10 blur-xl"
            />
            <div className="relative">
              <p className="mb-1.5 text-center text-[12px] font-light leading-none">
                Thêm vào giỏ hàng
              </p>
              <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                {quickAddSizes.map((size, index) => (
                  <span
                    key={`${size}-${index}`}
                    className="flex h-[18px] items-center justify-center rounded-[6px] bg-white/95 text-[12px] font-medium leading-none text-black shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition-colors duration-200 hover:bg-black/80 hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.75)]"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          </div>
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
