"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type CancelOrderButtonProps = {
  cancelContext?: {
    contact: string;
    contactType: "email" | "phone";
    source: "lookup" | "account";
  };
  onCancelled?: () => void | Promise<void>;
  orderId: number;
  orderCode: string;
};

export function CancelOrderButton({
  onCancelled,
  orderId,
  orderCode,
}: CancelOrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleCancelOrder() {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/cancel`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Không thể hủy đơn hàng.");
      }

      // Close first so either refresh path feels immediate.
      setIsOpen(false);
      if (onCancelled) {
        await onCancelled();
      } else {
        router.refresh();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Đã xảy ra lỗi khi hủy đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setErrorMsg(null);
        }}
        className="flex min-h-[44px] items-center justify-center rounded-pill border-2 border-[#ff593d] bg-white text-[0.9375rem] font-bold text-[#ff593d] transition-colors hover:bg-[#ff593d] hover:text-white"
      >
        Hủy Đơn Hàng
      </button>

      {/* Cancellation Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isLoading && setIsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-[440px] border-2 border-black bg-white p-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            <h3 className="text-center text-xl font-extrabold uppercase tracking-tight text-black">
              Xác nhận hủy đơn hàng
            </h3>

            <p className="mt-4 text-center text-sm font-light leading-relaxed text-black/75">
              Bạn có chắc chắn muốn hủy đơn hàng{" "}
              <strong className="font-semibold text-black">{orderCode}</strong>? Hành động này
              không thể hoàn tác.
            </p>

            {errorMsg && (
              <p className="mt-4 text-center text-[13px] font-medium text-[#ff593d]">
                {errorMsg}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCancelOrder}
                className="flex min-h-[44px] flex-1 items-center justify-center rounded-pill bg-[#ff593d] text-[14px] font-bold uppercase text-white transition-colors hover:bg-[#e0482c] disabled:opacity-50"
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận hủy"}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setIsOpen(false)}
                className="flex min-h-[44px] flex-1 items-center justify-center rounded-pill border-2 border-black bg-white text-[14px] font-bold uppercase text-black transition-colors hover:bg-black/5 disabled:opacity-50"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
