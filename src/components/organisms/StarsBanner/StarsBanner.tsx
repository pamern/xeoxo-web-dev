import Image from "next/image";

// Dải "STARS in Xéo Xọ" — ảnh nền + tiêu đề, lặp lại ở nhiều trang.
export function StarsBanner() {
  return (
    <section className="relative mb-28 flex h-[clamp(440px,382.86px+17.86vw,640px)] items-start justify-center overflow-hidden">
      <Image src="/images/stars-background.png" alt="" fill sizes="100vw" className="object-cover" />
      <h2 className="text-shadow relative mt-16 text-display-section font-extrabold text-white">
        STARS in Xéo Xọ
      </h2>
    </section>
  );
}
