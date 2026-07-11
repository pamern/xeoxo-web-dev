"use client";

import Image from "next/image";
import { useEffect, type MouseEvent } from "react";
import { AuthExperience } from "@/components/organisms/AuthExperience";

type AuthMode = "login" | "register";

export function AuthModal({
  mode,
  onClose,
  onModeChange,
}: {
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}) {
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
      aria-label={mode === "login" ? "Đăng nhập" : "Đăng ký"}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[200] overflow-y-auto bg-black/45 px-3 py-4 backdrop-blur-md sm:px-5 sm:py-6"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[820px] items-start justify-center">
        <div className="relative w-full px-4 pt-7 sm:px-6 sm:pt-9">
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="absolute right-7 top-10 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white transition hover:bg-black/5 sm:right-9 sm:top-12"
          >
            <Image
              src="/icons/close-black.svg"
              alt=""
              width={36}
              height={36}
              aria-hidden
            />
          </button>

          <AuthExperience
            mode={mode}
            onModeChange={onModeChange}
            onAuthSuccess={onClose}
            className="mx-auto max-w-[780px]"
          />
        </div>
      </div>
    </div>
  );
}
