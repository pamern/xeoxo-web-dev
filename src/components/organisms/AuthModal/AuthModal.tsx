"use client";

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
      className="fixed inset-0 z-[80] overflow-y-auto bg-black/45 px-4 py-5 sm:px-6 sm:py-8"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[1100px] items-start justify-center">
        <div className="relative w-full px-5 pt-10 sm:px-9 sm:pt-12">
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="absolute right-0 top-0 z-10 flex h-[56px] w-[56px] translate-x-[-30%] translate-y-[30%] items-center justify-center rounded-full border-[5px] border-white bg-black shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-transform hover:scale-[1.03] sm:h-[70px] sm:w-[70px]"
          >
            <span aria-hidden className="relative h-6 w-6 sm:h-7 sm:w-7">
              <span className="absolute left-1/2 top-1/2 h-1 w-full -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-white" />
              <span className="absolute left-1/2 top-1/2 h-1 w-full -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-white" />
            </span>
          </button>

          <AuthExperience
            mode={mode}
            onModeChange={onModeChange}
            onAuthSuccess={onClose}
            className="mx-auto max-w-[1068px]"
          />
        </div>
      </div>
    </div>
  );
}
