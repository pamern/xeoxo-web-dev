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
      <div className="mx-auto max-w-site px-4 py-6 sm:px-6 sm:py-8 xl:px-[100px]">
        <h2 className="text-center text-[1.75rem] font-black uppercase leading-[0.96] tracking-[-0.02em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.18)] sm:text-[2.875rem]">
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
      <section className="bg-background px-4 pt-0 sm:px-6 xl:px-[100px]">
        <div className="mx-auto max-w-site">
          <div className="relative min-h-[290px] overflow-hidden bg-black sm:min-h-[420px]">
            <Image
              src="/images/hero.png"
              alt="XÉO XỌ"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.56)_100%)]" />
            <div className="relative z-[1] flex min-h-[290px] flex-col items-center justify-center px-6 text-center sm:min-h-[420px]">
              <h1 className="text-[2.875rem] font-black uppercase leading-[0.94] tracking-[-0.03em] text-white drop-shadow-[0_5px_14px_rgba(0,0,0,0.38)] sm:text-[4.875rem]">
                XÉO XỌ
              </h1>
              <p className="mt-2 text-sm font-light text-white sm:text-lg">
                Lưu giữ vẻ đẹp Á Đông trong từng thiết kế
              </p>
              <Link
                href={ROUTES.COLLECTIONS}
                className="group mt-5 inline-flex w-fit items-center justify-center rounded-pill border border-white/90 bg-black/10 px-6 py-3 text-[1rem] font-medium text-white text-shadow shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition-colors hover:bg-white hover:text-black hover:[text-shadow:none] sm:px-8 sm:py-4 sm:text-xl"
              >
                Khám phá bộ sưu tập
                <span className="ml-2 text-[1.375rem] leading-none transition-transform group-hover:translate-x-1 sm:text-[1.75rem]">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14 xl:px-[100px]">
        <div className="mx-auto max-w-site text-center">
          <h2 className="mx-auto max-w-[980px] text-[1.25rem] font-black leading-[1.06] tracking-[-0.02em] text-foreground sm:text-[2.125rem]">
            <span className="block whitespace-normal sm:whitespace-nowrap">
              “Chúng tôi chỉ đơn giản muốn làm ra
            </span>
            <span className="block whitespace-normal sm:whitespace-nowrap">
              những bộ quần áo đẹp để mặc”
            </span>
          </h2>
          <div className="mx-auto mt-5 max-w-[980px] space-y-1 text-[0.8125rem] font-light leading-[1.6] text-foreground/80 sm:text-[1.0625rem]">
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
        <div className="mx-auto mt-5 grid max-w-[1180px] gap-8 lg:grid-cols-[1fr_0.96fr] lg:items-start">
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
            <div className="mt-4 grid grid-cols-3 gap-4">
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

          <div className="rounded-[12px] bg-white px-6 py-6 shadow-[0_12px_28px_rgba(96,28,14,0.08)] sm:px-8 sm:py-7 lg:min-h-[376px]">
            <h3 className="max-w-[350px] text-[1.375rem] font-black leading-[1.06] tracking-[-0.02em] text-foreground sm:text-[2.125rem]">
              <span className="block whitespace-normal sm:whitespace-nowrap">Mọi thứ bắt đầu từ</span>
              <span className="block whitespace-normal sm:whitespace-nowrap">
                một căn phòng nhỏ ...
              </span>
            </h3>
            <div className="mt-5 max-w-[500px] space-y-5 text-[0.8125rem] font-light leading-[1.72] text-foreground/82 sm:text-[1rem]">
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

      <section className="bg-white px-4 pb-24 pt-10 sm:px-6 sm:pb-20 sm:pt-10 xl:px-[100px]">
        <div className="mx-auto max-w-site">
          <h2 className="text-center text-[1.75rem] font-black uppercase leading-[0.96] tracking-[-0.02em] text-foreground sm:text-[3rem]">
            NHỮNG ĐIỀU XÉO XỌ LUÔN GIỮ
          </h2>
          <div className="mt-9 grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-10">
            {PRINCIPLES.map((principle, index) => (
              <article
                key={principle.number}
                className={`mx-auto flex min-h-[300px] w-full max-w-[160px] flex-col rounded-[26px] rounded-t-[82px] bg-[#f85e3f] px-4 pb-7 pt-3 text-center text-white shadow-[0_12px_22px_rgba(0,0,0,0.18)] sm:min-h-[360px] sm:max-w-[182px] sm:px-5 sm:pb-8 ${
                  index % 2 === 1 ? "xl:translate-y-9" : ""
                }`}
              >
                <span className="text-[3.25rem] font-black leading-[0.9] tracking-[-0.03em] sm:text-[4rem]">
                  {principle.number}
                </span>
                <h3 className="mt-3 whitespace-pre-line text-[1.0625rem] font-black uppercase leading-[1.02] sm:text-[1.25rem]">
                  {principle.title}
                </h3>
                <p className="mt-5 text-body-sm font-light leading-[1.34] text-white/95 sm:text-[0.875rem]">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-0">
        <div className="mx-auto max-w-site overflow-hidden bg-white px-4 sm:px-6 xl:px-[100px]">
          <div
            className="h-5 bg-[length:auto_100%] bg-repeat-x"
            style={{ backgroundImage: "url('/images/story-section-background.png')" }}
          />
          <div className="px-5 pb-8 pt-3 sm:px-8 sm:pb-10">
            <h2 className="text-center text-[1.75rem] font-black uppercase leading-[0.96] tracking-[-0.02em] text-foreground sm:text-[3rem]">
              PHÍA SAU MỘT THIẾT KẾ
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-8">
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
                  <h3 className="mt-4 text-[1.25rem] font-black leading-[1.05] text-foreground sm:text-[1.5rem]">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-[0.8125rem] font-light leading-[1.45] text-foreground/82 sm:text-[0.9375rem]">
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
        <div className="relative mx-auto flex max-w-site flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-12 xl:px-[100px]">
          <div className="relative z-[1] mx-auto w-full text-center">
            <h2 className="mx-auto max-w-[620px] text-[1.375rem] font-black leading-[1] tracking-[-0.03em] text-white sm:text-[2.25rem]">
              <span className="block whitespace-normal sm:whitespace-nowrap">
                XÉO XỌ vẫn đang tiếp tục lớn lên
              </span>
              <span className="block whitespace-normal sm:whitespace-nowrap">mỗi ngày.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-[460px] text-body-sm font-light leading-[1.3] text-white/90">
              <span className="block whitespace-normal sm:whitespace-nowrap">
                Cảm ơn bạn đã là một phần trong câu chuyện của chúng mình.
              </span>
              <span className="block whitespace-normal sm:whitespace-nowrap">
                Hãy cùng Xéo Xọ viết tiếp những chương mới rạng rỡ hơn.
              </span>
            </p>
            <AuthModalLink
              mode="register"
              className="group mx-auto mt-4 inline-flex w-fit items-center justify-center rounded-pill border border-white/90 bg-black/10 px-5 py-2 text-[0.875rem] font-semibold text-white text-shadow shadow-[0_6px_14px_rgba(0,0,0,0.18)] transition-colors hover:bg-white hover:text-black hover:[text-shadow:none] sm:px-6 sm:py-2.5 sm:text-[1rem]"
            >
              Gia nhập Hội Xéo
              <span className="ml-1.5 text-[1.125rem] leading-none transition-transform group-hover:translate-x-1 sm:text-[1.25rem]">
                →
              </span>
            </AuthModalLink>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
