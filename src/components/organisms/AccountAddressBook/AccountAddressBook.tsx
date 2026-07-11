"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { SelectField } from "@/components/molecules/SelectField";
import { API } from "@/constants/routes";
import { useAddresses } from "@/hooks/useAddresses";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/types/api.types";
import type { CustomerAddress } from "@/types/customer.types";
import { customerAddressSchema } from "@/validations/customer/address.schema";

type ProvinceOption = {
  province_id: number;
  province_name: string;
  region: string;
  ward: string[];
};

type AddressFormValues = {
  recipient_name: string;
  recipient_phone: string;
  province_id: string;
  district_name: string;
  address_detail: string;
  is_default: boolean;
};

type AddressFieldName = keyof AddressFormValues;
type AddressFormMode =
  | { type: "create" }
  | { type: "edit"; addressId: number };

const EMPTY_FORM_VALUES: AddressFormValues = {
  recipient_name: "",
  recipient_phone: "",
  province_id: "",
  district_name: "",
  address_detail: "",
  is_default: false,
};

function formatAddress(address: CustomerAddress) {
  return [
    address.address_detail.trim(),
    address.district_name.trim(),
    address.province_name?.trim() ?? "",
  ]
    .filter(Boolean)
    .join(", ");
}

function mapAddressToFormValues(address: CustomerAddress): AddressFormValues {
  return {
    recipient_name: address.recipient_name,
    recipient_phone: address.recipient_phone,
    province_id: String(address.province_id),
    district_name: address.district_name,
    address_detail: address.address_detail,
    is_default: address.is_default,
  };
}

function findDefaultProvinceId(provinces: ProvinceOption[]) {
  const hoChiMinh = provinces.find(
    (province) =>
      province.province_id === 79 ||
      province.province_name.toLowerCase().includes("hồ chí minh"),
  );

  return hoChiMinh?.province_id ?? provinces[0]?.province_id ?? null;
}

function mapValidationIssues(
  issues: Array<{ path: (string | number)[]; message: string }>,
) {
  const nextErrors: Partial<Record<AddressFieldName, string>> = {};

  issues.forEach((issue) => {
    const fieldName = issue.path[0];
    if (typeof fieldName === "string" && !(fieldName in nextErrors)) {
      nextErrors[fieldName as AddressFieldName] = issue.message;
    }
  });

  return nextErrors;
}

