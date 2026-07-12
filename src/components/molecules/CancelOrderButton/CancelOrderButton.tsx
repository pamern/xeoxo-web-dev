"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

const DEMO_CANCEL_OTP = "482774";
const OTP_LENGTH = 6;
const DEMO_FILL_DELAY_MS = 5000;

function maskPhoneNumber(phone: string) {
  const normalized = phone.replace(/\s+/g, "");
  if (normalized.length <= 3) {
    return normalized;
  }

  return `${normalized.slice(0, -3)}xxx`;
}

function maskEmail(email: string) {
  const [localPart, domain = ""] = email.split("@");

  if (!localPart) {
    return email;
  }

  const visible = localPart.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(localPart.length - 2, 2))}@${domain}`;
}

export function CancelOrderButton({
  cancelContext,
  onCancelled,
  orderId,
  orderCode,
}: CancelOrderButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [demoOtpFlowKey, setDemoOtpFlowKey] = useState(0);
  const router = useRouter();

  const isLookupGuest = cancelContext?.source === "lookup";
  const shouldUseDemoOtp = isLookupGuest;

  async function verifyEmailOtp(token: string) {
    if (!cancelContext || cancelContext.contactType !== "email") {
      return;
    }

    const response = await fetch("/api/v1/auth/email-otp/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: cancelContext.contact,
        order_code: orderCode,
        order_id: orderId,
        purpose: "cancel-order",
        token,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Không thể xác thực OTP email.");
    }
  }

  async function handleCancelOrder(otpToken?: string) {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (cancelContext?.source === "lookup" && cancelContext.contactType === "email") {
        const token = String(otpToken ?? "").trim();

        if (!/^\d{6}$/.test(token)) {
          throw new Error("Mã OTP email không hợp lệ.");
        }

        await verifyEmailOtp(token);
      }

      const response = await fetch(`/api/v1/orders/${orderId}/cancel`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(
          cancelContext?.source === "lookup"
            ? {
                contact: cancelContext.contact,
                order_code: orderCode,
                otp_token: otpToken ?? null,
              }
            : {},
        ),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Không thể hủy đơn hàng.");
      }

      setIsConfirmOpen(false);
      setIsOtpOpen(false);
      if (onCancelled) {
        await onCancelled();
      } else {
        router.refresh();
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi hủy đơn hàng.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function startDemoOtpFlow() {
    setErrorMsg(null);
    setOtpValue("");
    setCountdown(5);
    setIsConfirmOpen(false);
    setIsOtpOpen(true);
    setDemoOtpFlowKey((current) => current + 1);
  }

  function handleConfirm() {
    if (shouldUseDemoOtp) {
      startDemoOtpFlow();
      return;
    }

    void handleCancelOrder();
  }

  useEffect(() => {
    if (!isOtpOpen || !shouldUseDemoOtp || demoOtpFlowKey === 0) {
      return;
    }

    const countdownInterval = window.setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    const autoFillTimeout = window.setTimeout(() => {
      setOtpValue(DEMO_CANCEL_OTP);
      window.setTimeout(() => {
        void handleCancelOrder(DEMO_CANCEL_OTP);
      }, 400);
    }, DEMO_FILL_DELAY_MS);

    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(autoFillTimeout);
    };
  }, [isOtpOpen, shouldUseDemoOtp, demoOtpFlowKey]);

  const otpDigits = Array.from(
    { length: OTP_LENGTH },
    (_, index) => otpValue[index] ?? "",
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsConfirmOpen(true);
          setErrorMsg(null);
        }}
        className="flex min-h-[26px] w-full items-center justify-center rounded-[2px] border border-black bg-cover bg-center px-4 text-center text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(207,92,67,0.18)] transition-opacity hover:opacity-90"
        style={{ backgroundImage: "url('/images/button_background.png')" }}
      >
        Hủy Đơn Hàng
      </button>

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/45 px-4">
          <div
            className="absolute inset-0"
            onClick={() => !isLoading && !isSendingOtp && setIsConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-[520px] rounded-[28px] bg-white p-7 shadow-[0_26px_70px_rgba(0,0,0,0.24)] md:p-8">
            <Image
              src="/images/logohong.png"
              alt="Xéo Xọ"
              width={122}
              height={72}
              className="h-auto w-[78px] md:w-[90px]"
              priority
            />
            <h3 className="mt-3 text-[30px] font-extrabold leading-none text-foreground">
              Xác nhận hủy đơn hàng?
            </h3>
            <p className="mt-4 text-sm leading-6 text-foreground/72 md:text-base">
              Bạn có chắc chắn muốn hủy đơn hàng{" "}
              <strong className="font-semibold text-foreground">
                {orderCode}
              </strong>
              ? Hành động này không thể hoàn tác.
            </p>

            {errorMsg ? (
              <p className="mt-4 rounded-[14px] border border-[#d76a54]/25 bg-[#fff2ee] px-4 py-3 text-sm font-medium text-[#b14f3d]">
                {errorMsg}
              </p>
            ) : null}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isLoading || isSendingOtp}
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-black/20 px-7 text-sm font-semibold text-foreground transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading || isSendingOtp}
                className="inline-flex min-h-[50px] min-w-[156px] items-center justify-center whitespace-nowrap rounded-full bg-black px-8 text-sm font-bold uppercase tracking-[0.03em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading || isSendingOtp ? "Đang xử lý..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isOtpOpen ? (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/45 px-4">
          <div
            className="absolute inset-0"
            onClick={() => !isLoading && !isSendingOtp && setIsOtpOpen(false)}
          />
          <div className="relative z-10 w-full max-w-[780px] overflow-hidden rounded-[28px] bg-white shadow-[0_26px_70px_rgba(0,0,0,0.24)]">
            <div className="h-4 bg-[url('/images/header-line-up.png')] bg-[length:auto_100%] bg-repeat-x" />
            <div className="px-7 py-8 md:px-12 md:py-10">
              <h3 className="text-[1.85rem] font-extrabold leading-none text-black md:text-[2.4rem]">
                Nhập OTP
              </h3>
              <p className="mt-3 text-[15px] font-light leading-6 text-black/75 md:text-[17px] md:leading-7">
                {cancelContext?.contactType === "phone"
                  ? "Nhập mã PIN đã được gửi tới "
                  : "Nhập mã OTP đã được gửi tới "}
                <span className="font-normal text-black">
                  {cancelContext?.contactType === "phone"
                    ? maskPhoneNumber(cancelContext.contact)
                    : maskEmail(cancelContext?.contact ?? "")}
                </span>
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2.5 md:gap-3">
                {otpDigits.map((digit, index) => (
                  <div
                    key={index}
                    className="flex h-[56px] w-[42px] items-center justify-center rounded-[8px] border border-black/30 text-[24px] font-semibold text-black md:h-[72px] md:w-[50px] md:text-[31px]"
                  >
                    {digit}
                  </div>
                ))}
              </div>

              {cancelContext?.contactType === "phone" ? (
                <p className="mx-auto mt-7 max-w-[600px] text-center text-[13px] font-light leading-6 text-black/72 md:text-[15px] md:leading-7">
                  Quý khách lưu ý: Để bảo đảm an toàn bảo mật, các số trên bàn
                  phím{" "}
                  <strong className="font-semibold text-black">
                    sẽ thay đổi vị trí
                  </strong>
                </p>
              ) : null}

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={startDemoOtpFlow}
                  disabled={isLoading || isSendingOtp}
                  className="text-[14px] font-bold uppercase underline underline-offset-4 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]"
                >
                  Gửi lại mã
                </button>
              </div>

              <div className="mt-3 text-center text-[13px] font-medium text-black/60 md:text-sm">
                {shouldUseDemoOtp
                  ? isLoading
                    ? "Đang xác nhận OTP và hủy đơn hàng..."
                    : `Mã demo sẽ tự điền sau ${countdown}s`
                  : "OTP email có hiệu lực ngắn hạn để xác nhận hủy đơn hàng."}
              </div>

              {errorMsg ? (
                <p className="mx-auto mt-5 max-w-[520px] rounded-[12px] border border-[#d76a54]/25 bg-[#fff2ee] px-4 py-3 text-center text-[13px] font-medium text-[#b14f3d] md:text-sm">
                  {errorMsg}
                </p>
              ) : null}

            </div>
            <div className="h-4 bg-[url('/images/header-line-up.png')] bg-[length:auto_100%] bg-repeat-x" />
          </div>
        </div>
      ) : null}
    </>
  );
}
