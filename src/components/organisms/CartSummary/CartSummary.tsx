"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/atoms/Button";
import { CartItem } from "@/components/molecules/CartItem";
import { AuthModal } from "@/components/organisms/AuthModal";
import { CustomizeModal } from "@/components/organisms/CustomizeModal";
import { useAvailableLoyaltyRewards } from "@/hooks/useAvailableLoyaltyRewards";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { useSharedMeasurements } from "@/hooks/useSharedMeasurements";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/lib/utils";
import { createCustomizationRequest } from "@/services/customization.service";
import {
  getMeasurementFields,
  type MeasurementComponentType,
  type MeasurementValues,
} from "@/features/size-recommendation/size-recommendation";
import type { CartItemDto } from "@/types/cart.types";
import type { AvailableLoyaltyReward } from "@/types/loyalty.types";

function getRewardBenefit(
  reward: AvailableLoyaltyReward,
  subtotal: number,
  shippingFee: number,
) {
  if (reward.reward_type === "FREE_SHIPPING") {
    return shippingFee;
  }

  if (
    reward.reward_type === "BIRTHDAY_VOUCHER" ||
    reward.reward_type === "TIER_VOUCHER"
  ) {
    return Math.min(Math.max(reward.reward_value, 0), subtotal);
  }

  return 0;
}

function getRewardTitle(reward: AvailableLoyaltyReward) {
  if (reward.reward_type === "FREE_SHIPPING") {
    return "Miễn phí vận chuyển";
  }

  if (reward.reward_type === "BIRTHDAY_VOUCHER") {
    return "Quà sinh nhật thành viên";
  }

  if (reward.reward_type === "TIER_VOUCHER") {
    return "Ưu đãi hạng thành viên";
  }

  return reward.reward_name;
}

function getRewardDescription(reward: AvailableLoyaltyReward) {
  if (reward.reward_type === "FREE_SHIPPING") {
    return "Áp dụng cho phí giao hàng của đơn này.";
  }

  if (
    reward.reward_type === "BIRTHDAY_VOUCHER" ||
    reward.reward_type === "TIER_VOUCHER"
  ) {
    return `Giảm tối đa ${formatPrice(reward.reward_value)}.`;
  }

  return "Quyền lợi này chưa áp dụng tại giỏ hàng.";
}

function getRewardConditionText(
  reward: AvailableLoyaltyReward,
  subtotal: number,
  shippingFee: number,
) {
  if (reward.reward_type === "FREE_SHIPPING") {
    return shippingFee > 0
      ? `Giảm ${formatPrice(shippingFee)} phí giao hàng.`
      : "Áp dụng khi đơn hàng phát sinh phí giao hàng.";
  }

  if (
    reward.reward_type === "BIRTHDAY_VOUCHER" ||
    reward.reward_type === "TIER_VOUCHER"
  ) {
    return subtotal > 0
      ? `Giảm tối đa ${formatPrice(reward.reward_value)} cho đơn đã chọn.`
      : "Áp dụng khi bạn chọn ít nhất 1 sản phẩm để thanh toán.";
  }

  if (reward.reward_type === "FREE_TAILOR") {
    return "Áp dụng cho đơn có sản phẩm may đo hoặc chỉnh sửa.";
  }

  return "Xem chi tiết điều kiện tại chính sách thành viên.";
}

function formatExpiredAt(value: string | null) {
  if (!value) {
    return "Không giới hạn";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function hasMeasurementValues(
  values?: Partial<MeasurementValues> | null,
  productGender: string = "nu",
  componentType?: MeasurementComponentType,
) {
  if (!values) return false;
  return getMeasurementFields(productGender as any, componentType).every((field) => {
    const value = values[field.key];
    return Boolean(value && value.trim() !== "");
  });
}

function mapSharedMeasurementValues(
  values: Partial<MeasurementValues>,
  productGender: string = "nu",
  componentType?: MeasurementComponentType,
): MeasurementValues {
  const activeKeys = new Set(
    getMeasurementFields(productGender as any, componentType).map((field) => field.key),
  );
  const mapped = {
    bust: values.bust ?? "",
    waist: values.waist ?? "",
    hip: values.hip ?? "",
    shoulder: values.shoulder ?? "",
    sleeve: values.sleeve ?? "",
    upperArm: values.upperArm ?? "",
    neck: values.neck ?? "",
    height: values.height ?? "",
    weight: values.weight ?? "",
  };

  Object.keys(mapped).forEach((key) => {
    if (!activeKeys.has(key as keyof MeasurementValues)) {
      mapped[key as keyof MeasurementValues] = "";
    }
  });

  return mapped;
}

function componentMeasurementStorageKey(
  productGender: string,
  componentType?: MeasurementComponentType,
) {
  return `xeoxo.component-measurements.v1.${productGender}.${componentType?.trim().toUpperCase() || "DEFAULT"}`;
}

function readComponentMeasurementValues(
  productGender: string,
  componentType?: MeasurementComponentType,
) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      componentMeasurementStorageKey(productGender, componentType),
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MeasurementValues>;
    if (!hasMeasurementValues(parsed, productGender, componentType)) return null;
    return mapSharedMeasurementValues(parsed, productGender, componentType);
  } catch {
    return null;
  }
}

