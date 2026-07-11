"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { Collection } from "@/types/product.types";

// Hero carousel trang chủ: ảnh bộ sưu tập + tên + CTA, nút prev/next.
export function HeroCarousel({ slides }: { slides: Collection[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = slides.length;
  const current = slides[index];
  const renderedIndexes = slides.reduce<number[]>((acc, _slide, slideIndex) => {
    if (
      total <= 2 ||
      slideIndex === index ||
      slideIndex === (index - 1 + total) % total ||
      slideIndex === (index + 1) % total
    ) {
      acc.push(slideIndex);
    }

    return acc;
  }, []);

  const go = (delta: number) => {
    setDirection(delta > 0 ? 1 : -1);
    setIndex((i) => (i + delta + total) % total);
  };

  const goTo = (target: number) => {
    setDirection(target > index ? 1 : -1);
    setIndex(target);
  };

  const isPausedRef = useRef(false);

  useEffect(() => {
    if (total <= 1) return;

    const timer = setInterval(() => {
      if (!isPausedRef.current) {
        go(1);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [index, total]);

  return (
    <section
      className="relative h-[62vh] min-h-[420px] w-full overflow-hidden md:h-[68vh] md:min-h-[480px] xl:h-[70vh]"
      onMouseEnter={() => (isPausedRef.current = true)}
      onMouseLeave={() => (isPausedRef.current = false)}
    >
      {renderedIndexes.map((i) => {
        const slide = slides[i];

        return (
        <Image
          key={slide.slug}
          src={slide.coverImage}
          alt={slide.name}
          fill
          priority={i === 0}
          fetchPriority={i === 0 ? "high" : undefined}
          sizes="100vw"
          className={cn(
            "object-cover transition-[opacity,transform] duration-500 ease-out",
            i === index
              ? "translate-x-0 scale-100 opacity-100"
              : cn(
                  "opacity-0",
                  direction === 1 ? "translate-x-6 scale-105" : "-translate-x-6 scale-105"
                )
          )}
        />
        );
      })}
      <div className="absolute inset-0 bg-black/30" aria-hidden />

      <div className="relative mx-auto flex h-full w-full max-w-site flex-col justify-end gap-3 px-5 pb-12 md:px-8 md:pb-14 xl:px-10 2xl:px-20">
        <p className="text-shadow text-2xl font-medium text-white">{current.subtitle}</p>
        <h1 className="text-shadow text-5xl font-extrabold uppercase text-white">
          {current.name}
        </h1>
        <Link
          href={ROUTES.COLLECTION(current.slug)}
          className="inline-flex w-fit items-center rounded-pill border border-white px-8 py-4 text-xl font-medium text-white text-shadow transition-colors hover:bg-white hover:text-black hover:[text-shadow:none]"
        >
          Khám phá
        </Link>
      </div>

      <CarouselButton direction="prev" onClick={() => go(-1)} />
      <CarouselButton direction="next" onClick={() => go(1)} />

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-6">
        {slides.map((slide, i) => (
          <button
            key={slide.slug}
            type="button"
            aria-label={`Tới slide ${i + 1}`}
            onClick={() => goTo(i)}
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
