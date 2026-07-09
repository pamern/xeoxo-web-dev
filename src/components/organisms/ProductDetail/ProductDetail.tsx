"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { TextActionButton } from "@/components/atoms/TextActionButton";
import { StarRating } from "@/components/atoms/StarRating";
import { ProductImageGallery } from "@/components/organisms/ProductImageGallery";
import { AppointmentModal } from "@/components/organisms/AppointmentModal";
import { CustomizeModal } from "@/components/organisms/CustomizeModal";
import { SizeGuideModal } from "@/components/organisms/SizeGuideModal";
import { SizeRecommendationModal } from "@/components/organisms/SizeRecommendationModal";
import { VariantSelector } from "@/components/organisms/VariantSelector";
import { ROUTES } from "@/constants/routes";
import { formatPrice } from "@/lib/utils";
import { cartService } from "@/services/cart.service";
import type { CartItemDto } from "@/types/cart.types";
import type { ProductDetailDto } from "@/types/product-api.types";
import type { Product } from "@/types/product.types";

const APPOINTMENT_BRANCHES = [
  { label: "XEO XO Hà Nội", value: "ha-noi" },
  { label: "XEO XO Sài Gòn", value: "sai-gon" },
];

const APPOINTMENT_TIME_SLOTS = [
  { id: "09:00", label: "09:00" },
  { id: "10:30", label: "10:30" },
  { id: "14:00", label: "14:00" },
  { id: "15:30", label: "15:30" },
  { id: "17:00", label: "17:00" },
];

