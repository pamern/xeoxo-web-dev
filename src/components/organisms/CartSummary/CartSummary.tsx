"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { CartItem } from "@/components/molecules/CartItem";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";

function lineKey(line: { productId: string; size: string; color: string }) {
  return `${line.productId}-${line.size}-${line.color}`;
}

export function CartSummary() {
  const lines = useCartStore((state) => state.lines);
  const subtotal = useCartStore((state) => state.subtotal());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const updateVariant = useCartStore((state) => state.updateVariant);
  const removeLine = useCartStore((state) => state.removeLine);
  const clear = useCartStore((state) => state.clear);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("onepay-domestic");
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const keys = useMemo(() => lines.map(lineKey), [lines]);
  const allSelected = keys.length > 0 && keys.every((key) => selectedKeys.includes(key));
  const shippingFee = subtotal > 0 ? 0 : 0;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  useEffect(() => {
    setSelectedKeys(keys);
  }, [keys]);

  function toggleAll(checked: boolean) {
    setSelectedKeys(checked ? keys : []);
  }

  function toggleLine(key: string, checked: boolean) {
    setSelectedKeys((current) =>
      checked ? Array.from(new Set([...current, key])) : current.filter((item) => item !== key)
    );
  }

  return (
    <aside className="w-full text-black">
      <h2 className="text-2xl font-bold uppercase md:text-[32px] md:leading-tight">Giỏ hàng</h2>

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
            <span className={allSelected ? "h-[15px] w-[15px] rounded-[3px] bg-black" : "h-[15px] w-[15px] rounded-[3px] bg-white"} />
          </span>
          <span className="text-base font-medium">Tất cả sản phẩm</span>
        </label>
        <button
          type="button"
          onClick={clear}
          disabled={lines.length === 0}
          className="text-sm font-medium text-black/60 underline underline-offset-4 transition hover:text-black disabled:opacity-40"
        >
          Xóa tất cả
        </button>
      </div>

      <div
        className="mb-5 mt-5 h-2.5 w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/strip-cart-section.png')" }}
        aria-hidden
      />

      {lines.length === 0 ? (
        <div className="border-y border-black/50 py-12 text-center">
          <p className="text-base font-medium">Giỏ hàng của bạn đang trống.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {lines.map((line) => {
            const key = lineKey(line);
            return (
              <CartItem
                key={key}
                item={line}
                selected={selectedKeys.includes(key)}
                onSelectedChange={(checked) => toggleLine(key, checked)}
                onQuantityChange={(quantity) =>
                  updateQuantity(line.productId, line.size, line.color, quantity)
                }
                onVariantChange={(next) =>
                  updateVariant(line.productId, line.size, line.color, next)
                }
                onRemove={() => removeLine(line.productId, line.size, line.color)}
              />
            );
          })}
        </div>
      )}

      <div
        className="mt-5 h-2.5 w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/strip-cart-section.png')" }}
        aria-hidden
      />

      <div className="mt-12">
        <label htmlFor="discountCode" className="mb-3 block text-base font-semibold">
          Nhập mã ưu đãi
        </label>
        <div className="flex h-[58px] overflow-hidden rounded-pill border border-black bg-white">
          <input
            id="discountCode"
            type="text"
            name="discountCode"
            placeholder="Nhập mã ưu đãi của bạn"
            className="min-w-0 flex-1 bg-transparent px-6 text-base font-medium outline-none placeholder:text-black/45"
          />
          <button
            type="button"
            className="w-[156px] shrink-0 rounded-pill bg-black px-6 text-sm font-bold uppercase text-white transition hover:bg-black/85 sm:w-[199px]"
          >
            Áp dụng
          </button>
        </div>
      </div>

      <h3 className="mt-12 text-2xl font-bold uppercase md:text-[28px]">Chi tiết thanh toán</h3>

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
          <span className="font-semibold">{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
        </div>
        <div className="flex items-center justify-between py-5 text-lg font-bold uppercase">
          <span>Thành tiền</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <fieldset className="mt-10 space-y-0">
        <legend className="mb-4 text-lg font-bold uppercase">Phương thức thanh toán</legend>
        {[
          { label: "Cổng thanh toán nội địa OnePay", value: "onepay-domestic" },
          { label: "Cổng thanh toán quốc tế OnePay", value: "onepay-international" },
          { label: "Thanh toán khi nhận hàng", value: "cod" },
          { label: "Chuyển khoản ngân hàng", value: "bank-transfer" },
        ].map((option) => {
          const checked = paymentMethod === option.value;
          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-4 border-b border-black/50 py-4 first:border-t"
            >
              <span className="inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border-2 border-[#2E54FF] bg-white">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={checked}
                  onChange={() => setPaymentMethod(option.value)}
                  className="sr-only"
                />
                <span className={checked ? "h-[15px] w-[15px] rounded-full bg-[#2E54FF]" : "h-[15px] w-[15px] rounded-full bg-white"} />
              </span>
              <span className="text-base font-medium">{option.label}</span>
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
          <span className={acceptedTerms ? "h-[15px] w-[15px] rounded-[3px] bg-black" : "h-[15px] w-[15px] rounded-[3px] bg-white"} />
        </span>
        <span className="text-sm leading-6 text-black/75">
          Tôi đã đọc và đồng ý với chính sách đổi trả.
        </span>
      </label>

      <Button
        type="submit"
        form="checkout-form"
        variant="primaryPill"
        size="pill"
        className="mt-8 h-[58px] w-full min-w-0 text-base font-bold uppercase"
      >
        Thanh toán ngay
      </Button>
    </aside>
  );
}
