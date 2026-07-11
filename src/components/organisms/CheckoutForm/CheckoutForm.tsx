"use client";

import {
  useEffect,
  useState,
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
import { ROUTES } from "@/constants/routes";
import { validateFields } from "@/data/vietnam-regions";
import type { CustomerAddress } from "@/types/customer.types";
import type { ShippingAddressValues } from "@/types/order.types";

function PillInput({
  label,
  className = "",
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  className?: string;
  error?: string;
}) {
  return (
    <label className={`flex w-full flex-col gap-2.5 ${className}`}>
      <span className="text-sm font-semibold text-black">{label}</span>
      <input
        className={`h-[56px] w-full rounded-pill border bg-white px-5 text-sm font-medium text-black outline-none transition placeholder:text-black/40 focus:ring-2 ${
          error
            ? "border-[#ff593d] focus:ring-red-500/15"
            : "border-black focus:ring-black/15"
        }`}
        {...props}
      />
      {error && (
        <span className="px-2 text-xs font-semibold text-[#ff593d]">
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
    <label className={`flex w-full flex-col gap-2.5 ${className}`}>
      <span className="text-sm font-semibold text-black">{label}</span>
      <textarea
        className={`min-h-[152px] w-full resize-none rounded-[20px] border bg-white px-5 py-4 text-sm font-medium text-black outline-none transition placeholder:text-black/40 focus:ring-2 ${
          error
            ? "border-[#ff593d] focus:ring-red-500/15"
            : "border-black focus:ring-black/15"
        }`}
        {...props}
      />
      {error && (
        <span className="px-2 text-xs font-semibold text-[#ff593d]">
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
    <label className={`flex w-full flex-col gap-2.5 ${className}`}>
      <span className="text-sm font-semibold text-black">{label}</span>
      <div className="relative w-full">
        <select
          className={`h-[56px] w-full appearance-none rounded-pill border bg-white px-5 text-sm font-medium text-black outline-none transition focus:ring-2 ${
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
          className="pointer-events-none absolute right-5 top-1/2 h-2.5 w-2.5 -translate-y-2/3 rotate-45 border-b-2 border-r-2 border-black"
        />
      </div>
      {error && (
        <span className="px-2 text-xs font-semibold text-[#ff593d]">
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
    <label className="flex cursor-pointer items-start gap-3">
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
      <span className="text-xs leading-5 text-black/75">{children}</span>
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

  const [dbProvinces, setDbProvinces] = useState<
    Array<{
      province_id: number;
      province_name: string;
      ward: string[] | null;
    }>
  >([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(79);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(false);

    if (!acceptedPolicy) {
      alert("Vui lòng xác nhận đồng ý với chính sách bảo mật.");
      return;
    }

    const formData = new FormData(event.currentTarget);

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
        },
        isMember,
      );

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);

        // Auto scroll to first error
        const firstKey = Object.keys(errors)[0];
        const inputEl = event.currentTarget.querySelector(
          `[name="${firstKey}"]`,
        );
        if (inputEl) {
          inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
          (inputEl as HTMLElement).focus();
        }
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

    if (customerNote.length > 200) {
      setFieldErrors((current) => ({
        ...current,
        note: "Ghi chú đơn hàng không được vượt quá 200 ký tự.",
      }));
      return;
    }

    if (!cartItemIds.length || !Number.isInteger(paymentMethodId)) {
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
      setSubmitted(true);
      setSuccessModalOpen(true);
      window.dispatchEvent(new Event("xeoxo-cart-updated"));
    }
  }

  return (
    <form
      id="checkout-form"
      onSubmit={handleSubmit}
      noValidate
      className="w-full text-black"
    >
      {!isMember ? (
        <div className="rounded-[10px] bg-[#D9D9D9]/30 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div
              className="inline-flex h-[50px] w-full max-w-[341px] items-center justify-center rounded-pill border border-black bg-cover bg-center px-6 text-sm font-bold uppercase text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
              style={{ backgroundImage: "url('/images/bg-gia-nhap-btn.png')" }}
            >
              Gia nhập Xéo Hội ngay!
            </div>
            <div className="min-w-0 text-sm leading-6 text-black/75">
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

      <h2 className="text-xl font-bold md:text-3xl md:leading-tight">
        Thông tin vận chuyển
      </h2>

      <div className="mt-3">
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
        <section className="mt-4 rounded-[10px] border border-black/30 bg-white px-4 py-3.5">
          <p className="text-xs font-semibold text-black/70">
            Đang tải sổ địa chỉ...
          </p>
        </section>
      )}

      {isMember && !isLoadingAddresses && selectedAddress && !useNewAddress && (
        <section className="mt-4 overflow-hidden rounded-[10px] border border-black bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <div
            className="h-2.5 w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/images/strip-cart-section.png')" }}
            aria-hidden
          />
          <div className="px-4 py-3.5">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold uppercase">Giao đến</span>
                {selectedAddress.is_default && (
                  <span className="rounded-[3px] border border-[#ff593d] px-3 py-1 text-xs font-semibold text-[#ff593d]">
                    Mặc định
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAddressBookOpen((open) => !open)}
                className="rounded-pill border border-black px-4 py-1.5 text-sm font-bold transition hover:bg-black hover:text-white"
                aria-expanded={addressBookOpen}
              >
                {addressBookOpen ? "Đóng" : "Thay đổi"}
              </button>
            </div>
            <p className="text-sm font-bold">
              {selectedAddress.recipient_name}
              <span className="mx-2 font-light text-black/40">|</span>
              <span className="font-semibold text-black/70">
                {selectedAddress.recipient_phone}
              </span>
            </p>
            <p className="mt-1.5 text-xs font-medium leading-5 text-black/75">
              {formatAddress(selectedAddress)}
            </p>

            {addressBookOpen && (
              <div className="mt-4 border-t border-black/15 pt-3.5">
                <p className="mb-3 text-xs font-bold">Chọn địa chỉ nhận hàng</p>
                <div className="grid gap-2.5">
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
                        className={`rounded-[10px] border p-3.5 text-left transition ${
                          isSelected
                            ? "border-black bg-black/[0.04]"
                            : "border-black/15 hover:border-black/50"
                        }`}
                      >
                        <span className="flex items-start gap-2.5">
                          <span
                            className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${isSelected ? "border-[5px] border-black" : "border-black/35"}`}
                          />
                          <span>
                            <span className="block font-bold">
                              {address.recipient_name} ·{" "}
                              {address.recipient_phone}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-black/65">
                              {formatAddress(address)}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUseNewAddress(true);
                    setAddressBookOpen(false);
                  }}
                  className="mt-2.5 h-10 rounded-pill bg-black px-5 text-sm font-bold text-white transition hover:bg-black/85"
                >
                  + Thêm địa chỉ mới
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {shouldShowAddressForm && !isLoadingAddresses && (
        <div className="mt-5 grid gap-5">
          {isMember && hasSavedAddress && (
            <div className="flex flex-col gap-2.5 rounded-[10px] border border-black/25 bg-white px-4 py-3.5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold">Giao đến địa chỉ mới</p>
                <p className="mt-1 text-xs text-black/60">
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
            <p className="rounded-[10px] border border-black/20 bg-white px-4 py-3.5 text-xs font-semibold text-black/70">
              Bạn chưa có địa chỉ mặc định. Nhập địa chỉ giao hàng bên dưới để
              dùng cho đơn này.
            </p>
          )}

          <PillInput
            label="Họ và tên"
            name="fullName"
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            error={fieldErrors.fullName}
            required
          />
          <PillInput
            label="Số điện thoại"
            name="phone"
            placeholder="0912345678"
            autoComplete="tel"
            error={fieldErrors.phone}
            required
          />
          <PillInput
            label="Email"
            name="email"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            error={fieldErrors.email}
          />

          <div className="grid gap-2.5 md:grid-cols-2 md:gap-2.5">
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
              error={fieldErrors.district}
              required
            />
          </div>

          <PillInput
            label="Địa chỉ cụ thể"
            name="address"
            placeholder="123 Đường Lê Lợi, Phường Bến Thành"
            autoComplete="street-address"
            error={fieldErrors.address}
            required
          />

          {isMember && (
            <SquareCheckbox checked={setAsDefault} onChange={setSetAsDefault}>
              Đặt làm địa chỉ mặc định cho lần mua sau
            </SquareCheckbox>
          )}
        </div>
      )}

      <div className="mt-6">
        <input
          type="hidden"
          name="is_other_receiver"
          value={String(otherReceiver)}
        />
        <SquareCheckbox checked={otherReceiver} onChange={setOtherReceiver}>
          <span className="text-sm font-semibold text-black">
            Gọi người khác nhận hàng (nếu có)
          </span>
        </SquareCheckbox>
      </div>

      {otherReceiver && (
        <div className="mt-5 grid gap-2.5 md:grid-cols-2 md:gap-2.5">
          <PillInput
            label="Họ và tên"
            name="receiverName"
            placeholder="Nguyễn Văn B"
            error={fieldErrors.receiverName}
          />
          <PillInput
            label="Số điện thoại"
            name="receiverPhone"
            placeholder="0987654321"
            error={fieldErrors.receiverPhone}
          />
        </div>
      )}

      <PillTextarea
        label="Ghi chú đơn hàng (tuỳ chọn)"
        name="note"
        rows={5}
        maxLength={200}
        className="mt-4"
        error={fieldErrors.note}
        placeholder="Ghi chú đơn hàng (tối đa 200 ký tự), ví dụ: thời gian giao hàng mong muốn"
      />

      <div className="mt-8">
        <button
          type="button"
          onClick={() => setPoliciesOpen((open) => !open)}
          aria-expanded={policiesOpen}
          className="flex items-center gap-2 text-sm font-semibold text-black"
        >
          <Image
            src="/icons/chevron-down.svg"
            alt=""
            width={18}
            height={18}
            aria-hidden
            className={
              policiesOpen
                ? "rotate-180 transition-transform"
                : "transition-transform"
            }
          />
          Các chính sách mua hàng
        </button>
        {policiesOpen && (
          <ul className="mt-3 flex flex-col gap-1.5 pl-7 text-xs text-black/75">
            {POLICIES.map((policy) => (
              <li key={policy}>
                <Link
                  href={ROUTES.POLICIES}
                  className="underline underline-offset-2 hover:text-black"
                >
                  {policy}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(addressError || errorMessage) && (
        <p className="mt-4 text-xs font-semibold text-red-600">
          {addressError ?? errorMessage}
        </p>
      )}

      {(isSubmitting || isSavingAddress) && (
        <p className="mt-4 text-xs font-semibold text-black/70">
          {isSavingAddress ? "Đang lưu địa chỉ..." : "Đang tạo đơn hàng..."}
        </p>
      )}

      {successModalOpen && submitted && createdOrder ? (
        <ActionSuccessModal
          title="Đặt Hàng Thành Công"
          eyebrow="Xéo Xọ xác nhận đơn hàng"
          message="Đơn hàng của bạn đã được tạo thành công. Xéo Xọ sẽ tiếp nhận, xử lý và cập nhật trạng thái sớm nhất để bạn tiện theo dõi."
          codeLabel="Mã đơn hàng"
          codeValue={createdOrder.order_code}
          primaryLabel="Xem đơn hàng"
          primaryHref={
            isMember
              ? ROUTES.ACCOUNT_ORDERS
              : ROUTES.ORDER_LOOKUP
          }
          primaryAction={() => setSuccessModalOpen(false)}
          secondaryLabel="Tiếp tục mua sắm"
          secondaryHref={ROUTES.HOME}
          secondaryAction={() => setSuccessModalOpen(false)}
          onClose={() => setSuccessModalOpen(false)}
        />
      ) : null}
    </form>
  );
}
