"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { StarRating } from "@/components/atoms/StarRating";
import { TextActionButton } from "@/components/atoms/TextActionButton";
import { ProductImageGallery } from "@/components/organisms/ProductImageGallery";
import { AppointmentModal } from "@/components/organisms/AppointmentModal";
import { CustomizeModal } from "@/components/organisms/CustomizeModal";
import { SizeGuideModal } from "@/components/organisms/SizeGuideModal";
import { SizeRecommendationModal } from "@/components/organisms/SizeRecommendationModal";
import { VariantSelector } from "@/components/organisms/VariantSelector";
import { useCartToast } from "@/components/providers/CartToastProvider";
import { cn, formatPrice } from "@/lib/utils";
import { cartService } from "@/services/cart.service";
import { createCustomizationRequest } from "@/services/customization.service";
import { saveProfile } from "@/services/measurement.service";
import { useAuth } from "@/hooks/useAuth";
import { useSharedMeasurements } from "@/hooks/useSharedMeasurements";
import type { MeasurementValues } from "@/features/size-recommendation/size-recommendation";
import type { CartItemDto } from "@/types/cart.types";
import type {
  ProductComponentDto,
  ProductDetailDto,
  ProductSizeOptionDto,
} from "@/types/product-api.types";
import type { Product, ProductColor } from "@/types/product.types";

const APPOINTMENT_BRANCHES = [
  { label: "06 Nam Ngư, Phường Hoàn Kiếm, Hà Nội.", value: "1" },
  { label: "43 Đặng Thị Nhu, Phường Sài Gòn, TP. Hồ Chí Minh.", value: "2" },
];

const APPOINTMENT_TIME_SLOTS = [
  { id: "08:00", label: "8h00 - 9h00" },
  { id: "09:00", label: "9h00 - 10h00" },
  { id: "10:00", label: "10h00 - 11h00" },
  { id: "11:00", label: "11h00 - 12h00" },
  { id: "13:00", label: "13h00 - 14h00" },
  { id: "14:00", label: "14h00 - 15h00" },
  { id: "15:00", label: "15h00 - 16h00" },
  { id: "16:00", label: "16h00 - 17h00" },
];

type ComponentSelection = {
  customizationId?: number;
  quantity: number;
  sizeName?: string;
  variantId?: number;
};

function getReadableTextColor(hex: string) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "#ffffff";
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.58 ? "#111111" : "#ffffff";
}

function getDisplaySizeName(option: ProductSizeOptionDto) {
  const sizeName = option.size_name?.trim();
  return sizeName ? sizeName : "Freesize";
}

