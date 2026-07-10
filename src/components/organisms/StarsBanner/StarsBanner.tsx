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
      className="stars-shell"
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

      <div className="site-container relative z-10">
        <h2 className="stars-title">
          STARS in XÉO XỌ
        </h2>

        <div className="stars-marquee overflow-hidden pb-2">
          <div className="stars-marquee-track flex w-max gap-4">
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                className="flex gap-4"
                aria-hidden={groupIndex === 1}
              >
                {STARS_DATA.map((star) => (
                  <div
                    key={`${groupIndex}-${star.id}`}
                    className="group stars-card"
                  >
                    <Image
                      src={star.image}
                      alt=""
                      fill
                      sizes="400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="stars-card-overlay">
                      <p className="stars-card-copy">
                        {star.text}
                      </p>
                      <a
                        href={star.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={groupIndex === 1 ? -1 : undefined}
                        className="stars-card-cta"
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
