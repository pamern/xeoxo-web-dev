"use client";

import { useAddresses } from "@/hooks/useAddresses";
import { cn } from "@/lib/utils";
import type { CustomerAddress } from "@/types/customer.types";

function formatAddress(address: CustomerAddress) {
  return [
    address.address_detail.trim(),
    address.district_name.trim(),
    address.province_name?.trim() ?? "",
  ]
    .filter(Boolean)
    .join(", ");
}

function AddressCard({ address }: { address: CustomerAddress }) {
  const isDefault = address.is_default;

  return (
    <article className="border border-black/30 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-4 px-5 py-5 md:px-6">
        <div className="flex flex-col gap-3 border-b border-black/10 pb-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h3 className="text-heading-card leading-none text-foreground">
                {address.recipient_name}
              </h3>
              <span className="hidden text-[28px] font-light leading-none text-foreground/35 md:inline">
                |
              </span>
              <p className="text-body font-medium text-foreground/58">
                {address.recipient_phone}
              </p>
            </div>
            <p className="text-body-lg font-medium leading-relaxed text-foreground/82">
              {formatAddress(address)}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start text-body-sm font-semibold">
            <button
              type="button"
              className="text-accent transition-opacity hover:opacity-80"
              disabled
              aria-disabled="true"
              title="Chức năng này sẽ được nối khi API địa chỉ được chốt."
            >
              Cập nhật
            </button>
            {!isDefault ? (
              <>
                <span className="text-foreground/28">|</span>
                <button
                  type="button"
                  className="text-accent transition-opacity hover:opacity-80"
                  disabled
                  aria-disabled="true"
                  title="Chức năng này sẽ được nối khi API địa chỉ được chốt."
                >
                  Xóa
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {isDefault ? (
            <span className="inline-flex min-h-11 items-center justify-center rounded-sm border border-accent px-5 text-heading-content-sm font-semibold text-accent">
              Mặc định
            </span>
          ) : (
            <span className="inline-flex min-h-11 items-center justify-center rounded-sm border border-transparent px-5 text-heading-content-sm font-semibold text-transparent">
              Mặc định
            </span>
          )}

          {!isDefault ? (
            <button
              type="button"
              title="Chức năng này sẽ được nối khi API địa chỉ được chốt."
              className={cn(
                "inline-flex min-h-11 min-w-[220px] items-center justify-center rounded-sm border px-6 text-heading-content-sm font-medium transition-colors",
                "border-black/55 bg-white text-foreground",
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
  const { addresses, errorMessage, isLoading } = useAddresses(
    isAuthenticated,
    initialAddresses,
  );

  if (!isAuthenticated) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-secondary px-6 py-8">
        <p className="text-body-lg font-medium">Bạn cần đăng nhập để xem sổ địa chỉ.</p>
        <p className="mt-2 text-body-sm font-light text-foreground/72">
          Sau khi đăng nhập, trang này sẽ hiển thị các địa chỉ giao hàng gắn với
          tài khoản của bạn trong hệ thống.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8 rounded-lg border border-black/12 bg-secondary px-6 py-10">
        <p className="text-body-lg font-medium text-foreground/72">
          Đang tải sổ địa chỉ...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mt-8 rounded-lg border border-accent-strong/25 bg-accent-muted px-6 py-8">
        <p className="text-body-lg font-semibold text-accent-strong">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-7">
      {addresses.length ? (
        addresses.map((address) => (
          <AddressCard key={address.address_id} address={address} />
        ))
      ) : (
        <div className="rounded-lg border border-black/12 bg-secondary px-6 py-10">
          <p className="text-heading-card font-bold text-foreground">
            Bạn chưa có địa chỉ giao hàng nào.
          </p>
          <p className="mt-3 max-w-[620px] text-body-lg font-light leading-relaxed text-foreground/72">
            Khi API địa chỉ được chốt theo docs, phần thêm và cập nhật địa chỉ sẽ
            được nối vào ngay tại màn hình này.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Chức năng này sẽ được nối khi API địa chỉ được chốt."
          className="inline-flex min-h-control min-w-[196px] items-center justify-center rounded-sm border border-accent-strong bg-[url('/images/header-line-up.png')] bg-[length:cover] bg-center px-6 text-button font-extrabold text-white shadow-[0_12px_26px_rgba(207,92,67,0.28)] disabled:cursor-not-allowed disabled:opacity-100"
        >
          Thêm địa điểm
        </button>
      </div>
    </div>
  );
}
