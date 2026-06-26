import Image from "next/image";

// Dải "STARS in Xéo Xọ" — ảnh nền + tiêu đề, lặp lại ở nhiều trang.
export function StarsBanner() {
  return (
    <section className="relative mb-28 flex h-[420px] items-start justify-center overflow-hidden md:h-[560px]">
      <Image src="/banners/stars.png" alt="" fill sizes="100vw" className="object-cover" />
      <h2 className="text-shadow relative mt-16 text-3xl font-extrabold text-white md:text-4xl">
        STARS in Xéo Xọ
      </h2>
    </section>
  );
}
