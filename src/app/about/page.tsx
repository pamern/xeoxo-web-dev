import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthModalLink } from "@/components/atoms/AuthModalLink";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Về XÉO XỌ",
  description:
    "Câu chuyện thương hiệu XÉO XỌ, những nguyên tắc sáng tạo và hành trình phía sau mỗi thiết kế.",
};

const PRINCIPLES = [
  {
    number: "01",
    title: "KHÔNG CHẠY\nTHEO TRÀO LƯU",
    description:
      "Chúng mình tin vào giá trị của thời gian và sự bền vững thay vì chạy theo xu hướng nhất thời.",
  },
  {
    number: "02",
    title: "CHẤT LIỆU LÀ\nQUAN TRỌNG",
    description:
      "Linen, lụa, tơ... những sợi tự nhiên luôn là linh hồn trong mỗi thiết kế của Xéo Xọ.",
  },
  {
    number: "03",
    title: "TINH THẦN\nÁ ĐÔNG",
    description:
      "Làm mới những giá trị truyền thống để phù hợp với người phụ nữ hiện đại.",
  },
  {
    number: "04",
    title: "KHÔNG\nBỎ CUỘC",
    description:
      "Từ hai người tay ngang, Xéo Xọ lớn lên nhờ sự kiên trì và tình yêu mãnh liệt với cái đẹp.",
  },
];

const PROCESS = [
  {
    image: "/images/process-1.jpg",
    title: "Tìm cảm hứng",
    description: "Quan sát nhịp sống, nghiên cứu di sản và các chất liệu tự nhiên.",
  },
  {
    image: "/images/story-2.jpg",
    title: "Phác thảo",
    description: "Những nét đầu tiên hiện thực hoá cảm xúc thành hình dáng.",
  },
  {
    image: "/images/story-1.jpg",
    title: "May mẫu",
    description: "Chỉnh sửa từng cm để đạt được độ rơi và phom dáng hoàn hảo nhất.",
  },
  {
    image: "/images/process-4.jpg",
    title: "Hoàn thiện",
    description: "Kiểm tra tỉ mỉ trước khi đóng gói gửi tới bạn.",
  },
];

const STORY_THUMBNAILS = [
  "/images/story-1.jpg",
  "/images/story-2.jpg",
  "/images/story-3.jpg",
];

function PatternSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="w-full py-0"
      style={{ backgroundImage: "url('/images/story-section-background.png')" }}
    >
      <div className="mx-auto max-w-site px-5 py-7 sm:px-6 sm:py-9 md:px-8 xl:px-10 2xl:px-20">
        <h2 className="text-center text-[1.55rem] font-black uppercase leading-[1] tracking-[-0.02em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.18)] sm:text-[2rem] lg:text-[2.35rem]">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <SiteLayout>
      <section className="bg-background pt-0">
        <div className="relative min-h-[320px] overflow-hidden bg-black sm:min-h-[420px] lg:min-h-[520px]">
            <Image
              src="/images/hero.png"
              alt="XÉO XỌ"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.56)_100%)]" />
            <div className="relative z-[1] mx-auto flex min-h-[320px] w-full max-w-site flex-col items-center justify-center px-5 text-center sm:min-h-[420px] sm:px-6 md:px-8 lg:min-h-[520px] xl:px-10 2xl:px-20">
              <h1 className="text-[2.65rem] font-black uppercase leading-[0.94] tracking-[-0.03em] text-white drop-shadow-[0_5px_14px_rgba(0,0,0,0.38)] sm:text-[4rem] lg:text-[4.9rem]">
                XÉO XỌ
              </h1>
              <p className="mt-2 max-w-[440px] text-[0.84rem] font-light leading-5 text-white sm:text-[0.92rem] sm:leading-6 lg:text-[0.96rem]">
                Lưu giữ vẻ đẹp Á Đông trong từng thiết kế
              </p>
              <Link
                href={ROUTES.COLLECTIONS}
                className="group mt-5 inline-flex min-h-[44px] w-fit items-center justify-center rounded-pill border border-white/90 bg-black/10 px-6 text-[0.95rem] font-medium text-white text-shadow shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition-colors hover:bg-white hover:text-black hover:[text-shadow:none] sm:min-h-[48px] sm:px-7 sm:text-base lg:min-h-[52px] lg:px-8 lg:text-lg"
              >
                Khám phá bộ sưu tập
                <span className="ml-2 text-[1.1rem] leading-none transition-transform group-hover:translate-x-1 sm:text-[1.25rem] lg:text-[1.5rem]">
                  →
                </span>
              </Link>
            </div>
        </div>
      </section>

      <section className="bg-white px-5 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12 md:px-8 xl:px-10 2xl:px-20">
        <div className="mx-auto max-w-site text-center">
          <h2 className="mx-auto max-w-[980px] text-[1.15rem] font-black leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[1.55rem] lg:text-[1.85rem]">
            <span className="block whitespace-normal sm:whitespace-nowrap">
              “Chúng tôi chỉ đơn giản muốn làm ra
            </span>
            <span className="block whitespace-normal sm:whitespace-nowrap">
              những bộ quần áo đẹp để mặc”
            </span>
          </h2>
          <div className="mx-auto mt-5 max-w-[880px] space-y-2 text-[0.9rem] font-light leading-7 text-foreground/80 sm:text-[1rem]">
            <p>
              Nhiều người hỏi “XÉO XỌ” có nghĩa là gì. Thật ra, nó không mang một ý nghĩa cụ thể
              nào cả.
            </p>
            <p>
              Chúng tôi thích việc mỗi người sẽ tự giữ cho mình một cách hiểu riêng về XÉO XỌ -
              giống như quần áo đôi khi cũng trở thành một phần rất riêng trong cuộc sống của mỗi
              người.
            </p>
          </div>
        </div>
      </section>

      <PatternSection title="CÂU CHUYỆN XÉO XỌ">
        <div className="mx-auto mt-6 grid max-w-[1180px] gap-6 lg:grid-cols-[1fr_0.96fr] lg:items-start lg:gap-8">
          <div className="w-full">
            <div className="relative aspect-[1.76/1] overflow-hidden rounded-[12px] bg-white/10">
              <Image
                src="/images/story-main.jpg"
                alt="Câu chuyện Xéo Xọ"
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
              {STORY_THUMBNAILS.map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-[12px]">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 30vw, 16vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(96,28,14,0.08)] sm:px-7 sm:py-6 lg:min-h-[376px]">
            <h3 className="max-w-[420px] text-[1.18rem] font-black leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[1.45rem] lg:text-[1.7rem]">
              <span className="block whitespace-normal sm:whitespace-nowrap">Mọi thứ bắt đầu từ</span>
              <span className="block whitespace-normal sm:whitespace-nowrap">
                một căn phòng nhỏ ...
              </span>
            </h3>
            <div className="mt-4 max-w-[520px] space-y-4 text-[0.92rem] font-light leading-7 text-foreground/82 sm:text-[0.98rem]">
              <p>
                Được thành lập bởi Hương và Hằng, XÉO XỌ bắt đầu từ tình yêu với chất liệu tự
                nhiên và niềm yêu thích dành cho những thiết kế mềm mại và gần gũi với đời sống
                thường ngày.
              </p>
              <p>
                Những ngày đầu tiên, XÉO XỌ chỉ là một căn phòng nhỏ nằm sâu trong một con ngõ yên
                tĩnh ở Hà Nội. Hai đứa mình - những người chưa từng học thời trang chuyên nghiệp -
                bắt đầu mọi thứ từ sự tò mò, niềm yêu thích với vải vóc và cảm giác muốn tự tay
                làm ra những bộ quần áo thật đẹp để mặc.
              </p>
            </div>
          </div>
        </div>
      </PatternSection>

      <section className="hidden bg-white px-5 pb-20 pt-10 xl:block xl:px-10 xl:pb-24 2xl:px-20">
        <div className="mx-auto max-w-site">
          <h2 className="text-center text-[1.55rem] font-black uppercase leading-[1] tracking-[-0.02em] text-foreground sm:text-[2rem] lg:text-[2.35rem]">
            NHỮNG ĐIỀU XÉO XỌ LUÔN GIỮ
          </h2>
          <div className="mx-auto mt-8 grid max-w-[1020px] grid-cols-4 gap-x-12 gap-y-8">
            {PRINCIPLES.map((principle, index) => (
              <article
                key={principle.number}
                className={`mx-auto flex min-h-[260px] w-full max-w-[164px] flex-col rounded-[24px] rounded-t-[999px] bg-[#f85e3f] px-4 pb-6 pt-3 text-center text-white shadow-[0_12px_22px_rgba(0,0,0,0.18)] sm:min-h-[305px] sm:max-w-[176px] sm:px-5 sm:pb-7 ${
                  index % 2 === 1 ? "xl:translate-y-6" : ""
                }`}
              >
                <span className="text-[2.5rem] font-black leading-[0.9] tracking-[-0.03em] sm:text-[3.1rem]">
                  {principle.number}
                </span>
                <h3 className="mt-2.5 whitespace-pre-line text-[0.88rem] font-black uppercase leading-[1.02] sm:text-[1rem]">
                  {principle.title}
                </h3>
                <p className="mt-4 text-[0.74rem] font-light leading-[1.38] text-white/95 sm:text-[0.8rem]">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-0">
        <div className="mx-auto max-w-site overflow-hidden bg-white px-5 sm:px-6 md:px-8 xl:px-10 2xl:px-20">
          <div
            className="h-5 bg-[length:auto_100%] bg-repeat-x"
            style={{ backgroundImage: "url('/images/story-section-background.png')" }}
          />
          <div className="px-0 pb-8 pt-4 sm:pb-10">
            <h2 className="text-center text-[1.55rem] font-black uppercase leading-[1] tracking-[-0.02em] text-foreground sm:text-[2rem] lg:text-[2.35rem]">
              PHÍA SAU MỘT THIẾT KẾ
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
              {PROCESS.map((step) => (
                <article key={step.title}>
                  <div className="relative aspect-[1.28/1] overflow-hidden rounded-[12px]">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      sizes="(max-width: 1280px) 48vw, 22vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-4 text-[1.15rem] font-black leading-[1.08] text-foreground sm:text-[1.3rem]">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-[0.88rem] font-light leading-6 text-foreground/82 sm:text-[0.95rem]">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative mt-8 w-full overflow-hidden py-0 sm:mt-10"
        style={{ backgroundImage: "url('/images/story-section-background.png')" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(39,15,10,0.18)_0%,rgba(39,15,10,0.34)_44%,rgba(39,15,10,0.52)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-12 bg-[linear-gradient(90deg,rgba(39,15,10,0.28)_0%,rgba(39,15,10,0)_100%)] sm:w-20" />
        <div className="absolute inset-y-0 right-0 w-12 bg-[linear-gradient(270deg,rgba(39,15,10,0.28)_0%,rgba(39,15,10,0)_100%)] sm:w-20" />
        <div className="relative mx-auto flex max-w-site flex-col items-center px-5 py-9 text-center sm:px-6 sm:py-12 md:px-8 xl:px-10 2xl:px-20">
          <div className="relative z-[1] mx-auto w-full text-center">
            <p className="mx-auto max-w-[760px] text-center text-[0.92rem] font-light leading-6 text-white/90 sm:text-[0.98rem]">
              <span className="block whitespace-nowrap">
                Cảm ơn bạn đã là một phần trong câu chuyện của chúng mình.
              </span>
              <span className="mt-1 block whitespace-nowrap">
                Hãy cùng Xéo Xọ viết tiếp những chương mới rạng rỡ hơn.
              </span>
            </p>
            <AuthModalLink
              mode="register"
              className="group mx-auto mt-5 inline-flex min-h-[42px] w-fit items-center justify-center rounded-pill border border-white/90 bg-black/10 px-5 text-[0.9rem] font-semibold text-white text-shadow shadow-[0_6px_14px_rgba(0,0,0,0.18)] transition-colors hover:bg-white hover:text-black hover:[text-shadow:none] sm:min-h-[46px] sm:px-6 sm:text-[0.98rem]"
            >
              Gia nhập Hội Xéo
              <span className="ml-1.5 text-[1rem] leading-none transition-transform group-hover:translate-x-1 sm:text-[1.15rem]">
                →
              </span>
            </AuthModalLink>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
