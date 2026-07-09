"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { parseAuthIdentifier } from "@/lib/auth-identifier";

const DEMO_OTP = "482774";
const OTP_LENGTH = 6;
const DEMO_FILL_DELAY_MS = 5000;
const EMAIL_OTP_TTL_SECONDS = 5 * 60;

type CancelOrderContext = {
  contact: string;
  contactType: "email" | "phone";
  source: "lookup" | "account";
};

export type CancelOrderButtonProps = {
  cancelContext?: CancelOrderContext;
  onCancelled?: () => void | Promise<void>;
  orderId: number;
  orderCode: string;
};

function maskPhoneNumber(phone: string) {
  const normalized = phone.replace(/\s+/g, "");
  if (normalized.length <= 3) {
    return normalized;
  }

  return `${normalized.slice(0, -3)}xxx`;
}

function maskEmailAddress(email: string) {
  const [localPart = "", domain = ""] = email.trim().split("@");

  if (!localPart || !domain) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? ""}***@${domain}`;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [emailOtpCountdown, setEmailOtpCountdown] = useState(EMAIL_OTP_TTL_SECONDS);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const shouldUseDemoPhoneOtp =
    cancelContext?.source === "lookup" && cancelContext.contactType === "phone";
  const shouldUseEmailOtp =
    cancelContext?.source === "lookup" && cancelContext.contactType === "email";

  async function requestCancelOrder() {
    const response = await fetch(`/api/v1/orders/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact: cancelContext?.contact ?? null,
        order_code: orderCode,
      }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Không thể hủy đơn hàng.");
    }
  }

  async function finishCancellation() {
    await requestCancelOrder();
    setIsConfirmOpen(false);
    setIsOtpOpen(false);
    setOtpValue("");
    await onCancelled?.();
    router.refresh();
  }

  async function handleCancelOrder() {
    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      await finishCancellation();
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
    setInfoMsg(null);
    setOtpValue("");
    setCountdown(5);
    setIsConfirmOpen(false);
    setIsOtpOpen(true);
  }

  async function sendEmailOtp() {
    const identifier = parseAuthIdentifier(cancelContext?.contact ?? "");

    if (!identifier || identifier.type !== "email") {
      setErrorMsg("Email xác thực không hợp lệ.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const response = await fetch("/api/v1/auth/email-otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: identifier.value,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Không thể gửi OTP đến email của bạn.");
      }

      setOtpValue("");
      setEmailOtpCountdown(EMAIL_OTP_TTL_SECONDS);
      setIsConfirmOpen(false);
      setIsOtpOpen(true);
      window.setTimeout(() => otpInputRefs.current[0]?.focus(), 0);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Không thể gửi OTP đến email của bạn.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyEmailOtpAndCancel() {
    const identifier = parseAuthIdentifier(cancelContext?.contact ?? "");

    if (!identifier || identifier.type !== "email") {
      setErrorMsg("Email xác thực không hợp lệ.");
      return;
    }

    if (otpValue.length !== OTP_LENGTH) {
      setErrorMsg("Vui lòng nhập đầy đủ mã OTP gồm 6 số.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const response = await fetch("/api/v1/auth/email-otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: identifier.value,
          token: otpValue,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Không thể xác thực OTP email.");
      }

      await finishCancellation();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Không thể xác thực OTP email.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleConfirm() {
    if (shouldUseDemoPhoneOtp) {
      startDemoOtpFlow();
      return;
    }

    if (shouldUseEmailOtp) {
      void sendEmailOtp();
      return;
    }

    void handleCancelOrder();
  }

  useEffect(() => {
    if (!isOtpOpen || !shouldUseDemoPhoneOtp || isLoading) {
      return;
    }

    const countdownInterval = window.setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    const autoFillTimeout = window.setTimeout(() => {
      setOtpValue(DEMO_OTP);
      window.setTimeout(() => {
        void handleCancelOrder();
      }, 400);
    }, DEMO_FILL_DELAY_MS);

    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(autoFillTimeout);
    };
  }, [isOtpOpen, shouldUseDemoPhoneOtp, isLoading]);

  useEffect(() => {
    if (!isOtpOpen || !shouldUseEmailOtp || isLoading) {
      return;
    }

    const emailCountdownInterval = window.setInterval(() => {
      setEmailOtpCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(emailCountdownInterval);
    };
  }, [isOtpOpen, shouldUseEmailOtp, isLoading]);

  useEffect(() => {
    if (!isOtpOpen || shouldUseDemoPhoneOtp) {
      return;
    }

    window.setTimeout(() => {
      const focusIndex = Math.min(otpValue.length, OTP_LENGTH - 1);
      otpInputRefs.current[focusIndex]?.focus();
    }, 0);
  }, [isOtpOpen, otpValue, shouldUseDemoPhoneOtp]);

  function updateOtpValue(nextValue: string, focusIndex?: number) {
    const normalizedValue = nextValue.replace(/\D/g, "").slice(0, OTP_LENGTH);

    setOtpValue(normalizedValue);
    setErrorMsg(null);

    if (typeof focusIndex === "number") {
      window.setTimeout(() => {
        otpInputRefs.current[focusIndex]?.focus();
      }, 0);
    }
  }

  function handleOtpDigitChange(index: number, rawValue: string) {
    const sanitizedValue = rawValue.replace(/\D/g, "");

    if (!sanitizedValue) {
      updateOtpValue(
        otpValue.slice(0, index) + otpValue.slice(index + 1),
        index,
      );
      return;
    }

    if (sanitizedValue.length > 1) {
      updateOtpValue(sanitizedValue, Math.min(sanitizedValue.length, OTP_LENGTH - 1));
      return;
    }

    const digits = Array.from({ length: OTP_LENGTH }, (_, digitIndex) =>
      otpValue[digitIndex] ?? "",
    );
    digits[index] = sanitizedValue;

    updateOtpValue(digits.join(""), Math.min(index + 1, OTP_LENGTH - 1));
  }

  function handleOtpKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otpValue[index] && index > 0) {
      event.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    updateOtpValue(event.clipboardData.getData("text"), OTP_LENGTH - 1);
  }

  const otpDigits = Array.from(
    { length: OTP_LENGTH },
    (_, index) => otpValue[index] ?? "",
  );
  const otpDestination = shouldUseEmailOtp
    ? maskEmailAddress(cancelContext?.contact ?? "")
    : maskPhoneNumber(cancelContext?.contact ?? "");
  const emailOtpCountdownLabel = formatCountdown(emailOtpCountdown);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsConfirmOpen(true);
          setErrorMsg(null);
          setInfoMsg(null);
        }}
        className="flex min-h-[44px] items-center justify-center rounded-pill border-2 border-[#ff593d] bg-white text-[15px] font-bold text-[#ff593d] transition-colors hover:bg-[#ff593d] hover:text-white"
      >
        Hủy Đơn Hàng
      </button>

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4">
          <div
            className="absolute inset-0"
            onClick={() => {
              if (!isLoading) {
                setIsConfirmOpen(false);
                setInfoMsg(null);
              }
            }}
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
                disabled={isLoading}
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-black/20 px-7 text-sm font-semibold text-foreground transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="inline-flex min-h-[50px] min-w-[156px] items-center justify-center whitespace-nowrap rounded-full bg-black px-8 text-sm font-bold uppercase tracking-[0.03em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isOtpOpen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 px-4">
          <div
            className="absolute inset-0"
            onClick={() => {
              if (!isLoading) {
                setIsOtpOpen(false);
                setInfoMsg(null);
              }
            }}
          />
          <div className="relative z-10 w-full max-w-[780px] overflow-hidden rounded-[28px] bg-white shadow-[0_26px_70px_rgba(0,0,0,0.24)]">
            <div className="h-4 bg-[url('/images/header-line-up.png')] bg-[length:auto_100%] bg-repeat-x" />
            <div className="px-8 py-10 md:px-16 md:py-12">
              <h3 className="text-[34px] font-extrabold leading-none text-black md:text-[48px]">
                Nhập OTP
              </h3>
              <p className="mt-3 text-[18px] font-light text-black/75 md:text-[22px]">
                Nhập mã PIN đã được gửi tới{" "}
                <span className="font-normal text-black">
                  {otpDestination}
                </span>
              </p>

              <div className="mt-10">
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpInputRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={OTP_LENGTH}
                      value={digit}
                      onChange={(event) => {
                        handleOtpDigitChange(index, event.target.value);
                      }}
                      onKeyDown={(event) => {
                        handleOtpKeyDown(index, event);
                      }}
                      onPaste={handleOtpPaste}
                      className="h-[64px] w-[46px] rounded-[8px] border border-black/30 text-center text-[28px] font-semibold text-black outline-none transition-colors focus:border-black md:h-[96px] md:w-[58px] md:text-[40px]"
                      aria-label={`Số OTP ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <p className="mx-auto mt-8 max-w-[640px] text-center text-[15px] font-light leading-7 text-black/72 md:text-[18px]">
                {shouldUseEmailOtp
                  ? "Vui lòng nhập chính xác mã OTP gồm 6 số trong email bạn vừa nhận để hoàn tất xác nhận hủy đơn hàng."
                  : "Quý khách lưu ý: Để bảo đảm an toàn bảo mật, các số trên bàn phím sẽ thay đổi vị trí"}
              </p>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (shouldUseEmailOtp) {
                      void sendEmailOtp();
                      return;
                    }

                    startDemoOtpFlow();
                  }}
                  disabled={isLoading}
                  className="text-[18px] font-bold uppercase underline underline-offset-4 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Gửi lại mã
                </button>
              </div>

              {infoMsg ? (
                <p className="mx-auto mt-4 max-w-[520px] rounded-[14px] border border-[#e7d3c9] bg-[#fff9f4] px-4 py-3 text-center text-sm font-medium text-[#8a5b47]">
                  {infoMsg}
                </p>
              ) : null}

              {shouldUseEmailOtp ? (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void verifyEmailOtpAndCancel()}
                    disabled={isLoading || otpValue.length !== OTP_LENGTH}
                    className="inline-flex min-h-[50px] min-w-[220px] items-center justify-center rounded-full bg-black px-8 text-sm font-bold uppercase tracking-[0.03em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? "Đang xác thực..." : "Xác nhận OTP"}
                  </button>
                </div>
              ) : null}

              <div className="mt-4 text-center text-sm font-medium text-black/60 md:text-base">
                {isLoading
                  ? shouldUseEmailOtp
                    ? "Đang xác thực OTP email và hủy đơn hàng..."
                    : "Đang xác nhận OTP và hủy đơn hàng..."
                  : shouldUseEmailOtp
                    ? (
                        <>
                          <span className="block">Mã OTP có hiệu lực trong vòng 5 phút.</span>
                          <span className="block">Thời gian còn lại: {emailOtpCountdownLabel}.</span>
                        </>
                      )
                    : `OTP demo sẽ tự điền sau ${countdown}s`}
              </div>

              {errorMsg ? (
                <p className="mx-auto mt-6 max-w-[520px] rounded-[14px] border border-[#d76a54]/25 bg-[#fff2ee] px-4 py-3 text-center text-sm font-medium text-[#b14f3d]">
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