export function ProductDetail({
  product,
  apiProduct,
  relatedProducts = [],
}: {
  product: Product;
  apiProduct: ProductDetailDto;
  relatedProducts?: Product[];
}) {
  const [size, setSize] = useState("");
  const [color, setColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isAdding, setIsAdding] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isSizeRecommendationOpen, setIsSizeRecommendationOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [showPurchasePanel, setShowPurchasePanel] = useState(false);
  const [activeCustomizeComponentId, setActiveCustomizeComponentId] =
    useState<number | null>(null);
  const [componentSelections, setComponentSelections] = useState<
    Record<number, ComponentSelection>
  >({});
  const [tempCustomization, setTempCustomization] = useState<{
    values: MeasurementValues;
    note: string;
    saveAsDefault: boolean;
  } | null>(null);
  const [tempComponentCustomizations, setTempComponentCustomizations] = useState<
    Record<
      number,
      {
        values: MeasurementValues;
        note: string;
        saveAsDefault: boolean;
      }
    >
  >({});
  const { showAddedToCart } = useCartToast();
  const { isAuthenticated } = useAuth();
  const {
    profile: savedMeasurementProfile,
    values: sharedMeasurementValues,
    updateValues: updateSharedMeasurementValues,
    clearValues: clearSharedMeasurementValues,
  } = useSharedMeasurements(product.gender);
  const canPersistMeasurements = isAuthenticated;

  function openAppointmentModal() {
    setIsAppointmentOpen(true);
  }

  const components = apiProduct.components ?? [];
  const isMultiComponent = components.length > 1;
  const selectedVariant = apiProduct.sizes.find(
    (option) => getDisplaySizeName(option) === size,
  );
  const defaultComponent = components[0];
  const activeCustomizeComponent =
    activeCustomizeComponentId == null
      ? defaultComponent
      : components.find(
          (component) => component.component_id === activeCustomizeComponentId,
        );
  const isCustomized = size === "CUSTOM";
  const isAnyOverlayOpen =
    isSizeGuideOpen ||
    isSizeRecommendationOpen ||
    isAppointmentOpen ||
    isCustomizeOpen;
  const customBasePrice =
    defaultComponent?.min_price ?? apiProduct.price ?? product.salePrice ?? product.price;
  const customPrice = customBasePrice * 1.2;
  const price = isCustomized
    ? customPrice
    : selectedVariant?.price ?? apiProduct.price ?? product.salePrice ?? product.price;
  const stockQuantity = selectedVariant?.stock_quantity ?? 0;
  const maxQuantity = Math.max(1, stockQuantity);

  useEffect(() => {
    setQuantity((current) =>
      Math.min(Math.max(1, current), Math.max(1, maxQuantity)),
    );
  }, [maxQuantity, size]);

  useEffect(() => {
    if (!apiProduct.color) return;
    setColor({
      name: apiProduct.color.color_name,
      hex: apiProduct.color.color_code,
    });
  }, [apiProduct.color]);

  useEffect(() => {
    if (isMultiComponent) {
      setShowPurchasePanel(false);
      document.body.classList.remove("pdp-follow-bar-active");
      return;
    }

    function syncFollowBarState() {
      const descriptionSection = document.getElementById("product-description-section");
      if (!descriptionSection) {
        setShowPurchasePanel(false);
        document.body.classList.remove("pdp-follow-bar-active");
        return;
      }

      const rect = descriptionSection.getBoundingClientRect();
      const shouldShow = !isAnyOverlayOpen && rect.top <= window.innerHeight;
      setShowPurchasePanel(shouldShow);
      document.body.classList.toggle("pdp-follow-bar-active", shouldShow);
    }

    syncFollowBarState();
    window.addEventListener("scroll", syncFollowBarState, { passive: true });
    window.addEventListener("resize", syncFollowBarState);

    return () => {
      document.body.classList.remove("pdp-follow-bar-active");
      window.removeEventListener("scroll", syncFollowBarState);
      window.removeEventListener("resize", syncFollowBarState);
    };
  }, [isAnyOverlayOpen, isMultiComponent]);

  useEffect(() => {
    document.body.classList.toggle("pdp-overlay-open", isAnyOverlayOpen);

    return () => {
      document.body.classList.remove("pdp-overlay-open");
    };
  }, [isAnyOverlayOpen]);

  async function handleAdd() {
    if (isCustomized) {
      if (!tempCustomization) {
        setIsCustomizeOpen(true);
        return;
      }

      if (!defaultComponent) {
        setErrorMessage("Không thể tạo yêu cầu may đo cho sản phẩm này.");
        return;
      }

      setErrorMessage(undefined);
      setIsAdding(true);

      try {
        const request = await createCustomizationRequest({
          component_id: defaultComponent.component_id,
          measurements: parseMeasurementValues(tempCustomization.values),
          customer_note: tempCustomization.note,
          save_as_default: tempCustomization.saveAsDefault,
        });

        const cart = await cartService.addItem({
          customization_id: request.customization_id,
          quantity,
        });

        const addedItem =
          cart.items.find(
            (item: CartItemDto) =>
              item.customization_id === request.customization_id,
          ) ?? null;

        if (addedItem) showAddedToCart(addedItem);
        window.dispatchEvent(new Event("xeoxo-cart-updated"));
        setTempCustomization(null); // Clear temp values after successfully adding to cart
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không thể thêm sản phẩm may đo vào giỏ.",
        );
      } finally {
        setIsAdding(false);
      }
      return;
    }

    setErrorMessage(undefined);
    setIsAdding(true);

    try {
      if (!selectedVariant?.variant_id || !selectedVariant.is_available) {
        throw new Error("Vui lòng chọn size còn hàng trước khi thêm vào giỏ.");
      }

      const cart = await cartService.addItem({
        variant_id: selectedVariant.variant_id,
        quantity,
      });
      const addedItem =
        cart.items.find(
          (item: CartItemDto) => item.variant_id === selectedVariant.variant_id,
        ) ?? null;

      if (addedItem) showAddedToCart(addedItem);
      window.dispatchEvent(new Event("xeoxo-cart-updated"));
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

  async function handlePersistMeasurements(values: MeasurementValues) {
    await saveProfile({ measurements: parseMeasurementValues(values) });
  }

  async function handleCustomizeSubmit(
    values: MeasurementValues,
    note: string,
    saveAsDefault: boolean,
  ) {
    if (isMultiComponent && activeCustomizeComponent) {
      await handleMultiCustomizeSubmit(
        activeCustomizeComponent,
        values,
        note,
        saveAsDefault,
      );
      return;
    }

    setTempCustomization({ values, note, saveAsDefault });
    setIsCustomizeOpen(false);
  }

  async function handleMultiCustomizeSubmit(
    component: ProductComponentDto,
    values: MeasurementValues,
    note: string,
    saveAsDefault: boolean,
  ) {
    setTempComponentCustomizations((current) => ({
      ...current,
      [component.component_id]: { values, note, saveAsDefault },
    }));
    setComponentSelections((current) => ({
      ...current,
      [component.component_id]: {
        quantity: current[component.component_id]?.quantity ?? 1,
        sizeName: "CUSTOM",
        variantId: undefined,
        customizationId: undefined,
      },
    }));
    setIsCustomizeOpen(false);
    setActiveCustomizeComponentId(null);
  }

  async function handleMultiAdd() {
    const selectedEntries = Object.entries(componentSelections)
      .map(([componentId, selection]) => ({
        componentId: Number(componentId),
        selection,
      }))
      .filter(({ selection }) => selection.variantId || selection.sizeName === "CUSTOM");

    if (selectedEntries.length === 0) {
      setErrorMessage("Vui lòng chọn size hoặc Customize ít nhất một thành phần.");
      return;
    }

    setErrorMessage(undefined);
    setIsAdding(true);

    try {
      let latestCartItem: CartItemDto | null = null;

      for (const { componentId, selection } of selectedEntries) {
        let customizationId = selection.customizationId;

        if (selection.sizeName === "CUSTOM" && !customizationId) {
          const temp = tempComponentCustomizations[componentId];
          if (!temp) {
            setActiveCustomizeComponentId(componentId);
            setIsCustomizeOpen(true);
            throw new Error(`Vui lòng nhập số đo Customize cho thành phần này.`);
          }

          const request = await createCustomizationRequest({
            component_id: componentId,
            measurements: parseMeasurementValues(temp.values),
            customer_note: temp.note,
            save_as_default: temp.saveAsDefault,
          });
          customizationId = request.customization_id;

          setComponentSelections((current) => ({
            ...current,
            [componentId]: {
              ...current[componentId],
              customizationId: request.customization_id,
            },
          }));
        }

        const cart = await cartService.addItem({
          ...(customizationId
            ? { customization_id: customizationId }
            : { variant_id: selection.variantId! }),
          quantity: selection.quantity,
        });

        latestCartItem = customizationId
          ? cart.items.find(
              (item: CartItemDto) =>
                item.customization_id === customizationId,
            ) ?? latestCartItem
          : cart.items.find(
              (item: CartItemDto) => item.variant_id === selection.variantId,
            ) ?? latestCartItem;
      }

      if (latestCartItem) showAddedToCart(latestCartItem);
      window.dispatchEvent(new Event("xeoxo-cart-updated"));
      setTempComponentCustomizations({}); // Clear temporary customizations after successfully adding all
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể thêm các thành phần đã chọn vào giỏ.",
      );
    } finally {
      setIsAdding(false);
    }
  }

  function selectComponentVariant(
    component: ProductComponentDto,
    option: ProductSizeOptionDto,
  ) {
    if (!option.is_available) return;
    setComponentSelections((current) => ({
      ...current,
      [component.component_id]: {
        quantity: current[component.component_id]?.quantity ?? 1,
        variantId:
          current[component.component_id]?.variantId === option.variant_id
            ? undefined
            : option.variant_id,
        sizeName:
          current[component.component_id]?.variantId === option.variant_id
            ? undefined
            : getDisplaySizeName(option),
        customizationId: undefined,
      },
    }));
  }

  function updateComponentQuantity(componentId: number, nextQuantity: number) {
    setComponentSelections((current) => ({
      ...current,
      [componentId]: {
        ...current[componentId],
        quantity: Math.max(1, nextQuantity),
      },
    }));
  }

  function openComponentCustomize(componentId: number) {
    if (componentSelections[componentId]?.sizeName === "CUSTOM") {
      setComponentSelections((current) => ({
        ...current,
        [componentId]: {
          quantity: current[componentId]?.quantity ?? 1,
          variantId: undefined,
          sizeName: undefined,
          customizationId: undefined,
        },
      }));
      setTempComponentCustomizations((current) => {
        const next = { ...current };
        delete next[componentId];
        return next;
      });
      return;
    }
    setActiveCustomizeComponentId(componentId);
    setIsCustomizeOpen(true);
  }

  function scrollToDescription() {
    document
      .getElementById("product-description-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-start xl:gap-12 2xl:gap-16">
      {isSizeGuideOpen && (
        <SizeGuideModal
          gender={product.gender}
          onClose={() => setIsSizeGuideOpen(false)}
        />
      )}
      {isSizeRecommendationOpen && (
        <SizeRecommendationModal
          gender={product.gender}
          componentType={defaultComponent?.component_type}
          sizes={apiProduct.sizes}
          initialValues={sharedMeasurementValues}
          canPersistMeasurements={canPersistMeasurements}
          hasPersistedMeasurements={Boolean(savedMeasurementProfile)}
          onClearMeasurements={clearSharedMeasurementValues}
          onPersistMeasurements={handlePersistMeasurements}
          onValuesChange={updateSharedMeasurementValues}
          onOpenAppointment={() => {
            setIsSizeRecommendationOpen(false);
            openAppointmentModal();
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
          className="fixed inset-0 z-[160] flex min-h-dvh items-start justify-center overflow-y-auto bg-black/40 px-3 py-5 backdrop-blur-md sm:px-4 sm:py-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAppointmentOpen(false);
          }}
        >
          <div className="flex w-full justify-center">
            <AppointmentModal
              branches={APPOINTMENT_BRANCHES}
              timeSlots={APPOINTMENT_TIME_SLOTS}
              productLineId={apiProduct.product_line_id}
              onClose={() => setIsAppointmentOpen(false)}
            />
          </div>
        </div>
      )}
      {isCustomizeOpen && (
        <CustomizeModal
          gender={product.gender}
          componentType={activeCustomizeComponent?.component_type}
          initialValues={
            activeCustomizeComponentId == null
              ? (tempCustomization?.values ?? sharedMeasurementValues)
              : (tempComponentCustomizations[activeCustomizeComponentId]?.values ?? sharedMeasurementValues)
          }
          canPersistMeasurements={canPersistMeasurements}
          hasPersistedMeasurements={Boolean(savedMeasurementProfile)}
          basePrice={activeCustomizeComponent?.min_price ?? customBasePrice}
          onClose={() => {
            setIsCustomizeOpen(false);
            setActiveCustomizeComponentId(null);
          }}
          onClearMeasurements={clearSharedMeasurementValues}
          onValuesChange={updateSharedMeasurementValues}
          onSubmit={handleCustomizeSubmit}
        />
      )}
      {!isMultiComponent && showPurchasePanel && !isAnyOverlayOpen && (
        <SingleComponentPurchasePanel
          color={color}
          image={product.images[0]}
          isAdding={isAdding}
          onAdd={handleAdd}
          onOpenCustomize={() => {
            if (size === "CUSTOM") {
              setSize("");
              setTempCustomization(null);
              return;
            }
            setSize("CUSTOM");
            setIsCustomizeOpen(true);
          }}
          onQuantityChange={setQuantity}
          onOpenSizeRecommendation={() => setIsSizeRecommendationOpen(true)}
          onSelectSize={(nextSize) =>
            setSize((current) => (current === nextSize ? "" : nextSize))
          }
          price={price}
          productLineId={apiProduct.product_line_id}
          productName={product.name}
          quantity={quantity}
          selectedSize={size}
          sizes={apiProduct.sizes}
          maxQuantity={Math.max(1, maxQuantity)}
        />
      )}
      <style jsx global>{`
        @media (min-width: 1024px) {
          body.pdp-follow-bar-active .site-layout-header {
            display: none;
            pointer-events: none;
          }
        }
      `}</style>

      <ProductImageGallery images={product.images} alt={product.name} />

      <aside className="flex min-w-0 flex-col gap-5 lg:gap-6">
        <section className="border-b border-black pb-5">
          <h1 className="text-[2.25rem] font-bold leading-tight">
            {product.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <StarRating rating={apiProduct.reviews_summary.avg_rating} size={22} />
            <span className="text-foreground/70">
              ({apiProduct.reviews_summary.avg_rating.toFixed(1)})
            </span>
            <span className="text-[#3568ff]">Chia sẻ</span>
          </div>
        </section>

        <div className="py-5">
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-[2.25rem] font-bold leading-none">
              {formatPrice(price)}
            </span>
            {product.salePrice && (
              <span className="text-lg font-light text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-base font-medium">
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

        {isMultiComponent ? (
          <MultiComponentPurchaseCompact
            color={color}
            components={components}
            isAdding={isAdding}
            selections={componentSelections}
            onAdd={handleMultiAdd}
            onOpenAppointment={openAppointmentModal}
            onOpenCustomize={openComponentCustomize}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
            onOpenSizeRecommendation={() => setIsSizeRecommendationOpen(true)}
            onQuantityChange={updateComponentQuantity}
            onSelectVariant={selectComponentVariant}
          />
        ) : (
          <>
            <div className="mt-5">
              <VariantSelector
                colors={apiProduct.color ? [color] : product.colors}
                sizes={apiProduct.sizes}
                selectedColor={color}
                selectedSize={size}
                onColorChange={setColor}
                onSizeChange={(nextSize) =>
                  setSize((current) => (current === nextSize ? "" : nextSize))
                }
                onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                onOpenSizeRecommendation={() => setIsSizeRecommendationOpen(true)}
                onOpenAppointment={openAppointmentModal}
                onOpenCustomize={() => {
                  if (size === "CUSTOM") {
                    setSize("");
                    setTempCustomization(null);
                    return;
                  }
                  setSize("CUSTOM");
                  setIsCustomizeOpen(true);
                }}
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
                disabled={isAdding || (!isCustomized && !selectedVariant?.is_available)}
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
                Thêm vào giỏ hàng
              </Button>
            </div>
          </>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="mt-3 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            {errorMessage}
          </p>
        )}

        <div className="flex justify-center">
          <TextActionButton
            type="button"
            className="mt-5 text-base"
            onClick={scrollToDescription}
          >
            Mô tả sản phẩm
          </TextActionButton>
        </div>

        <div className="mt-4 border-t-2 border-[#d9d9d9] pt-4">
          <div className="grid gap-x-6 gap-y-3 rounded-[10px] bg-[#ededed] px-6 py-4 sm:grid-cols-2">
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

        {isMultiComponent && relatedProducts.length > 0 && (
          <div className="mt-4 border-t-2 border-[#d9d9d9] pt-4">
            <h2 className="mb-3 text-lg font-bold uppercase">
              Có thể phù hợp với bạn
            </h2>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
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

function parseMeasurementValues(values: MeasurementValues) {
  const parsedMeasurements: Record<string, number> = {};
  for (const [key, value] of Object.entries(values)) {
    const num = parseFloat(value);
    if (!Number.isNaN(num)) parsedMeasurements[key] = num;
  }
  return parsedMeasurements;
}

function SingleComponentPurchasePanel({
  color,
  image,
  isAdding,
  maxQuantity,
  onAdd,
  onOpenCustomize,
  onOpenSizeRecommendation,
  onQuantityChange,
  onSelectSize,
  price,
  productLineId,
  productName,
  quantity,
  selectedSize,
  sizes,
}: {
  color: ProductColor;
  image: string;
  isAdding: boolean;
  maxQuantity: number;
  onAdd: () => void;
  onOpenCustomize: () => void;
  onOpenSizeRecommendation: () => void;
  onQuantityChange: (quantity: number) => void;
  onSelectSize: (size: string) => void;
  price: number;
  productLineId: number;
  productName: string;
  quantity: number;
  selectedSize: string;
  sizes: ProductSizeOptionDto[];
}) {
  const regularSizes = sizes.filter(
    (option) => getDisplaySizeName(option).toUpperCase() !== "CUSTOM",
  );
  const hasAvailableVariant = regularSizes.some((option) => option.is_available);
  const customSelected = selectedSize === "CUSTOM";
  const selectedSizeLabel = customSelected
  ? "Customize"
  : selectedSize || "Chưa chọn";
  const selectedVariant = regularSizes.find(
    (option) => getDisplaySizeName(option) === selectedSize,
  );
  const addDisabled =
    isAdding || (!customSelected && !selectedVariant?.is_available);

  return (
    <div className="fixed inset-x-0 top-0 z-[95] hidden border-y border-[#d4d4d4] bg-white shadow-[0_6px_18px_rgba(0,0,0,0.06)] lg:block">
      <div className="mx-auto grid min-h-[72px] max-w-site grid-cols-[minmax(180px,0.95fr)_minmax(220px,1fr)_minmax(120px,auto)_minmax(200px,auto)] items-center gap-3 px-4 py-2 md:px-6 xl:grid-cols-[minmax(220px,1fr)_minmax(280px,1fr)_minmax(140px,auto)_minmax(260px,auto)] xl:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-[58px] w-[44px] shrink-0 overflow-hidden rounded-[2px] bg-secondary">
            <Image
              src={image}
              alt={productName}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-[1rem] font-bold leading-tight">{productName}</h3>
            <p className="mt-0.5 text-[0.875rem] font-bold leading-none">{formatPrice(price)}</p>
          </div>
        </div>

        <div className="min-w-0 border-l border-[#d9d9d9] pl-4">
          <div className="flex items-center gap-2 text-[0.8125rem]">
            <span className="text-black/55">Kích thước:</span>
            <span className="font-bold">{selectedSizeLabel}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {regularSizes.map((option) => (
              <button
                key={option.variant_id}
                type="button"
                onClick={() => onSelectSize(getDisplaySizeName(option))}
                disabled={!option.is_available}
                aria-pressed={selectedSize === getDisplaySizeName(option)}
                className={cn(
                  "h-[30px] min-w-[44px] rounded-pill border px-3 text-[0.6875rem] font-bold transition-colors",
                  !option.is_available &&
                    "cursor-not-allowed bg-[#ededed] text-[#a3a3a3]",
                  selectedSize === getDisplaySizeName(option) && option.is_available
                    ? "bg-black text-white"
                    : option.is_available &&
                      "bg-white text-black hover:bg-black hover:text-white",
                )}
              >
                {getDisplaySizeName(option)}
              </button>
            ))}
            <button
              type="button"
              onClick={onOpenCustomize}
              disabled={!hasAvailableVariant}
              aria-label="Customize"
              aria-pressed={customSelected}
              className={cn(
                "group inline-flex h-[30px] min-w-[30px] items-center justify-center rounded-[4px] border border-black bg-white px-2 transition-colors hover:bg-black disabled:pointer-events-none disabled:opacity-50",
                customSelected &&
                  "bg-black",
                !hasAvailableVariant &&
                  "cursor-not-allowed bg-[#ededed]",
              )}
            >
              <Image
                src="/icons/custom.svg"
                alt=""
                width={14}
                height={14}
                aria-hidden
                className={cn(
                  "h-3.5 w-4 object-contain transition group-hover:invert",
                  customSelected && "invert",
                  hasAvailableVariant && !customSelected && "group-hover:invert",
                )}
              />
            </button>
          </div>
          <button
            type="button"
            onClick={onOpenSizeRecommendation}
            className="mt-1.5 text-[0.6875rem] font-bold text-[#2748d9] underline underline-offset-2"
          >
            Hướng dẫn chọn size
          </button>
        </div>

        <div className="min-w-0 border-l border-[#d9d9d9] pl-4">
          <div className="flex flex-nowrap items-center gap-2 text-[0.8125rem] whitespace-nowrap">
            <span className="whitespace-nowrap text-black/55">Màu sắc:</span>
          </div>
          <span
            className="mt-2 inline-flex h-[30px] max-w-full whitespace-nowrap items-center justify-center rounded-pill border border-black/10 px-4 text-[0.6875rem] font-bold text-white"
            style={{
              backgroundColor: color.hex,
              color: getReadableTextColor(color.hex),
            }}
          >
            <span className="max-w-[120px] truncate">{color.name}</span>
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-3 border-l border-[#d9d9d9] pl-4">
          <div className="flex h-[30px] items-center gap-4 rounded-full px-1 text-[1.25rem] leading-none">
            <button
              type="button"
              aria-label="Giảm số lượng"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>
            <span className="min-w-[18px] text-center font-medium">{quantity}</span>
            <button
              type="button"
              aria-label="Tăng số lượng"
              onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className="disabled:cursor-not-allowed disabled:opacity-30"
            >
              +
            </button>
          </div>
          <Button
            onClick={onAdd}
            variant="cart"
            disabled={addDisabled}
            className="h-12 min-w-[220px] rounded-full bg-black px-8 text-[1rem] font-bold text-white hover:bg-black/85"
          >
            Thêm vào giỏ
          </Button>
        </div>
      </div>
    </div>
  );
}

function MultiComponentPurchaseCompact({
  color,
  components,
  isAdding,
  selections,
  onAdd,
  onOpenAppointment,
  onOpenCustomize,
  onOpenSizeGuide,
  onOpenSizeRecommendation,
  onQuantityChange,
  onSelectVariant,
}: {
  color: ProductColor;
  components: ProductComponentDto[];
  isAdding: boolean;
  selections: Record<number, ComponentSelection>;
  onAdd: () => void;
  onOpenAppointment: () => void;
  onOpenCustomize: (componentId: number) => void;
  onOpenSizeGuide: () => void;
  onOpenSizeRecommendation: () => void;
  onQuantityChange: (componentId: number, quantity: number) => void;
  onSelectVariant: (component: ProductComponentDto, option: ProductSizeOptionDto) => void;
}) {
  const selectedCount = Object.values(selections).filter(
    (selection) => selection.variantId || selection.customizationId || selection.sizeName === "CUSTOM",
  ).length;

  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="bg-white py-3">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-black">Màu sắc</p>
            <span
              className="mt-1 inline-flex h-9 min-w-[128px] items-center justify-center rounded-[4px] border border-black px-5 text-sm font-bold"
              style={{ backgroundColor: color.hex, color: getReadableTextColor(color.hex) }}
            >
              {color.name}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenSizeGuide}
            className="text-xs font-bold text-[#3568ff] underline underline-offset-4 hover:opacity-70"
          >
            Hướng dẫn cách đo
          </button>
        </div>

        <div className="flex flex-col">
          {components.map((component) => (
            <div key={component.component_id}>
              <DecorativeComponentDivider />
              <ComponentPurchaseCardCompact
                component={component}
                selection={selections[component.component_id]}
                onOpenCustomize={() => onOpenCustomize(component.component_id)}
                onQuantityChange={(quantity) =>
                  onQuantityChange(component.component_id, quantity)
                }
                onSelectVariant={(option) => onSelectVariant(component, option)}
              />
            </div>
          ))}
          <DecorativeComponentDivider />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onOpenAppointment}
            className="flex h-[38px] items-center justify-center rounded-full border border-black px-6 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
            style={{
              backgroundImage: "url(/images/bg-gia-nhap-btn.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            Đặt lịch may đo
          </button>
          <span className="text-sm font-bold text-black/60">&gt;</span>
          <button
            type="button"
            onClick={onOpenSizeRecommendation}
            className="text-sm font-bold underline underline-offset-4 hover:opacity-70"
          >
            Hướng dẫn chọn size
          </button>
        </div>
      </div>

      <Button
        onClick={onAdd}
        variant="cart"
        size="cart"
        disabled={isAdding || selectedCount === 0}
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
        Thêm vào giỏ hàng
      </Button>
    </div>
  );
}

function ComponentPurchaseCardCompact({
  component,
  selection,
  onOpenCustomize,
  onQuantityChange,
  onSelectVariant,
}: {
  component: ProductComponentDto;
  selection?: ComponentSelection;
  onOpenCustomize: () => void;
  onQuantityChange: (quantity: number) => void;
  onSelectVariant: (option: ProductSizeOptionDto) => void;
}) {
  const selectedVariant = component.variants.find(
    (option) => option.variant_id === selection?.variantId,
  );
  const selectedSize = selection?.sizeName ?? "";
  const isCustomSelected = selection?.sizeName === "CUSTOM";
  const hasAvailableVariant = component.variants.some((option) => option.is_available);
  const quantity = selection?.quantity ?? 1;
  const maxQuantity = isCustomSelected
    ? 99
    : Math.max(1, selectedVariant?.stock_quantity ?? 1);
  const title = component.component_name || component.component_type;

  return (
    <section className="grid gap-3 border-t-2 border-primary/80 py-3 last:border-b-2 sm:grid-cols-[minmax(88px,104px)_minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold leading-tight">{title}</p>
        <p className="mt-1 text-sm font-bold leading-tight">
          {formatPrice(
            isCustomSelected
              ? component.min_price * 1.2
            : selectedVariant?.price ?? component.min_price,
          )}
        </p>
        <p className="mt-1 text-[0.6875rem] font-semibold text-black/45">
          {isCustomSelected
            ? "Customize"
            : selectedSize
              ? `Size ${selectedSize}`
              : "Chọn size"}
        </p>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold text-black/55">Chọn size</span>
        {component.variants.map((option) => (
          <button
            key={option.variant_id}
            type="button"
            onClick={() => onSelectVariant(option)}
            disabled={!option.is_available}
            aria-pressed={selection?.variantId === option.variant_id}
            className={cn(
              "h-9 min-w-[42px] rounded-pill border-[2px] px-3 text-[0.6875rem] font-bold transition-colors",
              !option.is_available &&
                "cursor-not-allowed border-gray-300 bg-gray-300 text-gray-500 opacity-50",
              selection?.variantId === option.variant_id && option.is_available
                ? "border-primary bg-primary text-primary-foreground"
                : option.is_available &&
                  "border-input bg-white hover:border-primary hover:bg-primary hover:text-primary-foreground",
            )}
          >
            {option.size_name}
          </button>
        ))}
        <Button
          type="button"
          onClick={onOpenCustomize}
          disabled={!hasAvailableVariant}
          variant="customPill"
          size="custom"
          iconSrc="/icons/custom.svg"
          iconSize={22}
          iconClassName={cn("h-5 w-5 object-contain", isCustomSelected && "invert")}
          className={cn(
            "h-9 min-w-[96px] gap-1 border-[2px] px-2 text-[0.6875rem]",
            isCustomSelected && "border-primary bg-primary text-primary-foreground",
            !hasAvailableVariant &&
              "cursor-not-allowed border-gray-300 bg-gray-300 text-gray-500 opacity-50",
          )}
        >
          Custom
        </Button>
      </div>

      <div className="justify-self-start sm:justify-self-end">
        <QuantityPill
          value={quantity}
          max={maxQuantity}
          onChange={onQuantityChange}
        />
      </div>
    </section>
  );
}

function DecorativeComponentDivider() {
  return (
    <div
      aria-hidden
      className="h-[4px] w-full bg-[#f15a42]"
      style={{
        backgroundImage: "url(/images/bg-gia-nhap-btn.png)",
        backgroundPosition: "center",
        backgroundSize: "220px auto",
      }}
    />
  );
}

function MultiComponentPurchase({
  color,
  components,
  isAdding,
  selections,
  onAdd,
  onOpenAppointment,
  onOpenCustomize,
  onOpenSizeGuide,
  onOpenSizeRecommendation,
  onQuantityChange,
  onSelectVariant,
}: {
  color: ProductColor;
  components: ProductComponentDto[];
  isAdding: boolean;
  selections: Record<number, ComponentSelection>;
  onAdd: () => void;
  onOpenAppointment: () => void;
  onOpenCustomize: (componentId: number) => void;
  onOpenSizeGuide: () => void;
  onOpenSizeRecommendation: () => void;
  onQuantityChange: (componentId: number, quantity: number) => void;
  onSelectVariant: (component: ProductComponentDto, option: ProductSizeOptionDto) => void;
}) {
  const selectedCount = Object.values(selections).filter(
    (selection) => selection.variantId || selection.customizationId || selection.sizeName === "CUSTOM",
  ).length;
  const selectedTotal = useMemo(
    () =>
      components.reduce((sum, component) => {
        const selection = selections[component.component_id];
        if (!selection) return sum;
        const quantity = selection.quantity || 1;
        if (selection.customizationId) {
          return sum + component.min_price * 1.2 * quantity;
        }
        const variant = component.variants.find(
          (option) => option.variant_id === selection.variantId,
        );
        return sum + (variant?.price ?? 0) * quantity;
      }, 0),
    [components, selections],
  );

  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="rounded-[18px] border border-black/15 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f15a42]">
              Chọn từng thành phần
            </p>
            <p className="mt-1 text-sm text-black/60">
              Áo/quần/set được chọn độc lập. Chọn phần nào thì thêm phần đó.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-black">Màu sắc</p>
            <span
              className="mt-1 inline-flex h-9 min-w-[128px] items-center justify-center rounded-[4px] border border-black px-5 text-sm font-bold"
              style={{ backgroundColor: color.hex, color: getReadableTextColor(color.hex) }}
            >
              {color.name}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {components.map((component) => (
            <ComponentPurchaseCard
              key={component.component_id}
              component={component}
              selection={selections[component.component_id]}
              onOpenCustomize={() => onOpenCustomize(component.component_id)}
              onQuantityChange={(quantity) =>
                onQuantityChange(component.component_id, quantity)
              }
              onSelectVariant={(option) => onSelectVariant(component, option)}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onOpenAppointment}
            className="flex h-[43px] items-center justify-center rounded-full border border-black px-6 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
            style={{
              backgroundImage: "url(/images/bg-gia-nhap-btn.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            Đặt lịch may đo
          </button>
          <button
            type="button"
            onClick={onOpenSizeRecommendation}
            className="text-sm font-bold underline underline-offset-4 hover:opacity-70"
          >
            Hướng dẫn chọn size
          </button>
          <button
            type="button"
            onClick={onOpenSizeGuide}
            className="text-sm font-bold text-[#3568ff] underline underline-offset-4 hover:opacity-70"
          >
            Hướng dẫn cách đo
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] sm:items-center">
        <div className="rounded-[14px] border border-black/10 bg-[#f3f3f3] px-5 py-4">
          <p className="text-sm font-semibold text-black/60">
            Đã chọn {selectedCount}/{components.length} thành phần
          </p>
          <p className="mt-1 text-xl font-bold">
            Tạm tính: {formatPrice(selectedTotal)}
          </p>
        </div>
        <Button
          onClick={onAdd}
          variant="cart"
          size="cart"
          disabled={isAdding || selectedCount === 0}
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
          Thêm vào giỏ hàng
        </Button>
      </div>
    </div>
  );
}

function ComponentPurchaseCard({
  component,
  selection,
  onOpenCustomize,
  onQuantityChange,
  onSelectVariant,
}: {
  component: ProductComponentDto;
  selection?: ComponentSelection;
  onOpenCustomize: () => void;
  onQuantityChange: (quantity: number) => void;
  onSelectVariant: (option: ProductSizeOptionDto) => void;
}) {
  const selectedVariant = component.variants.find(
    (option) => option.variant_id === selection?.variantId,
  );
  const selectedSize = selection?.sizeName ?? "";
  const isCustomSelected = selection?.sizeName === "CUSTOM";
  const hasAvailableVariant = component.variants.some((option) => option.is_available);
  const quantity = selection?.quantity ?? 1;
  const maxQuantity = isCustomSelected
    ? 99
    : Math.max(1, selectedVariant?.stock_quantity ?? 1);

  return (
    <section className="rounded-[16px] border border-black/15 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-black/45">
            {component.component_type}
          </p>
          <h3 className="mt-1 text-lg font-bold">{component.component_name}</h3>
        </div>
        <p className="text-right text-base font-bold">
          {formatPrice(
            isCustomSelected
              ? component.min_price * 1.2
              : selectedVariant?.price ?? component.min_price,
          )}
        </p>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="font-bold">
            Kích thước
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {component.variants.map((option) => (
            <button
              key={option.variant_id}
              type="button"
              onClick={() => onSelectVariant(option)}
              disabled={!option.is_available}
              aria-pressed={selection?.variantId === option.variant_id}
              className={cn(
                "h-[40px] min-w-[78px] rounded-[4px] border border-black px-4 text-sm font-bold transition-colors",
                !option.is_available &&
                  "cursor-not-allowed bg-[#ededed] text-[#a3a3a3]",
                selection?.variantId === option.variant_id && option.is_available
                  ? "bg-black text-white"
                  : option.is_available &&
                    "bg-white hover:bg-black hover:text-white",
              )}
            >
              {getDisplaySizeName(option)}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenCustomize}
            disabled={!hasAvailableVariant}
            aria-label="Customize"
            aria-pressed={isCustomSelected}
            className={cn(
              "h-[40px] min-w-[148px] rounded-[4px] border border-black px-4 text-sm font-bold transition-colors",
              isCustomSelected &&
                "bg-black text-white",
              !hasAvailableVariant &&
                "cursor-not-allowed bg-[#ededed] text-[#a3a3a3]",
              hasAvailableVariant && !isCustomSelected &&
                "bg-white hover:bg-black hover:text-white",
            )}
          >
            Customize
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[95px_minmax(0,1fr)] sm:items-center">
        <QuantityPill
          value={quantity}
          max={maxQuantity}
          onChange={onQuantityChange}
        />
        <p className="text-sm text-black/55">
          {isCustomSelected
            ? "Đã lưu yêu cầu Customize cho thành phần này."
            : selectedVariant
              ? `Tồn kho size ${getDisplaySizeName(selectedVariant)}: ${selectedVariant.stock_quantity ?? 0}`
              : ""}
        </p>
      </div>
    </section>
  );
}

function ProductNotice({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex min-h-[60px] items-center justify-between gap-4 rounded-[10px] border border-border bg-[#fffdfd] px-5 py-3">
      <span className="flex items-center gap-4">
        <span className="flex h-[29px] w-[37px] items-center justify-center rounded-[3px] border border-[#ff593d]">
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

function QuantityPill({
  value,
  max,
  onChange,
  compact = false,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-1 leading-none",
        compact ? "h-[26px] min-w-[72px] gap-3 text-[20px]" : "h-[54px] text-lg",
      )}
    >
      <button
        type="button"
        aria-label="Giảm số lượng"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="disabled:cursor-not-allowed disabled:opacity-30"
      >
        −
      </button>
      <span className={cn("text-center font-medium", compact ? "min-w-[16px]" : "min-w-[18px]")}>
        {value}
      </span>
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
        <span className="text-[0.6875rem] font-light leading-relaxed text-foreground/80">
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
