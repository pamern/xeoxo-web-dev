"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AuthModalLink } from "@/components/atoms/AuthModalLink";
import { ROUTES } from "@/constants/routes";

function PillInput({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={`flex w-full flex-col gap-3 ${className}`}>
      <span className="text-base font-semibold text-black">{label}</span>
      <input
        className="h-[61px] w-full rounded-pill border border-black bg-white px-6 text-base font-medium text-black outline-none transition placeholder:text-black/40 focus:ring-2 focus:ring-black/15"
        {...props}
      />
    </label>
  );
}

function PillTextarea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="flex w-full flex-col gap-3">
      <span className="text-base font-semibold text-black">{label}</span>
      <textarea
        className="min-h-[166px] w-full resize-none rounded-[20px] border border-black bg-white px-6 py-5 text-base font-medium text-black outline-none transition placeholder:text-black/40 focus:ring-2 focus:ring-black/15"
        {...props}
      />
    </label>
  );
}

function SquareCheckbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4">
      <span className="mt-0.5 inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[2px] border-2 border-black bg-white">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
        <span className={checked ? "h-[15px] w-[15px] rounded-[3px] bg-black" : "h-[15px] w-[15px] rounded-[3px] bg-white"} />
      </span>
      <span className="text-sm leading-6 text-black/75">{children}</span>
    </label>
  );
}

const POLICIES = [
  "Chính sách khách hàng",
  "Chính sách đổi trả",
  "Chính sách kiểm hàng",
  "Chính sách vận chuyển",
];

export function CheckoutForm() {
  const [submitted, setSubmitted] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(true);
  const [otherReceiver, setOtherReceiver] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form id="checkout-form" onSubmit={handleSubmit} className="w-full text-black">
      <div className="rounded-[10px] bg-[#D9D9D9]/30 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div
            className="inline-flex h-[53px] w-full max-w-[341px] items-center justify-center rounded-pill border border-black bg-cover bg-center px-8 text-sm font-bold uppercase text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
            style={{ backgroundImage: "url('/images/bg-gia-nhap-btn.png')" }}
          >
            Gia nhập Xéo Hội ngay!
          </div>
          <div className="min-w-0 text-sm leading-6 text-black/75">
            Tham gia Xéo hội để nhận nhiều đặc quyền vô cùng hấp dẫn.{" "}
            <AuthModalLink mode="register" className="font-bold underline underline-offset-2">
              Tìm hiểu thêm
            </AuthModalLink>
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-2xl font-bold uppercase md:text-[32px] md:leading-tight">
        Thông tin vận chuyển
      </h2>

      <div className="mt-4">
        <SquareCheckbox checked={acceptedPolicy} onChange={setAcceptedPolicy}>
          Bằng việc ấn nút đặt hàng, bạn xác nhận đã đọc và hiểu về chính sách bảo mật dữ liệu cá
          nhân của Xéo Xọ.{" "}
          <Link href={ROUTES.POLICIES} className="font-bold underline underline-offset-2">
            Tại đây
          </Link>
        </SquareCheckbox>
      </div>

      <div className="mt-8 grid gap-6">
        <PillInput label="Họ và tên" name="fullName" placeholder="Nhập họ tên của bạn" autoComplete="name" required />
        <PillInput label="Số điện thoại" name="phone" placeholder="Nhập số điện thoại" autoComplete="tel" required />
        <PillInput label="Email" name="email" type="email" placeholder="Nhập email của bạn" autoComplete="email" />

        <div className="grid gap-3 md:grid-cols-2 md:gap-[11px]">
          <PillInput label="Tỉnh / Thành phố" name="city" placeholder="Nhập tỉnh/thành phố" autoComplete="address-level1" required />
          <PillInput label="Quận / Huyện" name="district" placeholder="Nhập quận/huyện" autoComplete="address-level2" required />
        </div>

        <PillInput label="Địa chỉ cụ thể" name="address" placeholder="Nhập địa chỉ cụ thể" autoComplete="street-address" required />
        <PillTextarea
          label="Ghi chú đơn hàng (tuỳ chọn)"
          name="note"
          rows={5}
          placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa chỉ chi tiết hơn"
        />
      </div>

      <div className="mt-8">
        <SquareCheckbox checked={otherReceiver} onChange={setOtherReceiver}>
          <span className="text-base font-semibold text-black">
            Gọi người khác nhận hàng (nếu có)
          </span>
        </SquareCheckbox>
      </div>

      {otherReceiver && (
        <div className="mt-6 grid gap-3 md:grid-cols-2 md:gap-[11px]">
          <PillInput label="Họ và tên" name="receiverName" placeholder="Nhập họ tên của người nhận" />
          <PillInput label="Số điện thoại" name="receiverPhone" placeholder="Nhập SĐT người nhận" />
        </div>
      )}

      <div className="mt-10">
        <button
          type="button"
          onClick={() => setPoliciesOpen((open) => !open)}
          aria-expanded={policiesOpen}
          className="flex items-center gap-2 text-base font-semibold text-black"
        >
          <Image
            src="/icons/chevron-down.svg"
            alt=""
            width={18}
            height={18}
            aria-hidden
            className={policiesOpen ? "rotate-180 transition-transform" : "transition-transform"}
          />
          Các chính sách mua hàng
        </button>
        {policiesOpen && (
          <ul className="mt-4 flex flex-col gap-2 pl-7 text-sm text-black/75">
            {POLICIES.map((policy) => (
              <li key={policy}>
                <Link href={ROUTES.POLICIES} className="underline underline-offset-2 hover:text-black">
                  {policy}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {submitted && (
        <p className="mt-5 text-sm font-semibold text-black">
          Đã ghi nhận thông tin thanh toán.
        </p>
      )}
    </form>
  );
}
