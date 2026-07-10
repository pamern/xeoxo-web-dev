"use client";

import {
  useEffect,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

type ActionSuccessModalProps = {
  title: string;
  eyebrow?: string;
  message: string;
  codeLabel?: string;
  codeValue?: string | number | null;
  primaryLabel?: string;
  primaryHref?: string;
  primaryAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  secondaryAction?: () => void;
  onClose: () => void;
  icon?: ReactNode;
};

function DefaultSuccessIcon() {
  return (
    <span className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full border-[6px] border-[#f15a42] bg-[#fff4ee]">
      <span className="absolute inset-[10px] rounded-full border border-[#f15a42]/25" />
      <span
        aria-hidden
        className="relative h-8 w-5 -rotate-[2deg] border-b-[6px] border-r-[6px] border-[#f15a42]"
      />
    </span>
  );
}

function CopyIcon() {
  return (
    <span aria-hidden className="relative block h-4 w-4">
      <span className="absolute right-0 top-0 h-3 w-3 rounded-[2px] border-2 border-current bg-transparent" />
      <span className="absolute bottom-0 left-0 h-3 w-3 rounded-[2px] border-2 border-current bg-transparent" />
    </span>
  );
}

export function ActionSuccessModal({
  title,
  eyebrow = "Xéo Xọ xác nhận",
  message,
  codeLabel,
  codeValue,
  primaryLabel = "Tiếp tục mua sắm",
  primaryHref,
  primaryAction,
  secondaryLabel = "Đóng",
  secondaryHref,
  secondaryAction,
  onClose,
  icon,
}: ActionSuccessModalProps) {
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (!isCodeCopied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsCodeCopied(false);
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isCodeCopied]);

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  async function handleCopyCode() {
    if (!codeValue) {
      return;
    }

    const codeText = String(codeValue);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(codeText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = codeText;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setIsCodeCopied(true);
    } catch {
      setIsCodeCopied(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
    >
      <div className="relative w-full max-w-[760px] overflow-hidden rounded-[26px] bg-white shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
        <div
          className="h-4 w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/images/strip-cart-section.png')" }}
          aria-hidden
        />

        <button
          type="button"
          aria-label="Đóng"
          onClick={onClose}
          className="absolute right-4 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 transition hover:bg-black/5"
        >
          <Image src="/icons/close-black.svg" alt="" width={44} height={44} aria-hidden />
        </button>

        <div className="px-5 pb-8 pt-7 text-center sm:px-8 sm:pb-10 sm:pt-9 md:px-10">
          <div className="mx-auto flex w-full max-w-[620px] flex-col items-center">
            {icon ?? <DefaultSuccessIcon />}

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-[#f15a42]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-[28px] font-bold leading-tight text-black sm:text-[34px]">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-black/65 sm:text-base">
              {message}
            </p>

            {codeLabel && codeValue ? (
              <div className="relative mt-6 w-full rounded-[20px] border border-black/10 bg-[#f9f6f1] px-5 py-4 text-center">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  aria-label="Sao chép mã đơn hàng"
                  className="absolute right-3 top-3 inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-[11px] font-bold text-black/65 transition-colors hover:bg-black hover:text-white"
                >
                  <CopyIcon />
                </button>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/45">
                  {codeLabel}
                </p>
                <p className="mt-2 whitespace-nowrap pr-12 text-[18px] font-bold tracking-[0.04em] text-black sm:text-[22px] md:text-[26px]">
                  {codeValue}
                </p>
                {isCodeCopied ? (
                  <p className="mt-2 text-xs font-semibold text-black/45">
                    Đã sao chép mã đơn hàng.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-7 flex w-full flex-col gap-3">
              <Button
                href={primaryHref}
                onClick={
                  primaryHref
                    ? primaryAction
                    : () => {
                        primaryAction?.();
                      }
                }
                variant="floralPill"
                size="md"
                backgroundImage="/images/bg-gia-nhap-btn.png"
                className="h-12 w-full border-0 text-base font-bold text-white"
              >
                {primaryLabel}
              </Button>

              {secondaryLabel ? (
                <Button
                  href={secondaryHref ?? "#"}
                  onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                    if (!secondaryHref) {
                      event.preventDefault();
                    }
                    secondaryAction?.();
                  }}
                  variant="secondaryPill"
                  size="md"
                  className={cn(
                    "h-12 w-full border-black text-base font-bold text-black hover:bg-black hover:text-white",
                    !secondaryHref && "cursor-pointer",
                  )}
                >
                  {secondaryLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