export function ProductDetail({
  product,
  apiProduct,
  relatedProducts = [],
}: {
  product: Product;
  apiProduct: ProductDetailDto;
  relatedProducts?: Product[];
}) {
  const resolvedApiProduct = apiProduct;
  const initialSize =
    resolvedApiProduct?.sizes.find((option) => option.is_available)
      ?.size_name ?? "";
  const [size, setSize] = useState(initialSize);
  const [color, setColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addedItem, setAddedItem] = useState<CartItemDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isAdding, setIsAdding] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isSizeRecommendationOpen, setIsSizeRecommendationOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const selectedVariant = resolvedApiProduct?.sizes.find(
    (option) => option.size_name === size,
  );
  const price =
    selectedVariant?.price ??
    resolvedApiProduct?.price ??
    product.salePrice ??
    product.price;
  const stockQuantity = selectedVariant?.stock_quantity ?? 0;
  const maxQuantity = Math.max(1, stockQuantity);

  useEffect(() => {
    setQuantity((current) =>
      Math.min(Math.max(1, current), Math.max(1, maxQuantity)),
    );
  }, [maxQuantity, size]);

  useEffect(() => {
    if (!resolvedApiProduct) return;
    const current = resolvedApiProduct.sizes.find(
      (option) => option.size_name === size && option.is_available,
    );
    if (!current) {
      setSize(
        resolvedApiProduct.sizes.find((option) => option.is_available)
          ?.size_name ?? "",
      );
    }
    if (resolvedApiProduct.color) {
      setColor({
        name: resolvedApiProduct.color.color_name,
        hex: resolvedApiProduct.color.color_code,
      });
    }
  }, [resolvedApiProduct, size]);

  async function handleAdd() {
    setErrorMessage(undefined);
    setIsAdding(true);

    try {
      if (selectedVariant?.variant_id) {
        const cart = await cartService.addItem({
          variant_id: selectedVariant.variant_id,
          quantity,
        });
        setAddedItem(
          cart.items.find(
            (item) => item.variant_id === selectedVariant.variant_id,
          ) ?? null,
        );
        window.dispatchEvent(new Event("xeoxo-cart-updated"));
      } else {
        throw new Error(
          "Vui lòng chọn size có sẵn trước khi thêm vào giỏ hàng.",
        );
      }
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể thêm sản phẩm vào giỏ.",
      );
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div
      className="relative grid lg:grid-cols-[minmax(0,var(--product-gallery-main-width))_minmax(0,1fr)] lg:items-start lg:justify-between"
      style={{ gap: "var(--product-detail-grid-gap)" }}
    >
      {added && addedItem && (
        <AddToCartPopup item={addedItem} onClose={() => setAdded(false)} />
      )}
      {isSizeGuideOpen && (
        <SizeGuideModal
          gender={product.gender}
          onClose={() => setIsSizeGuideOpen(false)}
        />
      )}
      {isSizeRecommendationOpen && (
        <SizeRecommendationModal
          gender={product.gender}
          sizes={resolvedApiProduct.sizes}
          onOpenAppointment={() => {
            setIsSizeRecommendationOpen(false);
            setIsAppointmentOpen(true);
          }}
          onOpenCustomize={() => {
            setIsSizeRecommendationOpen(false);
            setIsCustomizeOpen(true);
          }}
          onClose={() => setIsSizeRecommendationOpen(false)}
        />
      )}
      {isAppointmentOpen && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-[1px] sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAppointmentOpen(false);
          }}
        >
          <div className="w-full max-w-content">
            <AppointmentModal
              branches={APPOINTMENT_BRANCHES}
              timeSlots={APPOINTMENT_TIME_SLOTS}
              onClose={() => setIsAppointmentOpen(false)}
              className="max-w-content"
            />
          </div>
        </div>
      )}
      {isCustomizeOpen && (
        <CustomizeModal
          gender={product.gender}
          basePrice={price}
          onClose={() => setIsCustomizeOpen(false)}
        />
      )}

      <ProductImageGallery images={product.images} alt={product.name} />

      <aside className="flex flex-col lg:min-h-[var(--product-detail-side-min-height)] lg:justify-between">
        <section className="border-b border-black pb-5">
          <h1 className="text-display-section md:text-display-page">
            {product.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-body-sm">
            <StarRating rating={4.5} size={22} />
            <span className="text-foreground/70">(4.5)</span>
            <span className="text-action">Chia sẻ</span>
          </div>
        </section>

        <div className="py-5">
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-heading-section md:text-display-section">
              {formatPrice(price)}
            </span>
            {product.salePrice && (
              <span className="text-body-lg text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-body font-medium">
            <Image
              src="/icons/freeship.svg"
              alt=""
              width={26}
              height={18}
              aria-hidden
            />
            Freeship
          </div>
        </div>

        <ProductNotice
          icon="/icons/gift.svg"
          title="Tận hưởng đặc quyền hấp dẫn khi tham gia Xéo Hội"
        />

        <div className="mt-5">
          <VariantSelector
            colors={resolvedApiProduct?.color ? [color] : product.colors}
            sizes={resolvedApiProduct?.sizes ?? []}
            selectedColor={color}
            selectedSize={size}
            onColorChange={setColor}
            onSizeChange={setSize}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
            onOpenSizeRecommendation={() => setIsSizeRecommendationOpen(true)}
            onOpenCustomize={() => setIsCustomizeOpen(true)}
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[95px_minmax(0,1fr)]">
          <QuantityPill
            value={quantity}
            max={Math.max(1, maxQuantity)}
            onChange={setQuantity}
          />
          <Button
            onClick={handleAdd}
            variant="cart"
            size="cart"
            disabled={isAdding || !selectedVariant?.is_available}
            className="min-w-0"
          >
            <Image
              src="/icons/cart.svg"
              alt=""
              width={28}
              height={28}
              aria-hidden
              className="invert"
            />
            {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
          </Button>
        </div>

        {selectedVariant && (
          <p
            className={`mt-3 rounded-sm px-4 py-2 text-body-sm font-semibold ${
              stockQuantity > 0
                ? "bg-success-muted text-success"
                : "bg-red-50 text-destructive"
            }`}
          >
            {stockQuantity > 0
              ? `Còn ${stockQuantity} sản phẩm trong kho`
              : "Sản phẩm đã hết hàng"}
          </p>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="mt-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-body-sm font-semibold text-destructive"
          >
            {errorMessage}
          </p>
        )}

        <TextActionButton type="button" className="mx-auto mt-5 text-button">
          Mô tả sản phẩm
        </TextActionButton>

        <div className="mt-4 border-t-2 border-[#d9d9d9] pt-4">
          <div
            className="grid rounded-md bg-[#ededed] px-7 py-4 sm:grid-cols-2"
            style={{
              columnGap: "var(--product-detail-services-gap-x)",
              rowGap: "var(--product-detail-services-gap-y)",
            }}
          >
            <ProductService
              icon="/icons/freeship.svg"
              title="Freeship"
              text="Cho đơn từ 300k"
            />
            <ProductService
              icon="/icons/72h.svg"
              title="Hỗ trợ 72h"
              text="Đổi size hoặc đổi mẫu"
            />
            <ProductService
              icon="/icons/phone-sound.svg"
              title="Hotline"
              text="039.412.6656 hỗ trợ 24/7"
            />
            <ProductService
              icon="/icons/tailor.svg"
              title="Hỗ trợ may đo"
              text="Theo số đo cá nhân"
            />
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-4 border-t-2 border-[#d9d9d9] pt-4">
            <h2 className="mb-3 text-heading-card uppercase">
              Có thể phù hợp với bạn
            </h2>
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
    <div className="flex min-h-control items-center justify-between gap-4 rounded-md border border-border bg-[#fffdfd] px-5">
      <span className="flex items-center gap-4">
        <span className="flex h-[29px] w-[37px] items-center justify-center rounded-xs border border-accent">
          <Image src={icon} alt="" width={22} height={22} aria-hidden />
        </span>
        <span className="text-body-sm font-medium">{title}</span>
      </span>
      <Image
        src="/icons/chevron-down.svg"
        alt=""
        width={14}
        height={8}
        aria-hidden
      />
    </div>
  );
}

function AddToCartPopup({
  item,
  onClose,
}: {
  item: CartItemDto;
  onClose: () => void;
}) {
  return (
    <div className="fixed right-6 top-[clamp(112px,13vw,170px)] z-50 w-[min(92vw,clamp(380px,28vw,520px))] rounded-[18px] bg-white px-7 py-6 text-black shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-heading-card">Thêm vào giỏ hàng thành công</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="text-3xl leading-none text-black transition hover:text-black/60"
        >
          ×
        </button>
      </div>

      <div className="mt-4 border-t border-black/35 pt-4">
        <div className="grid grid-cols-[82px_minmax(0,1fr)] gap-4">
          <div className="relative h-[82px] w-[82px] overflow-hidden bg-secondary">
            <Image
              src={item.thumbnail || "/images/placeholder.png"}
              alt={item.name}
              fill
              sizes="82px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-heading-card">{item.name}</h3>
            <p className="mt-1 text-body-sm text-black/70">
              {[item.color, item.size].filter(Boolean).join(" - ")}
            </p>
            <p className="mt-1 text-body">
              {item.quantity} <span className="mx-2">×</span>{" "}
              <strong>{formatPrice(item.unit_price)}</strong>
            </p>
          </div>
        </div>

        <Link
          href={ROUTES.CART}
          className="mt-5 inline-flex min-h-control min-w-[220px] items-center justify-center rounded-pill border border-black px-8 text-button-sm transition hover:bg-black hover:text-white"
        >
          Xem giỏ hàng
        </Link>
      </div>
    </div>
  );
}

function QuantityPill({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex h-control items-center justify-between px-1 text-button-lg">
      <button
        type="button"
        aria-label="Giảm số lượng"
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        −
      </button>
      <span className="font-medium">{value}</span>
      <button
        type="button"
        aria-label="Tăng số lượng"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="disabled:cursor-not-allowed disabled:opacity-30"
      >
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
        <Image
          src={icon}
          alt=""
          width={36}
          height={32}
          aria-hidden
          className="max-h-8 w-auto"
        />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-caption font-bold">{title}</span>
        <span className="text-caption font-light text-foreground/80">
          {text}
        </span>
      </span>
    </div>
  );
}

function CompactProduct({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-2">
      <MiniProductImage image={product.images[0]} alt={product.name} />
      <div>
        <h3 className="line-clamp-2 text-body-sm font-light leading-snug">
          {product.name}
        </h3>
        <p className="text-body-sm font-bold">
          {formatPrice(product.salePrice ?? product.price)}
        </p>
      </div>
    </div>
  );
}

function MiniProductImage({ image, alt }: { image: string; alt: string }) {
  return (
    <div className="group relative aspect-[175/236] overflow-hidden bg-secondary">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="175px"
        className="object-cover"
      />
      <IconButton
        iconSrc="/icons/add-cart.svg"
        iconSize={17}
        iconClassName="invert"
        variant="circleDark"
        size="sm"
        aria-label="Thêm vào giỏ hàng"
        className="absolute bottom-3 right-3"
      />
    </div>
  );
}
