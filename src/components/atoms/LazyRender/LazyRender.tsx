"use client";

import { useEffect, useRef, useState } from "react";

export function LazyRender({
  children,
  fallback,
  rootMargin = "240px 0px",
  triggerOnce = true,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  triggerOnce?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (!element || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setIsVisible(true);

        if (triggerOnce) {
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin, triggerOnce]);

  return <div ref={containerRef}>{isVisible ? children : fallback ?? null}</div>;
}
