"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { CartItem } from "@/components/molecules/CartItem";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { formatPrice } from "@/lib/utils";

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

export function CartSummary() {
  const { cart, isLoading, isMutating, updateItem, removeItem, clearCart } =
    useCart();
  const { paymentMethods } = usePaymentMethods();
  const { preview, previewCheckout, resetPreview, errorMessage } =
    useCheckout();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");

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
  const subtotal =
    preview?.subtotal ??
    selectedItems.reduce((sum, item) => sum + item.line_total, 0);
  const shippingFee = preview?.shipping_fee ?? (subtotal > 0 ? 30000 : 0);
  const discount = preview?.discount_amount ?? 0;
  const total =
    preview?.total_amount ?? Math.max(subtotal + shippingFee - discount, 0);

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
                void updateItem(item.cart_item_id, {
                  variant_id: next.variant_id,
                })
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
        <label
          htmlFor="voucher-code"
          className="mb-3 block text-base font-bold"
        >
          Mã ưu đãi
        </label>
        <div className="flex gap-3">
          <input
            id="voucher-code"
            type="text"
            value={voucherCode}
            onChange={(event) =>
              setVoucherCode(event.target.value.toUpperCase())
            }
            placeholder="Nhập mã ưu đãi"
            className="h-12 min-w-0 flex-1 rounded-pill border border-black bg-white px-5 text-sm font-semibold uppercase outline-none transition placeholder:normal-case placeholder:text-black/40 focus:ring-2 focus:ring-black/15"
          />
          <Button
            type="button"
            variant="secondaryPill"
            size="pill"
            disabled={!voucherCode.trim()}
            onClick={() => setAppliedVoucher(voucherCode.trim())}
            className="h-12 min-w-[120px] px-5 text-sm"
          >
            Áp dụng
          </Button>
        </div>
        {appliedVoucher && (
          <p className="mt-2 text-sm font-semibold text-black/60">
            Đã áp dụng mã: {appliedVoucher}
          </p>
        )}
      </div>

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
    </aside>
  );
}