function parseMeasurementValues(values: MeasurementValues) {
  const parsed: Record<string, number> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "") {
      const next = Number.parseFloat(String(value).replace(",", "."));
      if (!Number.isNaN(next)) {
        parsed[key] = next;
      }
    }
  }
  return parsed;
}

function useCartSummaryState() {
  const { cart, isLoading, isMutating, updateItem, removeItem, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const {
    rewards,
    isMember,
    isLoading: isLoadingRewards,
  } = useAvailableLoyaltyRewards();
  const { preview, previewCheckout, resetPreview, errorMessage, isSubmitting } =
    useCheckout();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register" | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [voucherSearch, setVoucherSearch] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");
  const [hasManualVoucherChoice, setHasManualVoucherChoice] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<CartItemDto | null>(null);

  const {
    values: sharedMeasurementValues,
    updateValues: updateSharedMeasurementValues,
  } = useSharedMeasurements(customizingItem?.gender ?? "nu");

  const cartItemIds = cart.items.map((item) => item.cart_item_id);
  const allSelected =
    cartItemIds.length > 0 &&
    cartItemIds.every((id) => selectedIds.includes(id));
  const selectedItems = cart.items.filter((item) =>
    selectedIds.includes(item.cart_item_id),
  );
  const selectedSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.line_total,
    0,
  );
  const baseShippingFee = selectedSubtotal > 0 ? 30000 : 0;
  const subtotal = preview?.subtotal ?? selectedSubtotal;
  const shippingFee = preview?.shipping_fee ?? (subtotal > 0 ? 30000 : 0);
  const productDiscount = preview?.discount_amount ?? 0;
  const rewardDiscount = preview?.reward_discount_amount ?? 0;
  const discount = productDiscount + rewardDiscount;
  const total =
    preview?.total_amount ?? Math.max(subtotal + shippingFee - discount, 0);
  const selectedReward = rewards.find(
    (reward) =>
      reward.voucher_code?.toUpperCase() === appliedVoucher.toUpperCase(),
  );

  const bestReward = rewards
    .filter((reward) => reward.voucher_code)
    .map((reward) => ({
      reward,
      benefit: getRewardBenefit(reward, selectedSubtotal, baseShippingFee),
    }))
    .filter((item) => item.benefit > 0)
    .sort((a, b) => b.benefit - a.benefit)[0]?.reward;

  useEffect(() => {
    if (cartItemIds.length === 0) {
      setSelectedIds([]);
      setAppliedVoucher("");
      setHasManualVoucherChoice(false);
      setVoucherSearch("");
      resetPreview();
      return;
    }

    setSelectedIds(cartItemIds);
  }, [cartItemIds.join(","), resetPreview]);

  useEffect(() => {
    if (selectedIds.length) {
      void previewCheckout({
        cart_item_ids: selectedIds,
        voucher_code: appliedVoucher || undefined,
      });
    } else {
      resetPreview();
    }
  }, [selectedIds, appliedVoucher, previewCheckout, resetPreview]);

  useEffect(() => {
    if (
      !hasManualVoucherChoice &&
      !appliedVoucher &&
      bestReward?.voucher_code &&
      selectedIds.length
    ) {
      const code = bestReward.voucher_code.toUpperCase();
      setAppliedVoucher(code);
    }
  }, [appliedVoucher, bestReward, hasManualVoucherChoice, selectedIds.length]);

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? cartItemIds : []);
  }

  function toggleLine(id: number, checked: boolean) {
    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, id]))
        : current.filter((item) => item !== id),
    );
  }

  function applyVoucher(code: string) {
    const nextCode = code.trim().toUpperCase();
    const isSameVoucher = appliedVoucher.toUpperCase() === nextCode;

    setAppliedVoucher(isSameVoucher ? "" : nextCode);
    setHasManualVoucherChoice(true);
  }

  function clearVoucher() {
    setAppliedVoucher("");
    setHasManualVoucherChoice(true);
  }

  async function submitCartCustomize(
    values: MeasurementValues,
    note: string,
    saveAsDefault: boolean,
  ) {
    if (!customizingItem?.component_id) {
      return;
    }

    const request = await createCustomizationRequest({
      component_id: customizingItem.component_id,
      measurements: parseMeasurementValues(values),
      customer_note: note,
      save_as_default: saveAsDefault,
    });

    const result = await updateItem(customizingItem.cart_item_id, {
      customization_id: request.customization_id,
    });

    if (result.ok) {
      setCustomizingItem(null);
    }
  }

  const shouldShowInitialLoading = isLoading && cart.items.length === 0;

  return {
    acceptedTerms,
    allSelected,
    appliedVoucher,
    applyVoucher,
    authModalMode,
    baseShippingFee,
    cart,
    clearCart,
    clearVoucher,
    customizingItem,
    discount,
    errorMessage,
    isAuthenticated,
    isLoadingRewards,
    isMember,
    isMutating,
    isSubmitting,
    isVoucherModalOpen,
    previewSubtotal: selectedSubtotal,
    removeItem,
    rewards,
    searchValue: voucherSearch,
    selectedIds,
    selectedReward,
    setAcceptedTerms,
    setAuthModalMode,
    setCustomizingItem,
    setIsVoucherModalOpen,
    setVoucherSearch,
    shippingFee,
    shouldShowInitialLoading,
    sharedMeasurementValues,
    submitCartCustomize,
    subtotal,
    toggleAll,
    toggleLine,
    total,
    updateItem,
    updateSharedMeasurementValues,
  };
}