function FormField({
  label,
  name,
  value,
  error,
  placeholder,
  autoComplete,
  type = "text",
  onChange,
}: {
  label: string;
  name: Exclude<AddressFieldName, "is_default">;
  value: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  type?: "text" | "tel";
  onChange: (field: Exclude<AddressFieldName, "is_default">, value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
        className={cn(
          "form-control min-h-10 rounded-[10px] border-black/15 bg-white px-4 py-2.5 text-sm font-medium placeholder:text-foreground/35",
          error && "border-destructive focus:border-destructive focus:ring-destructive",
        )}
      />
      {error ? (
        <span className="text-xs font-medium text-destructive">{error}</span>
      ) : null}
    </label>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isBusy,
}: {
  address: CustomerAddress;
  onEdit: (address: CustomerAddress) => void;
  onDelete: (address: CustomerAddress) => void;
  onSetDefault: (address: CustomerAddress) => void;
  isBusy: boolean;
}) {
  const isDefault = address.is_default;

  return (
    <article className="border border-black/30 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-3.5 px-4 py-4 md:px-5">
        <div className="flex flex-col gap-2.5 border-b border-black/10 pb-3.5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h3 className="text-xl font-extrabold leading-none text-foreground">
                {address.recipient_name}
              </h3>
              <span className="hidden text-[1.75rem] font-light leading-none text-foreground/35 md:inline">
                |
              </span>
              <p className="text-sm font-medium text-foreground/58 md:text-base">
                {address.recipient_phone}
              </p>
            </div>
            <p className="text-sm font-medium leading-relaxed text-foreground/82 md:text-base">
              {formatAddress(address)}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start text-xs font-semibold md:text-sm">
            <button
              type="button"
              onClick={() => onEdit(address)}
              disabled={isBusy}
              className="text-[#f0644a] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cập nhật
            </button>
            <button
              type="button"
              onClick={() => onDelete(address)}
              disabled={isBusy}
              className="text-[#c6412d] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Xóa
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {isDefault ? (
            <span className="inline-flex min-h-9 items-center justify-center rounded-[8px] border border-[#f0644a] px-4 text-sm font-semibold text-[#f0644a]">
              Mặc định
            </span>
          ) : (
            <span className="inline-flex min-h-9 items-center justify-center rounded-[8px] border border-transparent px-4 text-sm font-semibold text-transparent">
              Mặc định
            </span>
          )}

          {!isDefault ? (
            <button
              type="button"
              onClick={() => onSetDefault(address)}
              disabled={isBusy}
              className={cn(
                "inline-flex min-h-9 min-w-[176px] items-center justify-center rounded-[8px] border px-5 text-sm font-medium transition-colors",
                "border-black/55 bg-white text-foreground hover:bg-black hover:text-white",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-foreground",
              )}
            >
              Thiết lập mặc định
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function AccountAddressBook({
  initialAddresses,
  isAuthenticated,
}: {
  initialAddresses?: CustomerAddress[];
  isAuthenticated: boolean;
}) {
  const {
    addresses,
    errorMessage,
    isLoading,
    isMutating,
    createAddress,
    updateAddress,
    deleteAddress,
  } = useAddresses(isAuthenticated, initialAddresses);
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [provinceError, setProvinceError] = useState<string>();
  const [formMode, setFormMode] = useState<AddressFormMode | null>(null);
  const [formValues, setFormValues] = useState<AddressFormValues>(EMPTY_FORM_VALUES);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<AddressFieldName, string>>
  >({});

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isCancelled = false;

    async function loadProvinces() {
      try {
        const response = await fetch(API.PROVINCES, {
          credentials: "include",
        });
        const payload = (await response.json()) as ApiResponse<ProvinceOption[]>;

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.message ?? "Không thể tải tỉnh / thành phố.");
        }

        if (isCancelled) {
          return;
        }

        setProvinces(payload.data);
        setProvinceError(undefined);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setProvinceError(
          error instanceof Error
            ? error.message
            : "Không thể tải tỉnh / thành phố.",
        );
      }
    }

    void loadProvinces();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!formMode || formValues.province_id || !provinces.length) {
      return;
    }

    const defaultProvinceId = findDefaultProvinceId(provinces);
    if (!defaultProvinceId) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      province_id: String(defaultProvinceId),
    }));
  }, [formMode, formValues.province_id, provinces]);

  const currentProvince = useMemo(
    () =>
      provinces.find(
        (province) => province.province_id === Number(formValues.province_id),
      ) ?? null,
    [formValues.province_id, provinces],
  );

  const wardOptions = useMemo(() => {
    const wards = currentProvince?.ward ?? [];

    return wards.map((ward) => ({
      label: ward,
      value: ward,
    }));
  }, [currentProvince]);

  function resetForm(nextValues: AddressFormValues = EMPTY_FORM_VALUES) {
    setFormValues(nextValues);
    setFieldErrors({});
  }

  function openCreateForm() {
    const defaultProvinceId = findDefaultProvinceId(provinces);

    setFormMode({ type: "create" });
    resetForm({
      ...EMPTY_FORM_VALUES,
      province_id: defaultProvinceId ? String(defaultProvinceId) : "",
      is_default: addresses.length === 0,
    });
  }

  function openEditForm(address: CustomerAddress) {
    setFormMode({
      type: "edit",
      addressId: address.address_id,
    });
    resetForm(mapAddressToFormValues(address));
  }

  function closeForm() {
    setFormMode(null);
    resetForm();
  }

  function handleFieldChange(
    field: Exclude<AddressFieldName, "is_default">,
    value: string,
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  async function handleSetDefault(address: CustomerAddress) {
    await updateAddress(address.address_id, {
      recipient_name: address.recipient_name,
      recipient_phone: address.recipient_phone,
      province_id: address.province_id,
      district_name: address.district_name,
      address_detail: address.address_detail,
      is_default: true,
    });
  }

  async function handleDelete(address: CustomerAddress) {
    const confirmed = window.confirm(
      address.is_default
        ? "Bạn có chắc muốn xóa địa chỉ mặc định này không?"
        : "Bạn có chắc muốn xóa địa chỉ này không?",
    );

    if (!confirmed) {
      return;
    }

    const result = await deleteAddress(address.address_id);

    if (!result.ok) {
      return;
    }

    if (formMode?.type === "edit" && formMode.addressId === address.address_id) {
      closeForm();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = customerAddressSchema.safeParse({
      recipient_name: formValues.recipient_name,
      recipient_phone: formValues.recipient_phone,
      province_id: formValues.province_id,
      district_name: formValues.district_name,
      address_detail: formValues.address_detail,
      is_default: formValues.is_default,
    });

    if (!parsed.success) {
      setFieldErrors(mapValidationIssues(parsed.error.issues));
      return;
    }

    setFieldErrors({});

    const result =
      formMode?.type === "edit"
        ? await updateAddress(formMode.addressId, parsed.data)
        : await createAddress(parsed.data);

    if (!result.ok) {
      return;
    }

    closeForm();
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-6 rounded-[18px] border border-border bg-secondary px-5 py-6">
        <p className="text-base font-medium">Bạn cần đăng nhập để xem sổ địa chỉ.</p>
        <p className="mt-2 text-sm font-light text-foreground/72">
          Sau khi đăng nhập, trang này sẽ hiển thị các địa chỉ giao hàng gắn với
          tài khoản của bạn trong hệ thống.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-6 rounded-[18px] border border-black/12 bg-secondary px-5 py-8">
        <p className="text-base font-medium text-foreground/72">
          Đang tải sổ địa chỉ...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {errorMessage ? (
        <div className="rounded-[18px] border border-[#d76a54]/25 bg-[#fff2ee] px-5 py-6">
          <p className="text-base font-semibold text-[#b14f3d]">{errorMessage}</p>
        </div>
      ) : null}

      {formMode ? (
        <section className="rounded-[20px] border border-black/12 bg-[#fffdfa] px-4 py-5 shadow-[0_16px_34px_rgba(0,0,0,0.06)] md:px-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-extrabold leading-none text-foreground">
                {formMode.type === "edit" ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h2>
              <p className="mt-1.5 max-w-[620px] text-xs font-medium leading-relaxed text-foreground/65 md:text-sm">
                Nếu địa chỉ này đã từng được dùng cho đơn hàng, hệ thống sẽ lưu
                thành địa chỉ mới để giữ nguyên lịch sử giao hàng cũ.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              disabled={isMutating}
              className="text-left text-sm font-bold underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Hủy
            </button>
          </div>

          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Họ và tên"
                name="recipient_name"
                value={formValues.recipient_name}
                onChange={handleFieldChange}
                error={fieldErrors.recipient_name}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
              <FormField
                label="Số điện thoại"
                name="recipient_phone"
                value={formValues.recipient_phone}
                onChange={handleFieldChange}
                error={fieldErrors.recipient_phone}
                placeholder="0912345678"
                autoComplete="tel"
                type="tel"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Tỉnh / Thành phố"
                value={formValues.province_id}
                onChange={(event) => {
                  const provinceId = event.target.value;
                  const nextProvince = provinces.find(
                    (province) => String(province.province_id) === provinceId,
                  );

                  setFormValues((current) => ({
                    ...current,
                    province_id: provinceId,
                    district_name:
                      nextProvince?.ward.includes(current.district_name)
                        ? current.district_name
                        : "",
                  }));
                  setFieldErrors((current) => ({
                    ...current,
                    province_id: undefined,
                    district_name: undefined,
                  }));
                }}
                options={[
                  { label: "Chọn tỉnh / thành phố", value: "" },
                  ...provinces.map((province) => ({
                    label: province.province_name,
                    value: String(province.province_id),
                  })),
                ]}
                error={fieldErrors.province_id ?? provinceError}
                className="h-10 rounded-[10px] border-black/15 bg-white text-sm font-medium"
                wrapperClassName="text-sm font-semibold"
              />

              <SelectField
                label="Phường / Xã"
                value={formValues.district_name}
                onChange={(event) => handleFieldChange("district_name", event.target.value)}
                options={[
                  {
                    label: currentProvince
                      ? "Chọn phường / xã"
                      : "Chọn tỉnh / thành phố trước",
                    value: "",
                  },
                  ...wardOptions,
                ]}
                disabled={!currentProvince || wardOptions.length === 0}
                error={fieldErrors.district_name}
                className="h-10 rounded-[10px] border-black/15 bg-white text-sm font-medium disabled:cursor-not-allowed disabled:bg-secondary"
                wrapperClassName="text-sm font-semibold"
              />
            </div>

            <FormField
              label="Địa chỉ cụ thể"
              name="address_detail"
              value={formValues.address_detail}
              onChange={handleFieldChange}
              error={fieldErrors.address_detail}
              placeholder="123 Đường Lê Lợi"
              autoComplete="street-address"
            />

            <label className="inline-flex items-center gap-3 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={formValues.is_default}
                onChange={(event) => {
                  setFormValues((current) => ({
                    ...current,
                    is_default: event.target.checked,
                  }));
                  setFieldErrors((current) => ({
                    ...current,
                    is_default: undefined,
                  }));
                }}
                className="h-4 w-4 rounded border-black/30 text-black focus:ring-black"
              />
              Đặt làm địa chỉ mặc định
            </label>

            <div className="flex flex-col gap-3 pt-1 md:flex-row md:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={isMutating}
                className="inline-flex min-h-[42px] items-center justify-center rounded-[10px] border border-black/15 px-5 text-sm font-bold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isMutating}
                className="inline-flex min-h-[42px] min-w-[180px] items-center justify-center rounded-[10px] border border-[#cf5c43] bg-[url('/images/header-line-up.png')] bg-[length:cover] bg-center px-5 text-sm font-extrabold text-white shadow-[0_12px_26px_rgba(207,92,67,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isMutating
                  ? "Đang lưu địa chỉ..."
                  : formMode.type === "edit"
                    ? "Lưu thay đổi"
                    : "Thêm địa chỉ"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {addresses.length ? (
        addresses.map((address) => (
          <AddressCard
            key={address.address_id}
            address={address}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
            isBusy={isMutating}
          />
        ))
      ) : (
        <div className="rounded-[18px] border border-black/12 bg-secondary px-5 py-8">
          <p className="text-lg font-bold text-foreground">
            Bạn chưa có địa chỉ giao hàng nào.
          </p>
          <p className="mt-3 max-w-[520px] text-sm font-light leading-relaxed text-foreground/72">
            Thêm địa chỉ đầu tiên để dùng nhanh ở checkout và lưu làm mặc định
            cho các lần mua sau.
          </p>
        </div>
      )}

      {!formMode ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openCreateForm}
            disabled={isMutating}
            className="inline-flex min-h-[42px] min-w-[164px] items-center justify-center rounded-[8px] border border-[#cf5c43] bg-[url('/images/header-line-up.png')] bg-[length:cover] bg-center px-5 text-base font-extrabold text-white shadow-[0_12px_26px_rgba(207,92,67,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Thêm địa điểm
          </button>
        </div>
      ) : null}
    </div>
  );
}
