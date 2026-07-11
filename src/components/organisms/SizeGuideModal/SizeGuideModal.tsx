"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { Gender } from "@/types/product.types";

type SizeGuideModalProps = {
  gender: Gender;
  onClose: () => void;
};

export function SizeGuideModal({ gender, onClose }: SizeGuideModalProps) {
  const isMale = gender === "nam";
  const imageSrc = isMale
    ? "/images/size_guide_male.png"
    : "/images/size_guide_female.png";
  const genderLabel = isMale ? "nam" : "nu";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/40 px-3 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-md sm:px-4 sm:pb-4 sm:pt-4 md:pt-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Bang kich thuoc ${genderLabel}`}
        className="relative mx-auto flex max-h-[calc(100dvh-24px)] w-full max-w-[510px] shrink-0 flex-col overflow-hidden rounded-[20px] bg-white px-4 pb-0 pt-4 shadow-[0_18px_54px_rgba(0,0,0,0.28)] sm:max-h-[calc(100dvh-32px)] sm:px-5 sm:pt-5 md:max-h-[calc(100dvh-48px)] md:pt-5"
      >
        <button
          type="button"
          aria-label="Dong bang kich thuoc"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white transition hover:bg-black/5 sm:right-4 sm:top-4"
        >
          <Image src="/icons/close-black.svg" alt="" width={36} height={36} aria-hidden />
        </button>

        <header className="pb-3 text-center sm:pb-4">
          <h1 className="text-lg font-bold uppercase leading-none text-black sm:text-xl">
            Hướng dẫn cách đo
          </h1>
          <div className="mx-auto mt-2 h-[5px] w-[min(100%,300px)] overflow-hidden bg-[url('/images/bg-gia-nhap-btn.png')] bg-cover bg-center" />
        </header>

        <div className="relative mx-auto flex min-h-0 w-full max-w-[540px] flex-1 flex-col overflow-hidden bg-white px-5 pb-5 pt-5">
          <div className="min-h-0 overflow-auto bg-white p-5">
            <Image
              src={imageSrc}
              alt={`Bang huong dan kich thuoc san pham ${genderLabel}`}
              width={746}
              height={975}
              className="mx-auto h-auto w-full max-w-[400px] object-contain"
              priority
            />
          </div>

        </div>
      </section>
    </div>
  );
}
