"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { collectionRoute } from "@/constants/routes";
import type { Collection } from "@/types/product.types";

// Hero carousel trang chủ: ảnh bộ sưu tập + tên + CTA, nút prev/next.
export function HeroCarousel({ slides }: { slides: Collection[] }) {
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const current = slides[index];

  const go = (delta: number) => setIndex((i) => (i + delta + total) % total);

  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
      {slides.map((slide, i) => (
        <Image
          key={slide.slug}
          src={slide.coverImage}
          alt={slide.name}
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      <div className="absolute inset-0 bg-black/30" aria-hidden />

      <div className="relative mx-auto flex h-full max-w-site flex-col justify-end gap-4 px-6 pb-16 xl:px-[100px]">
        <p className="text-shadow text-2xl font-medium text-white md:text-4xl">{current.subtitle}</p>
        <h1 className="text-shadow text-5xl font-extrabold uppercase text-white md:text-7xl">
          {current.name}
        </h1>
        <Link
          href={collectionRoute(current.slug)}
          className="inline-flex w-fit items-center rounded-pill border border-white px-8 py-4 text-xl font-medium text-white text-shadow transition-colors hover:bg-white hover:text-black hover:[text-shadow:none]"
        >
          Khám phá
        </Link>
      </div>

      <CarouselButton direction="prev" onClick={() => go(-1)} />
      <CarouselButton direction="next" onClick={() => go(1)} />

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.slug}
            type="button"
            aria-label={`Tới slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 rounded-full bg-white transition-all",
              i === index ? "w-8" : "w-2 opacity-60"
            )}
          />
        ))}
      </div>
    </section>
  );
}

function CarouselButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Slide trước" : "Slide sau"}
      className={cn(
        "absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-2xl text-white transition-colors hover:bg-black/50",
        direction === "prev" ? "left-4 xl:left-10" : "right-4 xl:right-10"
      )}
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}
