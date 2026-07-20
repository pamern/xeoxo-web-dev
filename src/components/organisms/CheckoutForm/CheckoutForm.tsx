"use client";

import {
  useEffect,
  useState,
  useMemo,
  useRef,
  type FormEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { AuthModalLink } from "@/components/atoms/AuthModalLink";
import { ActionSuccessModal } from "@/components/organisms/ActionSuccessModal";
import { useAddresses } from "@/hooks/useAddresses";
import { useAuth } from "@/hooks/useAuth";
import { useCheckout } from "@/hooks/useCheckout";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { ROUTES } from "@/constants/routes";
import { validateFields, validateName, validatePhone, validateEmail, validateAddress } from "@/data/vietnam-regions";
import type { CustomerAddress } from "@/types/customer.types";
import type { ShippingAddressValues } from "@/types/order.types";

function PillInput({
  label,
  className = "",
  labelClassName = "",
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  className?: string;
  labelClassName?: string;
  error?: string;
}) {
  return (
    <label className={`flex w-full flex-col gap-1 ${className}`}>
      <span className={`text-[13px] font-semibold text-black ${labelClassName}`.trim()}>
        {label}
      </span>
      <input
        className={`h-11 w-full rounded-pill border bg-white px-4 text-sm font-normal text-black outline-none transition placeholder:text-black/40 focus:ring-2 sm:h-[36px] sm:text-xs ${
          error
            ? "border-[#ff593d] focus:ring-red-500/15"
            : "border-black focus:ring-black/15"
        }`}
        {...props}
      />
      {error && (
        <span className="px-2 text-xs font-normal text-[#ff593d]">
          {error}
        </span>
      )}
    </label>
  );
}

function PillTextarea({
  label,
  error,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  className?: string;
}) {
  return (
    <label className={`flex w-full flex-col gap-1 ${className}`}>
      <span className="text-[13px] font-semibold text-black">{label}</span>
      <textarea
        className={`min-h-[88px] w-full resize-none rounded-[16px] border bg-white px-4 py-3 text-sm font-normal text-black outline-none transition placeholder:text-black/40 focus:ring-2 sm:min-h-[70px] sm:py-2.5 sm:text-xs ${
          error
            ? "border-[#ff593d] focus:ring-red-500/15"
            : "border-black focus:ring-black/15"
        }`}
        {...props}
      />
      {error && (
        <span className="px-2 text-xs font-normal text-[#ff593d]">
          {error}
        </span>
      )}
    </label>
  );
}

function PillSelect({
  label,
  options,
  className = "",
  error,
  ...props
}: {
  label: string;
  options: Array<{ id: number | string; name: string }>;
  className?: string;
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={`flex w-full flex-col gap-1 ${className}`}>
      <span className="text-[13px] font-semibold text-black">{label}</span>
      <div className="relative w-full">
        <select
          className={`h-11 w-full appearance-none rounded-pill border bg-white pl-4 pr-10 text-sm font-normal text-black outline-none transition focus:ring-2 sm:h-[36px] sm:text-xs ${
            error
              ? "border-[#ff593d] focus:ring-red-500/15"
              : "border-black focus:ring-black/15"
          }`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-black"
        />
      </div>
      {error && (
        <span className="px-2 text-xs font-normal text-[#ff593d]">
          {error}
        </span>
      )}
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
    <label className="flex cursor-pointer items-start gap-3 sm:gap-4">
      <span className="mt-0.5 inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[2px] border-2 border-black bg-white">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
        <span
          className={
            checked
              ? "h-[15px] w-[15px] rounded-[3px] bg-black"
              : "h-[15px] w-[15px] rounded-[3px] bg-white"
          }
        />
      </span>
      <span className="text-body-sm leading-6 text-black/75">{children}</span>
    </label>
  );
}

const POLICIES = [
  "Chính sách khách hàng",
  "Chính sách đổi trả",
  "Chính sách kiểm hàng",
  "Chính sách vận chuyển",
];

function formatAddress(address: CustomerAddress) {
  return [address.address_detail, address.district_name, address.province_name]
    .filter(Boolean)
    .join(", ");
}

export function CheckoutForm() {
  const auth = useAuth();
  const isMember = auth.isAuthenticated;
  const {
    addresses,
    isLoading: isLoadingAddresses,
    isMutating: isSavingAddress,
    errorMessage: addressError,
    createAddress,
  } = useAddresses(isMember);

  const { createOrder, createdOrder, errorMessage, isSubmitting } =
    useCheckout();
  const activeAddresses = addresses.filter(
    (address) => address.is_active !== false,
  );
  const [selectedAddressId, setSelectedAddressId] = useState<
    number | undefined
  >();
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(true);

  const [submitted, setSubmitted] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(true);
  const [otherReceiver, setOtherReceiver] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submitLockRef = useRef(false);

  const { paymentMethods } = usePaymentMethods();
  const options = useMemo(() => {
    const source = paymentMethods.length
      ? paymentMethods
      : [
          {
            method_id: 1,
            method_name: "Chuyển khoản ngân hàng",
            method_code: "BANK_TRANSFER",
            provider: "BANK_TRANSFER",
            is_online: true,
          },
        ];

    return [...source].sort((a, b) => {
      if (a.is_online !== b.is_online) {
        return a.is_online ? -1 : 1;
      }
      return a.method_id - b.method_id;
    });
  }, [paymentMethods]);

  const [paymentMethodId, setPaymentMethodId] = useState<number>(1);

  useEffect(() => {
    if (
      options.length &&
      !options.some((option) => option.method_id === paymentMethodId)
    ) {
      setPaymentMethodId(options[0].method_id);
    }
  }, [options, paymentMethodId]);

  const validateSingleField = (name: string, value: string) => {
    let error = "";
    if (name === "fullName") {
      error = validateName(value) ?? "";
    } else if (name === "phone") {
      error = validatePhone(value) ?? "";
    } else if (name === "email") {
      error = validateEmail(value) ?? "";
    } else if (name === "address") {
      error = validateAddress(value) ?? "";
    } else if (name === "receiverName" && otherReceiver) {
      error = validateName(value) ?? "";
    } else if (name === "receiverPhone" && otherReceiver) {
      error = validatePhone(value) ?? "";
    }

    setFieldErrors((prev) => {
      const copy = { ...prev };
      if (error) {
        copy[name] = error;
      } else {
        delete copy[name];
      }
      return copy;
    });
  };

  const [dbProvinces, setDbProvinces] = useState<
    Array<{
      province_id: number;
      province_name: string;
      ward: string[] | null;
    }>
  >([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(79);

  useEffect(() => {
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy.province_id;
      delete copy.ward;
      return copy;
    });
  }, [selectedProvinceId]);

  const selectedAddress = activeAddresses.find(
    (address) => address.address_id === selectedAddressId,
  );
  const hasSavedAddress = activeAddresses.length > 0;
  const shouldShowAddressForm = !isMember || !hasSavedAddress || useNewAddress;

  useEffect(() => {
    async function loadProvinces() {
      try {
        const res = await fetch("/api/v1/provinces");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDbProvinces(json.data);
          // Default to TP HCM if present, otherwise first item
          const hcm = json.data.find(
            (p: any) =>
              p.province_name.toLowerCase().includes("hồ chí minh") ||
              p.province_id === 79,
          );
          if (hcm) {
            setSelectedProvinceId(hcm.province_id);
          } else if (json.data.length > 0) {
            setSelectedProvinceId(json.data[0].province_id);
          }
        }
      } catch (err) {
        console.error("Failed to load provinces:", err);
      }
    }
    void loadProvinces();
  }, []);

  useEffect(() => {
    if (!selectedAddressId && activeAddresses.length) {
      const defaultAddress =
        activeAddresses.find((address) => address.is_default) ??
        activeAddresses[0];
      setSelectedAddressId(defaultAddress.address_id);
    }
  }, [activeAddresses, selectedAddressId]);

  const currentWards =
    dbProvinces
      .find((province) => province.province_id === selectedProvinceId)
      ?.ward?.map((ward) => ({ id: ward, name: ward })) ?? [];

  function closeSuccessModal() {
    setSuccessModalOpen(false);
    submitLockRef.current = false;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setSubmitted(false);

    if (!acceptedPolicy) {
      alert("Vui lòng xác nhận đồng ý với chính sách bảo mật.");
      submitLockRef.current = false;
      return;
    }

    const formData = new FormData(form);

    if (shouldShowAddressForm) {
      const errors = validateFields(
        {
          fullName: String(formData.get("fullName") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          email: String(formData.get("email") ?? ""),
          address: String(formData.get("address") ?? ""),
          otherReceiver,
          receiverName: String(formData.get("receiverName") ?? ""),
          receiverPhone: String(formData.get("receiverPhone") ?? ""),
          province_id: selectedProvinceId,
          ward: String(formData.get("ward") ?? ""),
          note: String(formData.get("note") ?? ""),
        },
        isMember,
      );

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);

        // Auto scroll to first error
        const firstKey = Object.keys(errors)[0];
        const inputEl = form.querySelector(
          `[name="${firstKey}"]`,
        );
        if (inputEl) {
          inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
          (inputEl as HTMLElement).focus();
        }
        submitLockRef.current = false;
        return;
      }
      setFieldErrors({});
    }

    const cartItemIds = String(formData.get("cart_item_ids") ?? "")
      .split(",")
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
    const paymentMethodId = Number(formData.get("payment_method_id"));
    const voucherCode = String(formData.get("voucher_code") ?? "").trim();
    const customerNote = String(formData.get("note") ?? "").trim();

    if (!cartItemIds.length || !Number.isInteger(paymentMethodId)) {
      submitLockRef.current = false;
      return;
    }

    let addressId = selectedAddress?.address_id;
    let shippingAddress: ShippingAddressValues | undefined;

    if (shouldShowAddressForm) {
      // Build formAddress Values
      const provinceId = Number(formData.get("province_id") ?? 79);
      const isOther = formData.get("is_other_receiver") === "true";
      const recipientName = isOther
        ? String(formData.get("receiverName") ?? "")
        : String(formData.get("fullName") ?? "");
      const recipientPhone = isOther
        ? String(formData.get("receiverPhone") ?? "")
        : String(formData.get("phone") ?? "");

      const formAddress: ShippingAddressValues = {
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
        province_id: provinceId,
        district_name: String(formData.get("ward") ?? "").trim(),
        address_detail: String(formData.get("address") ?? "").trim(),
        email: formData.get("email")
          ? String(formData.get("email")).trim()
          : undefined,
      };

      if (isMember) {
        const saved = await createAddress({
          ...formAddress,
          is_default: setAsDefault || !hasSavedAddress,
        });

        if (!saved.ok || !saved.address) {
          submitLockRef.current = false;
          return;
        }

        addressId = saved.address.address_id;
        setSelectedAddressId(addressId);
        setUseNewAddress(false);
      } else {
        shippingAddress = formAddress;
      }
    }

    const result = await createOrder({
      cart_item_ids: cartItemIds,
      payment_method_id: paymentMethodId,
      address_id: isMember ? addressId : undefined,
      shipping_address: isMember ? undefined : shippingAddress,
      voucher_code: voucherCode || undefined,
      customer_note: customerNote || undefined,
    });

    if (result.ok) {
      form.reset();
      setFieldErrors({});
      setOtherReceiver(false);
      setPoliciesOpen(false);
      setAddressBookOpen(false);
      setUseNewAddress(false);
      setSetAsDefault(true);
      setAcceptedPolicy(true);
      setSubmitted(true);
      setSuccessModalOpen(true);
      window.dispatchEvent(new Event("xeoxo-cart-updated"));
      return;
    }

    submitLockRef.current = false;
  }

  return (
    <form
      id="checkout-form"
      onSubmit={handleSubmit}
      noValidate
      className="w-full text-black"
    >
      {!isMember ? (
        <div className="rounded-[10px] bg-[#D9D9D9]/30 p-3 sm:py-3.5 sm:px-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div
              className="inline-flex h-[36px] w-full max-w-[230px] shrink-0 items-center justify-center rounded-pill border border-black bg-cover bg-center px-3 text-[11px] font-bold uppercase whitespace-nowrap text-white shadow-[0_2px_4px_rgba(0,0,0,0.15)] sm:max-w-[200px] sm:px-4 sm:text-xs"
              style={{ backgroundImage: "url('/images/bg-gia-nhap-btn.png')" }}
            >
              Gia nhập Xéo Hội ngay!
            </div>
            <div className="min-w-0 text-xs leading-5 text-black/75">
              Tham gia Xéo hội để nhận nhiều đặc quyền vô cùng hấp dẫn.{" "}
              <AuthModalLink
                mode="register"
                className="font-bold underline underline-offset-2"
              >
                Tìm hiểu thêm
              </AuthModalLink>
            </div>
          </div>
        </div>
      ) : null}

      <h2
        className={`${isMember ? "" : "mt-6"} text-lg font-bold text-black md:text-xl md:leading-tight`}
      >
        Thông tin vận chuyển
      </h2>

      <div className="mt-4">
        <SquareCheckbox checked={acceptedPolicy} onChange={setAcceptedPolicy}>
          Bằng việc ấn nút đặt hàng, bạn xác nhận đã đọc và hiểu về chính sách
          bảo mật dữ liệu cá nhân của Xéo Xọ.{" "}
          <Link
            href={ROUTES.POLICIES}
            className="font-bold underline underline-offset-2"
          >
            Tại đây
          </Link>
        </SquareCheckbox>
      </div>

      {isMember && isLoadingAddresses && (
        <section className="mt-5 rounded-[10px] border border-black/30 bg-white px-5 py-4">
          <p className="text-sm font-semibold text-black/70">
            Đang tải sổ địa chỉ...
          </p>
        </section>
      )}

      {isMember && !isLoadingAddresses && selectedAddress && !useNewAddress && (
        <section className="mt-4 overflow-hidden rounded-[8px] border border-black bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <div
            className="h-1.5 w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/images/strip-cart-section.png')" }}
            aria-hidden
          />
          <div className="px-4 py-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase text-black/80">Giao đến</span>
                {selectedAddress.is_default && (
                  <span className="rounded-[3px] border border-[#ff593d] px-2 py-0.5 text-[10px] font-semibold text-[#ff593d]">
                    Mặc định
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAddressBookOpen((open) => !open)}
                className="rounded-pill border border-black px-3 py-1 text-xs font-bold transition hover:bg-black hover:text-white"
                aria-expanded={addressBookOpen}
              >
                {addressBookOpen ? "Đóng" : "Thay đổi"}
              </button>
            </div>
            <p className="text-sm font-bold text-black/90">
              {selectedAddress.recipient_name}
              <span className="mx-2 font-light text-black/30">|</span>
              <span className="font-semibold text-black/60">
                {selectedAddress.recipient_phone}
              </span>
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-black/60">
              {formatAddress(selectedAddress)}
            </p>

            {addressBookOpen && (
              <div className="mt-5 border-t border-black/15 pt-4">
                <p className="mb-3 text-sm font-bold">Chọn địa chỉ nhận hàng</p>
                <div className="grid gap-3">
                  {activeAddresses.map((address) => {
                    const isSelected = address.address_id === selectedAddressId;
                    return (
                      <button
                        key={address.address_id}
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(address.address_id);
                          setAddressBookOpen(false);
                        }}
                        className={`rounded-[10px] border p-4 text-left transition ${
                          isSelected
                            ? "border-black bg-black/[0.04]"
                            : "border-black/15 hover:border-black/50"
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${isSelected ? "border-[5px] border-black" : "border-black/35"}`}
                          />
                          <span>
                            <span className="block font-bold">
                              {address.recipient_name} ·{" "}
                              {address.recipient_phone}
                            </span>
                            <span className="mt-1 block text-sm font-medium leading-5 text-black/60">
                              {formatAddress(address)}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(true)}
                    className="rounded-[10px] border border-dashed border-black/30 p-4 text-center font-bold text-black/80 transition hover:border-black/70"
                  >
                    + Giao đến địa chỉ mới
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {!shouldShowAddressForm && (
        <PillTextarea
          label="Ghi chú đơn hàng (tuỳ chọn)"
          name="note"
          rows={2}
          maxLength={200}
          className="mt-4"
          error={fieldErrors.note}
          onChange={(e) => validateSingleField(e.target.name, e.target.value)}
          onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
          placeholder="Ghi chú đơn hàng (tối đa 200 ký tự)"
        />
      )}

      {shouldShowAddressForm && !isLoadingAddresses && (
        <div className="mt-5 grid gap-3">
          {isMember && hasSavedAddress && (
            <div className="flex flex-col gap-3 rounded-[10px] border border-black/25 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-bold">Giao đến địa chỉ mới</p>
                <p className="mt-1 text-sm text-black/60">
                  Địa chỉ này sẽ được lưu vào sổ địa chỉ sau khi đặt hàng.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUseNewAddress(false)}
                className="shrink-0 text-left text-sm font-bold underline underline-offset-4 md:text-right"
              >
                Dùng địa chỉ đã lưu
              </button>
            </div>
          )}

          {isMember && !hasSavedAddress && (
            <p className="rounded-[10px] border border-black/20 bg-white px-5 py-4 text-sm font-semibold text-black/70">
              Bạn chưa có địa chỉ mặc định. Nhập địa chỉ giao hàng bên dưới để
              dùng cho đơn này.
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr]">
            <PillInput
              label="Họ và tên"
              name="fullName"
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              error={fieldErrors.fullName}
              labelClassName="text-[13px] text-black/60"
              onChange={(e) => validateSingleField(e.target.name, e.target.value)}
              onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
              required
            />
            <PillInput
              label="Số điện thoại"
              name="phone"
              placeholder="0383389276"
              autoComplete="tel"
              error={fieldErrors.phone}
              labelClassName="text-[13px] text-black/60"
              onChange={(e) => validateSingleField(e.target.name, e.target.value)}
              onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
              required
            />
          </div>
          <PillInput
            label="Email"
            name="email"
            type="email"
            placeholder="nguyenvana@gmail.com"
            autoComplete="email"
            error={fieldErrors.email}
            onChange={(e) => validateSingleField(e.target.name, e.target.value)}
            onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
            required
          />

          <div className="grid gap-3 md:grid-cols-2 md:gap-[11px]">
            <PillSelect
              label="Tỉnh / Thành phố"
              name="province_id"
              options={dbProvinces.map((p) => ({
                id: p.province_id,
                name: p.province_name,
              }))}
              value={selectedProvinceId}
              onChange={(e) => setSelectedProvinceId(Number(e.target.value))}
              error={fieldErrors.province_id}
              required
            />
            <PillSelect
              label="Phường / Xã"
              name="ward"
              options={currentWards}
              error={fieldErrors.ward}
              required
            />
          </div>

          <PillInput
            label="Địa chỉ cụ thể"
            name="address"
            placeholder="123 Đường Lê Lợi, Phường Bến Thành"
            autoComplete="street-address"
            error={fieldErrors.address}
            onChange={(e) => validateSingleField(e.target.name, e.target.value)}
            onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
            required
          />

          <PillTextarea
            label="Ghi chú đơn hàng (tuỳ chọn)"
            name="note"
            rows={2}
            maxLength={200}
            className="mt-2"
            error={fieldErrors.note}
            onChange={(e) => validateSingleField(e.target.name, e.target.value)}
            onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
            placeholder="Ghi chú đơn hàng (tối đa 200 ký tự)"
          />

          {isMember && (
            <SquareCheckbox checked={setAsDefault} onChange={setSetAsDefault}>
              Đặt làm địa chỉ mặc định cho lần mua sau
            </SquareCheckbox>
          )}
        </div>
      )}

      <div className="mt-5">
        <input
          type="hidden"
          name="is_other_receiver"
          value={String(otherReceiver)}
        />
        <SquareCheckbox checked={otherReceiver} onChange={setOtherReceiver}>
          <span className="text-sm font-semibold text-black/80">
            Gọi người khác nhận hàng (nếu có)
          </span>
        </SquareCheckbox>
      </div>

      {otherReceiver && (
        <div className="mt-6 grid gap-3 md:grid-cols-2 md:gap-[11px]">
          <PillInput
            label="Họ và tên"
            name="receiverName"
            placeholder="Nguyễn Văn B"
            error={fieldErrors.receiverName}
            onChange={(e) => validateSingleField(e.target.name, e.target.value)}
            onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
          />
          <PillInput
            label="Số điện thoại"
            name="receiverPhone"
            placeholder="0987654321"
            error={fieldErrors.receiverPhone}
            onChange={(e) => validateSingleField(e.target.name, e.target.value)}
            onBlur={(e) => validateSingleField(e.target.name, e.target.value)}
          />
        </div>
      )}

      <input
        type="hidden"
        name="payment_method_id"
        value={paymentMethodId}
      />

      <fieldset className="mt-6 space-y-0">
        <legend className="mb-3 text-base font-bold text-black">
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

      {(addressError || errorMessage) && (
        <p className="mt-5 text-sm font-normal text-red-600">
          {addressError ?? errorMessage}
        </p>
      )}

      {isSavingAddress && (
        <p className="mt-5 text-sm font-normal text-black/70">
          Đang lưu địa chỉ...
        </p>
      )}

      {successModalOpen && submitted && createdOrder ? (
        <ActionSuccessModal
          title="Đặt Hàng Thành Công"
          eyebrow="Xéo Xọ xác nhận đơn hàng"
          message="Đơn hàng của bạn đã được tạo thành công. Xéo Xọ sẽ tiếp nhận, xử lý và cập nhật trạng thái sớm nhất để bạn tiện theo dõi."
          codeLabel="Mã đơn hàng"
          codeValue={createdOrder.order_code}
          primaryLabel="Theo dõi đơn hàng"
          primaryHref={isMember ? ROUTES.ACCOUNT_ORDERS : ROUTES.ORDER_LOOKUP}
          primaryAction={closeSuccessModal}
          secondaryLabel="Tiếp tục mua sắm"
          secondaryHref={ROUTES.PRODUCTS}
          secondaryAction={closeSuccessModal}
          onClose={closeSuccessModal}
        />
      ) : null}
    </form>
  );
}
