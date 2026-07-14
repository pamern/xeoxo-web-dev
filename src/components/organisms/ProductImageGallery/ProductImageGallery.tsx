"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IconButton } from "@/components/atoms/IconButton";
import { cn } from "@/lib/utils";

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
