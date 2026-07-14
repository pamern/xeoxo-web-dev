"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function CollectionHeroMedia({
  imageSrc,
  imageAlt,
  videoSrc,
}: {
  imageSrc: string;
  imageAlt: string;
  videoSrc?: string;
}) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shouldRenderVideo = Boolean(videoSrc) && !hasVideoError;

  useEffect(() => {
    setIsVideoReady(false);
    setHasVideoError(false);
  }, [videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) {
      return;
    }

    console.info("[collection-hero-video] trying", videoSrc);
    video.load();

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Silent: poster/cover image remains visible if autoplay is delayed.
      });
    }

    if (video.readyState >= 2) {
      console.info("[collection-hero-video] playing", videoSrc);
      setIsVideoReady(true);
      return;
    }

    const handleReady = () => {
      console.info("[collection-hero-video] playing", videoSrc);
      setIsVideoReady(true);
    };
    const handleError = () => {
      console.warn("[collection-hero-video] failed", videoSrc);
      setIsVideoReady(false);
      setHasVideoError(true);
      console.warn("[collection-hero-video] fallback-image", videoSrc);
    };

    video.addEventListener("loadeddata", handleReady);
    video.addEventListener("canplay", handleReady);
    video.addEventListener("canplaythrough", handleReady);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadeddata", handleReady);
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("canplaythrough", handleReady);
      video.removeEventListener("error", handleError);
    };
  }, [videoSrc]);

  return (
    <>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 1728px"
        className="object-cover object-top"
      />

      {shouldRenderVideo ? (
        <video
          key={videoSrc}
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={imageSrc}
          className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500 ${
            isVideoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}
