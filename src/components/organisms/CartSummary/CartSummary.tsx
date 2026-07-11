"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { CartItem } from "@/components/molecules/CartItem";
import { AuthModal } from "@/components/organisms/AuthModal";
import { CustomizeModal } from "@/components/organisms/CustomizeModal";
import { useAvailableLoyaltyRewards } from "@/hooks/useAvailableLoyaltyRewards";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { ROUTES } from "@/constants/routes";
import type { MeasurementValues } from "@/features/size-recommendation/size-recommendation";
import { formatPrice } from "@/lib/utils";
import { createCustomizationRequest } from "@/services/customization.service";
import type { CartItemDto } from "@/types/cart.types";
import type { AvailableLoyaltyReward } from "@/types/loyalty.types";

type CartSummaryContextValue = ReturnType<typeof useCartSummaryState>;

const CartSummaryContext = createContext<CartSummaryContextValue | null>(null);

function fallbackPaymentOptions() {
  return [
    {
      method_id: 1,
      method_name: "Chuyển khoản ngân hàng",
      method_code: "BANK_TRANSFER",
      provider: "BANK_TRANSFER",
      is_online: true,
    },
  ];
}

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
    return "Mien phi van chuyen";
  }

  if (reward.reward_type === "BIRTHDAY_VOUCHER") {
    return "Qua sinh nhat thanh vien";
  }

  if (reward.reward_type === "TIER_VOUCHER") {
    return "Uu dai hang thanh vien";
  }

  return reward.reward_name;
}

function getRewardDescription(reward: AvailableLoyaltyReward) {
  if (reward.reward_type === "FREE_SHIPPING") {
    return "Ap dung cho phi giao hang cua don nay.";
  }

  if (
    reward.reward_type === "BIRTHDAY_VOUCHER" ||
    reward.reward_type === "TIER_VOUCHER"
  ) {
    return `Giam toi da ${formatPrice(reward.reward_value)}.`;
  }

  return "Quyen loi nay chua ap dung tai gio hang.";
}

