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
    text: "Chị Đinh Ngọc Diệp đã yêu mến và dành tình cảm đến thiết kế Thanh Tiêu của XÉO XỌ",
    link: "https://www.facebook.com/share/18YcqHiiy9/",
  },
  {
    id: 4,
    image: "/images/stars/4.png",
    text: "Chị Thảo Trinh và anh Tùng Lâm đã yêu mến và dành tình cảm đến thiết kế của XÉO XỌ và ĐỊNH",
    link: "https://www.facebook.com/share/p/1EKRaGU5hE/",
  },
  {
    id: 5,
    image: "/images/stars/5.png",
    text: "Chị Laura và chú rể Daniel đã yêu mến và dành tình cảm đến thiết kế Dao Châu cùng Sắc Kỳ của XÉO XỌ và ĐỊNH",
    link: "https://www.facebook.com/share/p/14fN84gLDJr/",
  },
  {
    id: 6,
    image: "/images/stars/6.png",
    text: "Anh Đạo diễn Nguyễn Thiện An, Biên kịch Ly Nguyễn cùng toàn thể ekip phim 'Giấc Mơ Làm Ốc Sên'",
    link: "https://www.facebook.com/share/p/1EUD8Fswyx/",
  },
];

export function StarsBanner() {
  return (
    <section
      className="relative w-full overflow-hidden bg-cover bg-center py-10 md:py-14"
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

      <div className="pointer-events-none absolute inset-0 bg-black/10" />

      <div className="relative z-10 mx-auto w-full max-w-site px-6 xl:px-[100px]">
        <h2 className="mb-8 text-center text-[28px] font-extrabold uppercase tracking-widest text-white [text-shadow:0_4px_8px_rgba(0,0,0,0.5)] md:text-[36px]">
          STARS in XÉO XỌ
        </h2>

        <div className="stars-marquee overflow-hidden pb-2">
          <div className="stars-marquee-track flex w-max gap-6">
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                className="flex gap-6"
                aria-hidden={groupIndex === 1}
              >
                {STARS_DATA.map((star) => (
                  <div
                    key={`${groupIndex}-${star.id}`}
                    className="group relative aspect-[3/4] w-[280px] shrink-0 overflow-hidden border border-black/20 bg-black/10 shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    <Image
                      src={star.image}
                      alt=""
                      fill
                      sizes="280px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute bottom-0 inset-x-0 flex min-h-[180px] flex-col justify-end bg-gradient-to-t from-black via-black/85 to-transparent p-4 pt-12">
                      <p className="mb-3 min-h-[72px] line-clamp-4 text-[13px] font-light leading-relaxed text-white/90">
                        {star.text}
                      </p>
                      <a
                        href={star.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={groupIndex === 1 ? -1 : undefined}
                        className="flex h-[38px] w-full items-center justify-center rounded-full border border-white bg-transparent text-center text-[13px] font-bold uppercase tracking-wider text-white transition-colors duration-200 hover:bg-white hover:text-black"
                      >
                        Khám phá
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
