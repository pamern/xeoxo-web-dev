import Image from "next/image";

const STARS_DATA = [
  {
    id: 1,
    image: "/images/stars/1.png",
    text: "Chị Khazsak tại chuỗi sự kiện Liên hoan phim Châu Á Đà Nẵng lần thứ tư, 2026.",
    link: "https://www.facebook.com/share/p/1BQGVHHwfe/",
  },
  {
    id: 2,
    image: "/images/stars/2.png",
    text: "Chị Trâm Anh tại sự kiện Họp báo công bố phim 'Hoàng Hậu Cuối Cùng'.",
    link: "https://www.facebook.com/share/p/1BMAX5SMqR/",
  },
  {
    id: 3,
    image: "/images/stars/3.png",
    text: "Chị Đinh Ngọc Diệp đã yêu mến và dành tình cảm đến thiết kế Thanh Tiêu của XÉO XỌ.",
    link: "https://www.facebook.com/share/18YcqHiiy9/",
  },
  {
    id: 4,
    image: "/images/stars/4.png",
    text: "Chị Thảo Trinh và anh Tùng Lâm đã yêu mến và dành tình cảm đến thiết kế của XÉO XỌ và ĐỊNH.",
    link: "https://www.facebook.com/share/p/1EKRaGU5hE/",
  },
  {
    id: 5,
    image: "/images/stars/5.png",
    text: "Chị Laura và chú rể Daniel đã yêu mến và dành tình cảm đến thiết kế Dao Châu cùng Sắc Kỳ của XÉO XỌ và ĐỊNH.",
    link: "https://www.facebook.com/share/p/14fN84gLDJr/",
  },
  {
    id: 6,
    image: "/images/stars/6.png",
    text: "Anh đạo diễn Nguyễn Thiện An, biên kịch Ly Nguyễn cùng toàn thể ekip phim 'Giấc Mơ Làm Ốc Sên'.",
    link: "https://www.facebook.com/share/p/1EUD8Fswyx/",
  },
];

export function StarsBanner() {
  return (
    <section
      className="relative overflow-hidden bg-cover bg-center py-8 md:py-10"
      style={{ backgroundImage: "url(/images/stars-background.png)" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes starsMarqueeLeft {
              from {
                transform: translateX(0);
              }
              to {
                transform: translateX(calc(-50% - 12px));
              }
            }

            .stars-marquee-track {
              animation: starsMarqueeLeft 42s linear infinite;
            }

            .stars-marquee:hover .stars-marquee-track,
            .stars-marquee:focus-within .stars-marquee-track {
              animation-play-state: paused;
            }

            @media (prefers-reduced-motion: reduce) {
              .stars-marquee-track {
                animation: none;
              }
            }
          `,
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-site flex-col gap-6 px-4 sm:px-6 md:gap-8 xl:px-10 2xl:px-20">
        <div className="mx-auto w-full max-w-site text-center">
          <h2 className="text-2xl font-extrabold uppercase leading-none text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.55)] md:text-4xl">
            Stars in XÉO XỌ
          </h2>
        </div>

        <div className="stars-marquee overflow-hidden">
          <div className="stars-marquee-track flex w-max gap-5 md:gap-6">
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                className="flex gap-5 md:gap-6"
                aria-hidden={groupIndex === 1}
              >
                {STARS_DATA.map((star) => (
                  <article
                    key={`${groupIndex}-${star.id}`}
                    className="group relative h-[360px] w-[248px] overflow-hidden bg-black shadow-[0_14px_34px_rgba(0,0,0,0.20)] sm:h-[390px] sm:w-[272px] md:h-[420px] md:w-[300px]"
                  >
                    <Image
                      src={star.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 248px, (max-width: 768px) 272px, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_24%,rgba(0,0,0,0.18)_48%,rgba(0,0,0,0.82)_100%)]" />

                    <div className="absolute inset-x-0 bottom-0 z-[1] flex flex-col gap-3 p-4 text-white sm:p-5 md:p-6">
                      <p className="text-sm font-light leading-6 text-white/92 md:text-[0.9375rem]">
                        {star.text}
                      </p>
                      <a
                        href={star.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={groupIndex === 1 ? -1 : undefined}
                        className="inline-flex min-h-[42px] w-fit items-center justify-center rounded-full border border-white/85 bg-white/8 px-5 text-sm font-semibold text-white backdrop-blur-[8px] transition-colors hover:bg-white hover:text-black"
                      >
                        Khám phá
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
