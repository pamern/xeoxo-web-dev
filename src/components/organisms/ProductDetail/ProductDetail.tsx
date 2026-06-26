"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import type { Product } from "@/types/product.types";

// Phần tương tác của trang chi tiết: chọn ảnh, size, màu, số lượng, thêm giỏ.
export function ProductDetail({ product }: { product: Product }) {
  const addLine = useCartStore((s) => s.addLine);
  const [activeImage, setActiveImage] = useState(0);
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
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Gallery */}
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-secondary">
          <Image
            src={product.images[activeImage]}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
          />
        </div>
        <div className="flex gap-3">
          {product.images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveImage(index)}
              aria-label={`Ảnh ${index + 1}`}
              className={cn(
                "relative aspect-[3/4] w-20 overflow-hidden rounded-sm border-2",
                index === activeImage ? "border-primary" : "border-transparent"
              )}
            >
              <Image src={image} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-medium md:text-4xl">{product.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{formatPrice(price)}</span>
            {product.salePrice && (
              <span className="text-lg font-light text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        <p className="text-base font-light leading-relaxed text-foreground/80">
          {product.description}
        </p>

        {/* Màu sắc */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-base font-medium">Màu sắc: {color.name}</legend>
          <div className="flex gap-3">
            {product.colors.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => setColor(option)}
                aria-label={option.name}
                aria-pressed={option.name === color.name}
                style={{ backgroundColor: option.hex }}
                className={cn(
                  "h-10 w-10 rounded-full border-2 transition-transform",
                  option.name === color.name
                    ? "scale-110 border-primary"
                    : "border-border"
                )}
              />
            ))}
          </div>
        </fieldset>

        {/* Size */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-base font-medium">Kích thước</legend>
          <div className="flex gap-3">
            {product.sizes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSize(option)}
                aria-pressed={option === size}
                className={cn(
                  "h-11 min-w-11 rounded-md border px-4 text-base transition-colors",
                  option === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:border-primary"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Số lượng + thêm giỏ */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-pill border border-input">
            <button
              type="button"
              aria-label="Giảm số lượng"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-12 w-12 text-xl"
            >
              −
            </button>
            <span className="w-10 text-center text-lg">{quantity}</span>
            <button
              type="button"
              aria-label="Tăng số lượng"
              onClick={() => setQuantity((q) => q + 1)}
              className="h-12 w-12 text-xl"
            >
              +
            </button>
          </div>
          <Button onClick={handleAdd} size="lg" className="flex-1">
            {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
          </Button>
        </div>
      </div>
    </div>
  );
}
