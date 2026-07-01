"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { TextActionButton } from "@/components/atoms/TextActionButton";
import { ProductImageGallery } from "@/components/organisms/ProductImageGallery";
import { VariantSelector } from "@/components/organisms/VariantSelector";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import type { Product } from "@/types/product.types";

export function ProductDetail({
  product,
  relatedProducts = [],
}: {
  product: Product;
  relatedProducts?: Product[];
}) {
  const addLine = useCartStore((state) => state.addLine);
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const price = product.salePrice ?? product.price;

  function handleAdd() {
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price,
      image: product.images[0],
      size,
      color: color.name,
      quantity,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,728px)_minmax(0,714px)] lg:items-start lg:justify-between xl:gap-20">
      <ProductImageGallery images={product.images} alt={product.name} />

      <aside className="flex flex-col">
        <section className="border-b border-black pb-4">
          <h1 className="text-[28px] font-bold leading-tight md:text-[36px]">
            {product.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-[22px] leading-none">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>◐</span>
            </span>
            <span className="text-foreground/70">(4.5)</span>
            <span className="text-[#3568ff]">Chia sẻ</span>
          </div>
        </section>

        <div className="pb-3 pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-[32px] font-bold leading-none md:text-[36px]">
              {formatPrice(price)}
            </span>
            {product.salePrice && (
              <span className="text-lg font-light text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-base font-medium">
            <Image src="/icons/freeship.svg" alt="" width={26} height={18} aria-hidden />
            Freeship
          </div>
        </div>

        <ProductNotice
          icon="/icons/gift.svg"
          title="Tận hưởng đặc quyền hấp dẫn khi tham gia Xéo Hội"
        />

        <div className="mt-3">
          <VariantSelector
            colors={product.colors}
            sizes={product.sizes}
            selectedColor={color}
            selectedSize={size}
            onColorChange={setColor}
            onSizeChange={setSize}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Button
            type="button"
            variant="floralPill"
            size="floral"
            backgroundImage="/images/bg-gia-nhap-btn.png"
          >
            Đặt lịch may đo
          </Button>
          <Button type="button" variant="secondaryPill" size="pill">
            Chọn size nhanh
          </Button>
        </div>

        <div className="mt-3 grid gap-4 sm:grid-cols-[95px_minmax(0,1fr)]">
          <QuantityPill value={quantity} onChange={setQuantity} />
          <Button onClick={handleAdd} variant="cart" size="cart" className="min-w-0">
            <Image src="/icons/cart.svg" alt="" width={28} height={28} aria-hidden className="invert" />
            {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
          </Button>
        </div>

        <TextActionButton
          type="button"
          className="mx-auto mt-3 text-base"
        >
          Mô tả sản phẩm
        </TextActionButton>

        <div className="mt-2 border-t-2 border-[#d9d9d9] pt-3">
          <div className="grid gap-x-10 gap-y-3 rounded-[10px] bg-[#ededed] px-7 py-4 sm:grid-cols-2">
            <ProductService icon="/icons/freeship.svg" title="Freeship" text="Cho đơn từ 300k" />
            <ProductService icon="/icons/72h.svg" title="Hỗ trợ 72h" text="Đổi size hoặc đổi mẫu" />
            <ProductService icon="/icons/phone-sound.svg" title="Hotline" text="039.412.6656 hỗ trợ 24/7" />
            <ProductService icon="/icons/tailor.svg" title="Hỗ trợ may đo" text="Theo số đo cá nhân" />
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-4 border-t-2 border-[#d9d9d9] pt-4">
            <h2 className="mb-3 text-lg font-bold uppercase">Có thể phù hợp với bạn</h2>
            <div className="grid grid-cols-3 gap-4">
              {relatedProducts.slice(0, 3).map((item) => (
                <CompactProduct key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function ProductNotice({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex h-[60px] items-center justify-between gap-4 rounded-[10px] border border-border bg-[#fffdfd] px-5">
      <span className="flex items-center gap-4">
        <span className="flex h-[29px] w-[37px] items-center justify-center rounded-[3px] border border-[#ff593d]">
          <Image src={icon} alt="" width={22} height={22} aria-hidden />
        </span>
        <span className="text-sm font-medium">{title}</span>
      </span>
      <Image src="/icons/chevron-down.svg" alt="" width={14} height={8} aria-hidden />
    </div>
  );
}

function QuantityPill({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex h-[54px] items-center justify-between px-1 text-lg">
      <button type="button" aria-label="Giảm số lượng" onClick={() => onChange(Math.max(1, value - 1))}>
        −
      </button>
      <span className="font-medium">{value}</span>
      <button type="button" aria-label="Tăng số lượng" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

function ProductService({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4">
      <span className="flex h-[47px] w-[72px] items-center justify-center rounded-[9px] border-[3px] border-black bg-white">
        <Image src={icon} alt="" width={36} height={32} aria-hidden className="max-h-8 w-auto" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-xs font-bold">{title}</span>
        <span className="text-[11px] font-light leading-relaxed text-foreground/80">{text}</span>
      </span>
    </div>
  );
}

function CompactProduct({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-2">
      <MiniProductImage image={product.images[0]} alt={product.name} />
      <div>
        <h3 className="line-clamp-2 text-sm font-light leading-snug">{product.name}</h3>
        <p className="text-sm font-bold">{formatPrice(product.salePrice ?? product.price)}</p>
      </div>
    </div>
  );
}

function MiniProductImage({ image, alt }: { image: string; alt: string }) {
  return (
    <div className="group relative aspect-[175/236] overflow-hidden bg-secondary">
      <Image src={image} alt={alt} fill sizes="175px" className="object-cover" />
      <IconButton
        iconSrc="/icons/add-cart.svg"
        iconSize={17}
        iconClassName="invert"
        variant="circleDark"
        size="sm"
        aria-label="Them vao gio hang"
        className="absolute bottom-3 right-3"
      />
    </div>
  );
}
