"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { CartItem } from "@/components/molecules/CartItem";
import { AuthModal } from "@/components/organisms/AuthModal";
import { useAvailableLoyaltyRewards } from "@/hooks/useAvailableLoyaltyRewards";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { ROUTES } from "@/constants/routes";
import { formatPrice } from "@/lib/utils";
import type { AvailableLoyaltyReward } from "@/types/loyalty.types";

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

export function CartSummary() {
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

  return (
    <aside className="w-full text-black">
      <h2 className="text-2xl font-bold uppercase md:text-heading-section md:leading-tight">
        Giỏ hàng
      </h2>

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

      <div className="mt-4 flex items-center justify-between gap-4">
        <label className="inline-flex cursor-pointer items-center gap-4">
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
          <span className="text-base font-medium">Tất cả sản phẩm</span>
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

      {isLoading ? (
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
              onRemove={() => void removeItem(item.cart_item_id)}
            />
          ))}
        </div>
      )}

      <div
        className="mt-5 h-2.5 w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/strip-cart-section.png')" }}
        aria-hidden
      />

      <h3 className="mt-12 text-2xl font-bold uppercase md:text-[28px]">
        Chi tiết thanh toán
      </h3>

      <div className="mt-6">
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
            className="flex min-h-[58px] w-full items-center justify-between gap-4 rounded-[8px] border border-[#f15a42] bg-[#fff4ee] px-4 py-3 text-left text-[#111111] transition hover:border-[#d9442d] hover:bg-[#ffe8dc]"
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
            className="flex min-h-[58px] w-full items-center justify-between gap-4 rounded-[8px] border border-[#f15a42] bg-[#fff4ee] px-4 py-3 text-left text-[#111111] transition hover:border-[#d9442d] hover:bg-[#ffe8dc]"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-sm font-bold uppercase">
                Thành viên nhận mã ưu đãi
              </span>
              <span className="truncate text-sm font-semibold opacity-70">
                Đăng ký thành viên để nâng hạng nhận mã
              </span>
            </span>
            <span className="shrink-0 rounded-pill border border-current px-4 py-2 text-sm font-bold transition hover:bg-black hover:text-white">
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

      <div className="mt-6 divide-y divide-black/50 border-y border-black/50 text-base">
        <div className="flex items-center justify-between py-4">
          <span>Tạm tính</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between py-4">
          <span>Voucher ưu đãi</span>
          <span className="font-semibold">{formatPrice(discount)}</span>
        </div>
        <div className="flex items-center justify-between py-4">
          <span>Phí giao hàng</span>
          <span className="font-semibold">
            {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
          </span>
        </div>
        <div className="flex items-center justify-between py-5 text-lg font-bold uppercase">
          <span>Thành tiền</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <fieldset className="mt-10 space-y-0">
        <legend className="mb-4 text-lg font-bold uppercase">
          Phương thức thanh toán
        </legend>
        {options.map((option) => {
          const checked = paymentMethodId === option.method_id;
          return (
            <label
              key={option.method_id}
              className="flex cursor-pointer items-center gap-4 border-b border-black/50 py-4 first:border-t"
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
              <span className="text-base font-medium">
                {option.method_name}
              </span>
            </label>
          );
        })}
      </fieldset>

      <label className="mt-6 flex cursor-pointer items-start gap-4">
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
        <p className="mt-4 text-sm font-semibold text-red-600">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        form="checkout-form"
        variant="primaryPill"
        size="pill"
        disabled={!acceptedTerms || selectedIds.length === 0 || isMutating}
        className="mt-8 h-[58px] w-full min-w-0 text-base font-bold uppercase"
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
              className="h-12 min-w-0 flex-1 rounded-pill border border-black bg-white px-5 text-sm font-semibold uppercase outline-none transition placeholder:normal-case placeholder:text-black/40 focus:ring-2 focus:ring-black/15"
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
                      <span className="text-sm font-bold">
                        {benefit > 0 ? `-${formatPrice(benefit)}` : "Chưa đủ điều kiện"}
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