const CartSummaryContext = createContext<ReturnType<
  typeof useCartSummaryState
> | null>(null);

function useCartSummaryContext() {
  const context = useContext(CartSummaryContext);

  if (!context) {
    throw new Error(
      "Cart summary components must be used within CartSummaryProvider.",
    );
  }

  return context;
}

export function CartSummaryProvider({ children }: { children: ReactNode }) {
  const value = useCartSummaryState();

  return (
    <CartSummaryContext.Provider value={value}>
      {children}
    </CartSummaryContext.Provider>
  );
}

export function CartItemsSection() {
  const {
    allSelected,
    cart,
    clearCart,
    customizingItem,
    isAuthenticated,
    isMutating,
    removeItem,
    selectedIds,
    setCustomizingItem,
    shouldShowInitialLoading,
    sharedMeasurementValues,
    submitCartCustomize,
    toggleAll,
    toggleLine,
    updateItem,
    updateSharedMeasurementValues,
  } = useCartSummaryContext();

  return (
    <aside className="w-full min-w-0 text-black">
      <h2 className="text-[1.0625rem] font-bold text-black sm:text-lg md:text-xl md:leading-tight">
        Giỏ hàng
      </h2>

      <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4 sm:gap-4">
        <label className="inline-flex cursor-pointer items-center gap-3 sm:gap-4">
          <span className="inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[2px] border-2 border-black bg-white">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(event) => toggleAll(event.target.checked)}
              aria-label="Chọn tất cả sản phẩm"
              className="sr-only"
            />
            <span
              className={
                allSelected
                  ? "h-[15px] w-[15px] rounded-[3px] bg-black"
                  : "h-[15px] w-[15px] rounded-[3px] bg-white"
              }
            />
          </span>
          <span className="text-base font-medium text-black/60">Tất cả sản phẩm</span>
        </label>
        <button
          type="button"
          onClick={() => void clearCart()}
          disabled={cart.items.length === 0 || isMutating}
          className="text-sm font-medium text-black/60 underline underline-offset-4 transition hover:text-black disabled:opacity-40"
        >
          Xoá tất cả
        </button>
      </div>

      <div
        className="mb-5 mt-5 h-2.5 w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/strip-cart-section.png')" }}
        aria-hidden
      />

      {shouldShowInitialLoading ? (
        <div className="border-y border-black/50 py-12 text-center">
          <p className="text-base font-medium">Đang tải giỏ hàng...</p>
        </div>
      ) : cart.items.length === 0 ? (
        <div className="border-y border-black/50 py-12 text-center">
          <p className="text-base font-medium">Giỏ hàng của bạn đang trống.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {cart.items.map((item) => (
            <CartItem
              key={item.cart_item_id}
              item={item}
              selected={selectedIds.includes(item.cart_item_id)}
              onSelectedChange={(checked) =>
                toggleLine(item.cart_item_id, checked)
              }
              onQuantityChange={(quantity) =>
                void updateItem(item.cart_item_id, { quantity })
              }
              onVariantChange={(next) =>
                void updateItem(item.cart_item_id, next)
              }
              onCustomize={() => setCustomizingItem(item)}
              onRemove={() => void removeItem(item.cart_item_id)}
            />
          ))}
        </div>
      )}

      {customizingItem && (() => {
        const itemSnapshot = customizingItem.customization_snapshot
          ? (typeof customizingItem.customization_snapshot === "string"
              ? (() => {
                  try {
                    return JSON.parse(customizingItem.customization_snapshot);
                  } catch {
                    return null;
                  }
                })()
              : customizingItem.customization_snapshot)
          : null;
        const itemMeasurements = itemSnapshot?.measurements;

        const savedValues =
          readComponentMeasurementValues(
            customizingItem.gender ?? "nu",
            customizingItem.component_type ?? undefined,
          ) ??
          (hasMeasurementValues(
            sharedMeasurementValues,
            customizingItem.gender ?? "nu",
            customizingItem.component_type ?? undefined,
          )
            ? mapSharedMeasurementValues(
                sharedMeasurementValues,
                customizingItem.gender ?? "nu",
                customizingItem.component_type ?? undefined,
              )
            : null);

        const initialValues =
          itemMeasurements || savedValues || sharedMeasurementValues;

        return (
          <CustomizeModal
            gender={customizingItem.gender ?? "nu"}
            componentType={customizingItem.component_type ?? undefined}
            basePrice={customizingItem.unit_price}
            initialValues={initialValues}
            canPersistMeasurements={isAuthenticated}
            onValuesChange={updateSharedMeasurementValues}
            onClose={() => setCustomizingItem(null)}
            onSubmit={submitCartCustomize}
          />
        );
      })()}
    </aside>
  );
}

