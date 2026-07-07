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
  const genderLabel = isMale ? "nam" : "nữ";

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Bảng kích thước ${genderLabel}`}
        className="relative flex max-h-[92dvh] w-fit max-w-[95vw] items-center justify-center overflow-hidden rounded-[16px] bg-white p-2 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-3"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng bảng kích thước"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 transition hover:bg-black/5 sm:right-5 sm:top-5"
        >
          <Image
            src="/icons/close-black.svg"
            alt=""
            width={44}
            height={44}
            aria-hidden
          />
        </button>

        <Image
          src={imageSrc}
          alt={`Bảng hướng dẫn kích thước sản phẩm ${genderLabel}`}
          width={746}
          height={975}
          className="h-auto max-h-[calc(92dvh-1rem)] w-auto max-w-full object-contain sm:max-h-[calc(92dvh-1.5rem)]"
          priority
        />
      </div>
    </div>
  );
}
