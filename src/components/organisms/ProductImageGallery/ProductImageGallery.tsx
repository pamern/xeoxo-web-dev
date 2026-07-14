"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconButton } from "@/components/atoms/IconButton";
import { cn } from "@/lib/utils";

const VIRTUAL_FITTING_HREF =
  "https://www.figma.com/proto/yvbeM1laV8UcHhxZ4gpKZF/Nh%C3%B3m-3-_-Ph%C3%A1t-tri%E1%BB%83n-Web-Kinh-doanh?node-id=50-4658&viewport=-639%2C-1040%2C0.2&t=4tEOUNEttNRR5c3M-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=26%3A4833&page-id=0%3A1";

export function ProductImageGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [galleryHeight, setGalleryHeight] = useState<number | null>(null);
  const mainImageRef = useRef<HTMLDivElement | null>(null);
  const current = images[activeImage] ?? images[0];

  useEffect(() => {
    function updateHeight() {
      const element = mainImageRef.current;
      if (!element) {
        return;
      }

      setGalleryHeight(element.getBoundingClientRect().height);
    }

    const element = mainImageRef.current;
    if (!element) {
      return;
    }

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(element);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div className="grid gap-3 lg:grid-cols-[65px_minmax(0,650px)]">
      <div
        className="no-scrollbar order-2 flex gap-2.5 overflow-x-auto pb-1 sm:gap-3 lg:order-1 lg:self-start lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0"
        style={galleryHeight ? { maxHeight: `${galleryHeight}px` } : undefined}
      >
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(index)}
            aria-label={`Anh san pham ${index + 1}`}
            className={cn(
              "relative h-[88px] w-[60px] shrink-0 overflow-hidden border bg-secondary transition-colors sm:h-[98px] sm:w-[65px]",
              index === activeImage ? "border-primary" : "border-transparent hover:border-primary/60"
            )}
          >
            <Image src={image} alt="" fill sizes="(max-width: 640px) 60px, 65px" className="object-cover" />
          </button>
        ))}
      </div>

      <div
        ref={mainImageRef}
        className="relative order-1 mx-auto aspect-[5/7] w-full max-w-[360px] overflow-hidden bg-secondary sm:max-w-[430px] sm:aspect-[2/3] md:max-w-[520px] lg:order-2 lg:max-w-[650px]"
      >
        <Link
          href={VIRTUAL_FITTING_HREF}
          className="group absolute right-3 top-3 z-10 flex items-start gap-0 text-white transition-opacity hover:opacity-90 sm:right-4 sm:top-4"
        >
          <span className="relative mt-1 h-[50px] w-[50px] shrink-0 translate-x-[6px] sm:h-[58px] sm:w-[58px] sm:translate-x-[8px]">
            <Image
              src="/images/ai-icon.png"
              alt=""
              fill
              sizes="(max-width: 640px) 50px, 58px"
              className="object-contain"
              aria-hidden
            />
          </span>
          <span className="flex flex-col items-end pt-0.5">
            <span className="rounded-[8px] bg-black px-2.5 py-1 text-[9px] font-medium leading-none shadow-[0_6px_14px_rgba(0,0,0,0.18)] sm:text-[10px]">
              Only at Xéo Xọ
            </span>
            <span className="mt-1 whitespace-nowrap px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white transition-all duration-200 group-hover:text-white [text-shadow:0px_4px_12px_rgba(0,0,0,0.35)] group-hover:[text-shadow:0px_0px_14px_rgba(241,90,66,0.68),0px_0px_34px_rgba(241,90,66,0.48),0px_0px_52px_rgba(241,90,66,0.24),0px_4px_12px_rgba(0,0,0,0.35)] sm:text-[14px]">
              Phòng thử đồ ảo
            </span>
          </span>
        </Link>
        {current && (
          <Image
            src={current}
            alt={alt}
            fill
            priority
            sizes="(max-width: 640px) 360px, (max-width: 768px) 430px, (max-width: 1024px) 520px, 600px"
            className="object-cover"
          />
        )}
        <IconButton
          type="button"
          aria-label="Anh truoc"
          onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
          iconSrc="/icons/arrow-right.svg"
          iconSize={16}
          iconClassName="rotate-180"
          variant="circleLight"
          className="absolute bottom-4 right-16 sm:bottom-[30px] sm:right-[90px]"
        />
        <IconButton
          type="button"
          aria-label="Anh tiep theo"
          onClick={() => setActiveImage((activeImage + 1) % images.length)}
          iconSrc="/icons/arrow-right.svg"
          iconSize={16}
          variant="circleLight"
          className="absolute bottom-4 right-4 sm:bottom-[30px] sm:right-[30px]"
        />
      </div>
    </div>
  );
}
