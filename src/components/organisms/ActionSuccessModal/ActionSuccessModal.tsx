"use client";

import { useEffect, type MouseEvent, type ReactNode } from "react";
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

export function ActionSuccessModal({
  title,
  eyebrow = "Xéo Xọ xác nhận",
  message,
  codeLabel,
  codeValue,
  primaryLabel = "Tiếp tục mua sắm",
  primaryHref = "/",
  primaryAction,
  secondaryLabel = "Đóng",
  secondaryHref,
  secondaryAction,
  onClose,
  icon,
}: ActionSuccessModalProps) {
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

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
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
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-[26px] bg-white shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
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

        <div className="px-6 pb-8 pt-7 text-center sm:px-10 sm:pb-10 sm:pt-9">
          <div className="mx-auto flex w-full max-w-[420px] flex-col items-center">
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
              <div className="mt-6 w-full rounded-[20px] border border-black/10 bg-[#f9f6f1] px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/45">
                  {codeLabel}
                </p>
                <p className="mt-2 break-all text-[22px] font-bold tracking-[0.08em] text-black sm:text-[26px]">
                  {codeValue}
                </p>
              </div>
            ) : null}

            <div className="mt-7 flex w-full flex-col gap-3">
              <Button
                href={primaryHref}
                onClick={primaryAction}
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
