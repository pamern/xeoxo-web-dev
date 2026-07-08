"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useQuickAddProduct } from "@/hooks/useQuickAddProduct";
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
  const hoverImage = product.images[1] ?? product.images[0];
  const onSale = typeof product.salePrice === "number" && product.salePrice < product.price;
  const quickAdd = useQuickAddProduct(product.slug);
  const productHref = ROUTES.PRODUCT(product.slug);

  useEffect(() => {
    if (quickAddOnHover) {
      quickAdd.prefetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickAddOnHover, product.slug]);

  // Khi đã có dữ liệu chi tiết thật, lấy đúng danh sách size của sản phẩm này
  // (không dùng product.sizes tĩnh vì đó chỉ là placeholder mặc định, có thể thiếu XS/2XL...).
  // Trong lúc chưa tải xong thì tạm hiện theo danh sách mặc định, khóa hết để tránh bấm nhầm.
  const quickAddSizes = quickAdd.productDetail
    ? quickAdd.productDetail.sizes.slice(0, 5).map((option) => ({
        size: option.size_name,
        isAvailable: option.is_available,
      }))
    : product.sizes.slice(0, 5).map((size) => ({ size, isAvailable: false }));

  // Sản phẩm chỉ có 1 size (freesize/one-size) — không cần lưới chọn size,
  // chỉ cần 1 nút thêm giỏ hàng, kèm badge để nhận biết ngay cả khi chưa hover.
  const isSingleSize =
    Boolean(quickAdd.productDetail) && quickAdd.productDetail!.sizes.length <= 1;
  const singleSize = quickAddSizes[0];

  return (
    <article className={cn("group flex flex-col gap-3", className)}>
      <div
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-secondary",
          imageClassName,
        )}
      >
        <Link href={productHref} className="relative block h-full w-full">
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
        </Link>

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isNew && (
            <span className="rounded-pill bg-primary px-3 py-1 text-caption text-primary-foreground">
              NEW
            </span>
          )}
          {isSingleSize && (
            <span className="rounded-pill bg-black/70 px-3 py-1 text-caption text-white">
              1 SIZE
            </span>
          )}
        </div>
        {onSale && (
          <span className="absolute right-3 top-3 rounded-pill bg-destructive px-3 py-1 text-caption text-destructive-foreground">
            SALE
          </span>
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
              <p
                className={cn(
                  "mb-1.5 text-center text-[12px] font-light leading-none",
                  quickAdd.status === "error" && "font-medium text-red-100",
                )}
                aria-live="polite"
              >
                {quickAdd.message ?? "Thêm vào giỏ hàng"}
              </p>
              {isSingleSize && singleSize ? (
                <SingleSizeAddButton
                  size={singleSize.size}
                  isAvailable={singleSize.isAvailable}
                  isLoading={quickAdd.isLoading}
                  isSuccess={quickAdd.status === "success"}
                  onAdd={() => void quickAdd.addSize(singleSize.size)}
                />
              ) : (
                <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                  {quickAddSizes.map(({ size, isAvailable }, index) => {
                    const isActiveSize = quickAdd.selectedSize === size;
                    const isLoadingSize =
                      quickAdd.isLoading && quickAdd.selectedSize === size;
                    const isLocked = !isAvailable;

                    return (
                      <button
                        key={`${size}-${index}`}
                        type="button"
                        disabled={quickAdd.isLoading || isLocked}
                        aria-label={
                          isLocked
                            ? `Size ${size} đã hết hàng`
                            : `Thêm size ${size} vào giỏ hàng`
                        }
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (isLocked) return;
                          void quickAdd.addSize(size);
                        }}
                        className={cn(
                          "relative flex h-[18px] items-center justify-center overflow-hidden text-[12px] font-medium leading-none transition-colors duration-200",
                          isLocked
                            ? "cursor-not-allowed rounded-full border border-black/60 bg-gray-200 text-black/50"
                            : cn(
                                "rounded-[6px] bg-white/95 text-black shadow-[0_1px_4px_rgba(0,0,0,0.12)] hover:bg-black/80 hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.75)] disabled:cursor-wait disabled:opacity-70",
                                isActiveSize &&
                                  quickAdd.status === "success" &&
                                  "bg-black/80 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.75)]",
                              ),
                        )}
                        style={
                          isLocked
                            ? {
                                backgroundImage:
                                  "linear-gradient(to bottom right, transparent calc(50% - 1px), rgba(0,0,0,0.65) 50%, transparent calc(50% + 1px))",
                              }
                            : undefined
                        }
                      >
                        {isLoadingSize ? "..." : size}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Link href={productHref} className="transition-opacity hover:opacity-75">
        <h3 className="text-body-lg font-light leading-snug">{product.name}</h3>
      </Link>
      <Link
        href={productHref}
        className="flex items-center gap-3 transition-opacity hover:opacity-75"
      >
        <span className={cn("text-body-lg font-bold", onSale && "text-destructive")}>
          {formatPrice(onSale ? product.salePrice! : product.price)}
        </span>
        {onSale && (
          <span className="text-body-sm font-light text-muted-foreground line-through">
            {formatPrice(product.price)}
          </span>
        )}
      </Link>
    </article>
  );
}

function SingleSizeAddButton({
  size,
  isAvailable,
  isLoading,
  isSuccess,
  onAdd,
}: {
  size: string;
  isAvailable: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  onAdd: () => void;
}) {
  const isLocked = !isAvailable;

  return (
    <button
      type="button"
      disabled={isLoading || isLocked}
      aria-label={isLocked ? "Sản phẩm đã hết hàng" : "Thêm vào giỏ hàng"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (isLocked) return;
        onAdd();
      }}
      className={cn(
        "flex h-[26px] w-full items-center justify-center gap-1.5 rounded-full text-[12px] font-medium leading-none transition-colors duration-200",
        isLocked
          ? "cursor-not-allowed bg-gray-200 text-black/50"
          : cn(
              "bg-white/95 text-black shadow-[0_1px_4px_rgba(0,0,0,0.12)] hover:bg-black/80 hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.75)] disabled:cursor-wait disabled:opacity-70",
              isSuccess && "bg-black/80 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.75)]",
            ),
      )}
    >
      {isLoading ? "..." : isLocked ? "Hết hàng" : `Thêm vào giỏ · ${size || "Freesize"}`}
    </button>
  );
}