function formatExpiredAt(value: string | null) {
  if (!value) {
    return "Khong gioi han";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
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
  const { paymentMethods } = usePaymentMethods();
  const {
    rewards,
    isMember,
    isLoading: isLoadingRewards,
  } = useAvailableLoyaltyRewards();
  const { preview, previewCheckout, resetPreview, errorMessage } =
    useCheckout();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register" | null>(null);
  const options = useMemo(() => {
    const source = paymentMethods.length
      ? paymentMethods
      : fallbackPaymentOptions();

    return [...source].sort((a, b) => {
      if (a.is_online !== b.is_online) {
        return a.is_online ? -1 : 1;
      }

      return a.method_id - b.method_id;
    });
  }, [paymentMethods]);
  const [paymentMethodId, setPaymentMethodId] = useState<number>(
    options[0]?.method_id ?? 1,
  );
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [voucherSearch, setVoucherSearch] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");
  const [hasManualVoucherChoice, setHasManualVoucherChoice] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<CartItemDto | null>(null);

  const cartItemIds = useMemo(
    () => cart.items.map((item) => item.cart_item_id),
    [cart.items],
  );
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
  const bestReward = useMemo(() => {
    return rewards
      .filter((reward) => reward.voucher_code)
      .map((reward) => ({
        reward,
        benefit: getRewardBenefit(reward, selectedSubtotal, baseShippingFee),
      }))
      .filter((item) => item.benefit > 0)
      .sort((a, b) => b.benefit - a.benefit)[0]?.reward;
  }, [baseShippingFee, rewards, selectedSubtotal]);

  useEffect(() => {
    setSelectedIds(cartItemIds);
  }, [cartItemIds]);

  useEffect(() => {
    if (
      options.length &&
      !options.some((option) => option.method_id === paymentMethodId)
    ) {
      setPaymentMethodId(options[0].method_id);
    }
  }, [options, paymentMethodId]);

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

  return {
    acceptedTerms,
    allSelected,
    appliedVoucher,
    applyVoucher,
    authModalMode,
    baseShippingFee,
    bestReward,
    cart,
    clearCart,
    clearVoucher,
    customizingItem,
    discount,
    errorMessage,
    isLoading,
    isLoadingRewards,
    isMember,
    isMutating,
    isVoucherModalOpen,
    options,
    paymentMethodId,
    preview,
    removeItem,
    rewards,
    selectedIds,
    selectedItems,
    selectedReward,
    selectedSubtotal,
    setAcceptedTerms,
    setAuthModalMode,
    setCustomizingItem,
    setIsVoucherModalOpen,
    setPaymentMethodId,
    setVoucherSearch,
    shippingFee,
    submitCartCustomize,
    subtotal,
    toggleAll,
    toggleLine,
    total,
    updateItem,
    voucherSearch,
  };
}

function useCartSummaryContext() {
  const context = useContext(CartSummaryContext);

  if (!context) {
    throw new Error("CartSummary components must be used within CartSummaryProvider");
  }

  return context;
}

export function CartSummaryProvider({ children }: { children: React.ReactNode }) {
  const value = useCartSummaryState();
  return <CartSummaryContext.Provider value={value}>{children}</CartSummaryContext.Provider>;
}

export function CartSummaryProducts() {
  const {
    allSelected,
    cart,
    clearCart,
    isLoading,
    isMutating,
    removeItem,
    selectedIds,
    setCustomizingItem,
    toggleAll,
    toggleLine,
    updateItem,
  } = useCartSummaryContext();

  return (
    <aside className="w-full min-w-0 text-black">
      <h2 className="text-xl font-bold md:text-3xl md:leading-tight">
        Giỏ hàng
      </h2>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <label className="inline-flex cursor-pointer items-center gap-3">
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
          <span className="text-sm font-medium">Tất cả sản phẩm</span>
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
        className="mb-4 mt-4 h-2.5 w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/strip-cart-section.png')" }}
        aria-hidden
      />

      {isLoading ? (
        <div className="border-y border-black/50 py-12 text-center">
          <p className="text-sm font-medium">Đang tải giỏ hàng...</p>
        </div>
      ) : cart.items.length === 0 ? (
        <div className="border-y border-black/50 py-12 text-center">
          <p className="text-sm font-medium">Giỏ hàng của bạn đang trống.</p>
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
    </aside>
  );
}

export function CartSummaryPayment() {
  const {
    acceptedTerms,
    appliedVoucher,
    applyVoucher,
    authModalMode,
    baseShippingFee,
    bestReward,
    clearVoucher,
    customizingItem,
    discount,
    errorMessage,
    isLoadingRewards,
    isMember,
    isMutating,
    isVoucherModalOpen,
    options,
    paymentMethodId,
    rewards,
    selectedIds,
    selectedReward,
    selectedSubtotal,
    setAcceptedTerms,
    setAuthModalMode,
    setCustomizingItem,
    setIsVoucherModalOpen,
    setPaymentMethodId,
    setVoucherSearch,
    shippingFee,
    submitCartCustomize,
    subtotal,
    total,
    voucherSearch,
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
        name="payment_method_id"
        value={paymentMethodId}
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

      <h2 className="text-xl font-bold md:text-3xl md:leading-tight">
        Chi tiết thanh toán
      </h2>

      <div className="mt-5">
        <div className="mb-2.5 flex items-center justify-between gap-2.5">
          <h4 className="text-sm font-bold">Mã ưu đãi</h4>
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
            className="flex min-h-[54px] w-full items-center justify-between gap-3 rounded-[8px] border border-[#f15a42] bg-[#fff4ee] px-4 py-2.5 text-left text-[#111111] transition hover:border-[#d9442d] hover:bg-[#ffe8dc]"
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-xs font-bold uppercase">
                {selectedReward ? getRewardTitle(selectedReward) : "Chọn mã ưu đãi"}
              </span>
              <span className="truncate text-xs font-semibold opacity-70">
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
            className="flex min-h-[54px] w-full items-center justify-between gap-3 rounded-[8px] border border-[#f15a42] bg-[#fff4ee] px-4 py-2.5 text-left text-[#111111] transition hover:border-[#d9442d] hover:bg-[#ffe8dc]"
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-xs font-bold uppercase">
                Thành viên nhận mã ưu đãi
              </span>
              <span className="truncate text-xs font-semibold opacity-70">
                Đăng ký thành viên để nâng hạng nhận mã
              </span>
            </span>
            <span className="shrink-0 rounded-pill border border-current px-4 py-2 text-xs font-bold transition hover:bg-black hover:text-white">
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
          searchValue={voucherSearch}
          subtotal={selectedSubtotal}
          onApply={applyVoucher}
          onClose={() => setIsVoucherModalOpen(false)}
          onSearchChange={(value) => setVoucherSearch(value.toUpperCase())}
        />
      )}

      <div className="mt-5 divide-y divide-black/50 border-y border-black/50 text-sm">
        <div className="flex items-center justify-between gap-3 py-3.5">
          <span>Tạm tính</span>
          <span className="min-w-0 break-words text-right font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 py-3.5">
          <span>Voucher ưu đãi</span>
          <span className="min-w-0 break-words text-right font-semibold">{formatPrice(discount)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 py-3.5">
          <span>Phí giao hàng</span>
          <span className="font-semibold">
            {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3 py-4 text-base font-bold uppercase">
          <span>Thành tiền</span>
          <span className="min-w-0 break-words text-right">{formatPrice(total)}</span>
        </div>
      </div>

      <fieldset className="mt-8 space-y-0">
        <legend className="mb-3 text-base font-bold uppercase">
          Phương thức thanh toán
        </legend>
        {options.map((option) => {
          const checked = paymentMethodId === option.method_id;
          return (
            <label
              key={option.method_id}
              className="flex min-w-0 cursor-pointer items-center gap-3 border-b border-black/50 py-3.5 first:border-t"
            >
              <span className="inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border-2 border-[#2E54FF] bg-white">
                <input
                  type="radio"
                  name="paymentMethodPreview"
                  value={option.method_id}
                  checked={checked}
                  onChange={() => setPaymentMethodId(option.method_id)}
                  className="sr-only"
                />
                <span
                  className={
                    checked
                      ? "h-[15px] w-[15px] rounded-full bg-[#2E54FF]"
                      : "h-[15px] w-[15px] rounded-full bg-white"
                  }
                />
              </span>
              <span className="min-w-0 text-sm font-medium">
                {option.method_name}
              </span>
            </label>
          );
        })}
      </fieldset>

      <label className="mt-5 flex cursor-pointer items-start gap-3">
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
        <span className="text-xs leading-5 text-black/75">
          Tôi đã đọc và đồng ý với chính sách đổi trả.
        </span>
      </label>

      {errorMessage && (
        <p className="mt-3 text-xs font-semibold text-red-600">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        form="checkout-form"
        variant="primaryPill"
        size="pill"
        disabled={!acceptedTerms || selectedIds.length === 0 || isMutating}
        className="mt-6 h-[54px] w-full min-w-0 text-sm font-bold uppercase"
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

      {customizingItem && (
        <CustomizeModal
          gender={customizingItem.gender ?? "nu"}
          componentType={customizingItem.component_type ?? undefined}
          basePrice={customizingItem.unit_price}
          onClose={() => setCustomizingItem(null)}
          onSubmit={submitCartCustomize}
        />
      )}
    </aside>
  );
}

export function CartSummary() {
  return (
    <CartSummaryProvider>
      <div className="flex min-w-0 flex-col gap-10">
        <CartSummaryProducts />
        <CartSummaryPayment />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-[600px] overflow-hidden rounded-[8px] border border-black bg-white shadow-2xl">
        <div
          className="h-2.5 w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/images/strip-cart-section.png')" }}
          aria-hidden
        />
        <div className="flex items-center justify-between border-b border-black px-4 py-3.5">
          <div>
            <h3 className="text-lg font-bold uppercase">Mã ưu đãi</h3>
            <p className="mt-1 text-xs font-medium text-black/60">
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

        <div className="border-b border-black/20 p-4">
          <div className="flex gap-2.5">
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Nhập hoặc tìm mã ưu đãi"
              className="h-12 min-w-0 flex-1 rounded-pill border border-black bg-white px-5 text-xs font-semibold uppercase outline-none transition placeholder:normal-case placeholder:text-black/40 focus:ring-2 focus:ring-black/15"
            />
          </div>
        </div>

        <div className="max-h-[56vh] overflow-y-auto p-4">
          {isLoading ? (
            <div className="rounded-[8px] border border-black/20 p-4 text-xs font-semibold text-black/60">
              Đang tải mã ưu đãi...
            </div>
          ) : filteredRewards.length ? (
            <div className="space-y-2.5">
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
                        ? "grid cursor-pointer gap-3 rounded-[8px] border border-[#f15a42] bg-[#fff4ee] p-3.5 text-[#111111] sm:grid-cols-[1fr_auto] sm:items-center"
                        : "grid cursor-pointer gap-3 rounded-[8px] border border-black/20 bg-white p-3.5 text-[#111111] transition hover:border-black hover:bg-black hover:text-white sm:grid-cols-[1fr_auto] sm:items-center"
                    }
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold uppercase">
                          {getRewardTitle(reward)}
                        </span>
                        {reward.voucher_code ? (
                            <span className="rounded-pill border border-current px-3 py-1 text-[11px] font-bold uppercase">
                            {reward.voucher_code}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-xs font-medium leading-5 opacity-75">
                        {getRewardDescription(reward)}
                      </p>
                      <p className="mt-1.5 text-xs font-semibold uppercase opacity-50">
                        Hết hạn: {formatExpiredAt(reward.expired_at ?? null)}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-1.5 sm:items-end">
                      <span className="text-xs font-bold uppercase">
                        {benefit > 0 ? formatPrice(benefit) : "Khong kha dung"}
                      </span>
                      <span
                        className={
                          disabled
                            ? "rounded-pill border border-current/20 px-3 py-1 text-[11px] font-bold uppercase opacity-40"
                            : isApplied
                              ? "rounded-pill border border-current px-3 py-1 text-[11px] font-bold uppercase"
                              : "rounded-pill border border-current px-3 py-1 text-[11px] font-bold uppercase"
                        }
                      >
                        {disabled ? "Khong ap dung" : isApplied ? "Da chon" : "Ap dung"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[8px] border border-dashed border-black/25 p-4 text-xs font-semibold text-black/60">
              Khong tim thay ma uu dai phu hop.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