export function PaymentSummarySection() {
  const {
    acceptedTerms,
    appliedVoucher,
    applyVoucher,
    authModalMode,
    baseShippingFee,
    clearVoucher,
    discount,
    errorMessage,
    isLoadingRewards,
    isMember,
    isMutating,
    isSubmitting,
    isVoucherModalOpen,
    previewSubtotal,
    rewards,
    searchValue,
    selectedIds,
    selectedReward,
    setAcceptedTerms,
    setAuthModalMode,
    setIsVoucherModalOpen,
    setVoucherSearch,
    shippingFee,
    subtotal,
    total,
  } = useCartSummaryContext();

  return (
    <aside className="w-full min-w-0 text-black">
      <input
        form="checkout-form"
        type="hidden"
        name="cart_item_ids"
        value={selectedIds.join(",")}
      />
      <input
        form="checkout-form"
        type="hidden"
        name="voucher_code"
        value={appliedVoucher}
      />

      <div
        className="h-2.5 w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/strip-cart-section.png')" }}
        aria-hidden
      />

      <h3 className="mt-5 text-[1.0625rem] font-bold text-black sm:mt-6 sm:text-lg md:text-xl">
        Chi tiết thanh toán
      </h3>

      <div className="mt-4 sm:mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-base font-bold">Mã ưu đãi</h4>
          {appliedVoucher && (
            <button
              type="button"
              onClick={clearVoucher}
              className="text-sm font-semibold text-black/50 underline underline-offset-4 transition hover:text-black"
            >
              Bỏ chọn
            </button>
          )}
        </div>
        {isMember ? (
          <button
            type="button"
            onClick={() => setIsVoucherModalOpen(true)}
            className="flex min-h-[48px] w-full items-center justify-between gap-4 rounded-[8px] border border-[#f15a42] bg-[#fff4ee] px-4 py-2.5 text-left text-[#111111] transition hover:border-[#d9442d] hover:bg-[#ffe8dc]"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-sm font-bold uppercase">
                {selectedReward ? getRewardTitle(selectedReward) : "Chọn mã ưu đãi"}
              </span>
              <span className="truncate text-sm font-semibold opacity-70">
                {appliedVoucher
                  ? `${appliedVoucher} đang được áp dụng`
                  : isLoadingRewards
                    ? "Đang tải mã ưu đãi..."
                    : rewards.length
                      ? `${rewards.length} mã có thể dùng`
                      : "Chưa có mã khả dụng cho hạng hiện tại"}
              </span>
            </span>
            <span className="shrink-0 text-xl font-bold">›</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAuthModalMode("register")}
            className="flex min-h-[58px] w-full flex-col items-stretch justify-between gap-3 rounded-[8px] border border-[#f15a42] bg-[#fff4ee] px-4 py-3 text-left text-[#111111] transition hover:border-[#d9442d] hover:bg-[#ffe8dc] sm:flex-row sm:items-center sm:gap-4"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-sm font-bold uppercase">
                Thành viên nhận mã ưu đãi
              </span>
              <span className="truncate text-sm font-semibold opacity-70">
                Đăng ký thành viên để nâng hạng nhận mã
              </span>
            </span>
            <span className="shrink-0 self-start rounded-pill border border-current px-4 py-2 text-sm font-bold transition hover:bg-black hover:text-white sm:self-auto">
              Đăng ký
            </span>
          </button>
        )}
      </div>

      {isMember && isVoucherModalOpen && (
        <VoucherModal
          appliedVoucher={appliedVoucher}
          baseShippingFee={baseShippingFee}
          isLoading={isLoadingRewards}
          rewards={rewards}
          searchValue={searchValue}
          subtotal={previewSubtotal}
          onApply={applyVoucher}
          onClose={() => setIsVoucherModalOpen(false)}
          onSearchChange={(value) => setVoucherSearch(value.toUpperCase())}
        />
      )}

      <div className="mt-4 divide-y divide-black/50 border-y border-black/50 text-sm">
        <div className="flex items-center justify-between py-2.5">
          <span>Tạm tính</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span>Voucher ưu đãi</span>
          <span className="font-semibold">{formatPrice(discount)}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span>Phí giao hàng</span>
          <span className="font-semibold">
            {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
          </span>
        </div>
        <div className="flex items-center justify-between py-3.5 text-base font-bold uppercase">
          <span>Thành tiền</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 sm:gap-4">
        <span className="mt-0.5 inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[2px] border-2 border-black bg-white">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="sr-only"
          />
          <span
            className={
              acceptedTerms
                ? "h-[15px] w-[15px] rounded-[3px] bg-black"
                : "h-[15px] w-[15px] rounded-[3px] bg-white"
            }
          />
        </span>
        <span className="text-body-sm leading-6 text-black/75">
          Tôi đã đọc và đồng ý với chính sách đổi trả.
        </span>
      </label>

      {errorMessage && (
        <p className="mt-4 text-sm font-normal text-red-600">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        form="checkout-form"
        variant="primaryPill"
        size="pill"
        disabled={
          !acceptedTerms ||
          selectedIds.length === 0 ||
          isMutating ||
          isSubmitting
        }
        isLoading={isSubmitting}
        className="sticky bottom-3 z-20 mt-5 h-12 w-full min-w-0 text-sm font-bold uppercase shadow-[0_8px_24px_rgba(0,0,0,0.22)] sm:static sm:h-[46px] sm:shadow-none"
      >
        Thanh toán ngay
      </Button>

      {authModalMode && (
        <AuthModal
          mode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onModeChange={(mode) => setAuthModalMode(mode)}
        />
      )}
    </aside>
  );
}

export function CartSummary() {
  return (
    <CartSummaryProvider>
      <CartItemsSection />
      <div className="mt-5 sm:mt-6">
        <PaymentSummarySection />
      </div>
    </CartSummaryProvider>
  );
}

type VoucherModalProps = {
  appliedVoucher: string;
  baseShippingFee: number;
  isLoading: boolean;
  rewards: AvailableLoyaltyReward[];
  searchValue: string;
  subtotal: number;
  onApply: (code: string) => void;
  onClose: () => void;
  onSearchChange: (value: string) => void;
};

function VoucherModal({
  appliedVoucher,
  baseShippingFee,
  isLoading,
  rewards,
  searchValue,
  subtotal,
  onApply,
  onClose,
  onSearchChange,
}: VoucherModalProps) {
  useEffect(() => {
    const code = searchValue.trim().toUpperCase();
    const matched = rewards.find((r) => r.voucher_code?.toUpperCase() === code);
    if (matched && code !== appliedVoucher.toUpperCase()) {
      onApply(matched.voucher_code!);
    }
  }, [searchValue, rewards, onApply, appliedVoucher]);

  const query = searchValue.trim().toUpperCase();
  const filteredRewards = rewards.filter((reward) => {
    if (!query) {
      return true;
    }

    return `${reward.voucher_code ?? ""} ${reward.reward_name} ${reward.reward_type}`
      .toUpperCase()
      .includes(query);
  });

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/45 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-[600px] overflow-hidden rounded-[8px] border border-black bg-white shadow-2xl">
        <div
          className="h-2.5 w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/images/strip-cart-section.png')" }}
          aria-hidden
        />
        <div className="flex items-center justify-between border-b border-black px-5 py-4">
          <div>
            <h3 className="text-xl font-bold uppercase">Mã ưu đãi</h3>
            <p className="mt-1 text-sm font-medium text-black/60">
              Chọn deal tốt nhất cho đơn hàng của bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black bg-white text-2xl leading-none transition hover:bg-black hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="border-b border-black/20 p-5">
          <div className="flex gap-3">
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Nhập hoặc tìm mã ưu đãi"
              className="h-12 min-w-0 flex-1 rounded-pill border border-black bg-white px-5 text-sm font-normal uppercase outline-none transition placeholder:normal-case placeholder:text-black/40 focus:ring-2 focus:ring-black/15"
            />
          </div>
        </div>

        <div className="max-h-[56vh] overflow-y-auto p-5">
          {isLoading ? (
            <div className="rounded-[8px] border border-black/20 p-5 text-sm font-semibold text-black/60">
              Đang tải mã ưu đãi...
            </div>
          ) : filteredRewards.length ? (
            <div className="space-y-3">
              {filteredRewards.map((reward) => {
                const benefit = getRewardBenefit(
                  reward,
                  subtotal,
                  baseShippingFee,
                );
                const code = reward.voucher_code?.toUpperCase() ?? "";
                const isApplied = code === appliedVoucher.toUpperCase();
                const isSupported =
                  reward.reward_type === "FREE_SHIPPING" ||
                  reward.reward_type === "BIRTHDAY_VOUCHER" ||
                  reward.reward_type === "TIER_VOUCHER";
                const disabled = !code || !isSupported || benefit <= 0;

                return (
                  <div
                    key={reward.reward_id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!disabled) {
                        onApply(code);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        !disabled &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        onApply(code);
                      }
                    }}
                    className={
                      isApplied
                        ? "grid cursor-pointer gap-4 rounded-[8px] border border-[#f15a42] bg-[#fff4ee] p-4 text-[#111111] sm:grid-cols-[1fr_auto] sm:items-center"
                        : "grid cursor-pointer gap-4 rounded-[8px] border border-black/20 bg-white p-4 text-[#111111] transition hover:border-black hover:bg-black hover:text-white sm:grid-cols-[1fr_auto] sm:items-center"
                    }
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-[4px] border border-current px-2 py-1 text-xs font-bold uppercase">
                          {code || "Không có mã"}
                        </span>
                        {reward.tier_id && (
                          <span className="rounded-[4px] border border-current px-2 py-1 text-xs font-bold uppercase">
                            {reward.tier_id}
                          </span>
                        )}
                        {reward.quantity > 1 && (
                          <span className="rounded-[4px] border border-current px-2 py-1 text-xs font-bold uppercase">
                            x{reward.quantity}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-3 text-base font-bold">
                        {getRewardTitle(reward)}
                      </h4>
                      <p className="mt-1 text-sm font-medium opacity-70">
                        {getRewardDescription(reward)}
                      </p>
                      <p className="mt-2 text-xs font-semibold opacity-60">
                        Hạn dùng: {formatExpiredAt(reward.expired_at)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <span className="text-xs font-normal leading-5 opacity-75 sm:max-w-[180px] sm:text-right">
                        {getRewardConditionText(reward, subtotal, baseShippingFee)}
                      </span>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={(event) => {
                          event.stopPropagation();
                          onApply(code);
                        }}
                        className={
                          isApplied
                            ? "h-10 rounded-pill border border-[#f15a42] bg-[#f15a42] px-5 text-sm font-bold text-white transition hover:border-black hover:bg-black"
                            : "h-10 rounded-pill border border-current bg-white px-5 text-sm font-bold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                        }
                      >
                        {isApplied ? "Đang dùng" : "Dùng"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[8px] border border-black/20 p-5 text-sm font-semibold text-black/60">
              Chưa có mã phù hợp với từ khóa này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
