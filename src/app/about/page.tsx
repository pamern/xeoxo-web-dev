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
    description:
      "Quan sát nhịp sống, nghiên cứu di sản và các chất liệu tự nhiên.",
  },
  {
    image: "/images/story-2.jpg",
    title: "Phác thảo",
    description:
      "Những nét đầu tiên hiện thực hoá cảm xúc thành hình dáng.",
  },
  {
    image: "/images/story-1.jpg",
    title: "May mẫu",
    description:
      "Chỉnh sửa từng cm để đạt được độ rơi và phom dáng hoàn hảo nhất.",
  },
  {
    image: "/images/process-4.jpg",
    title: "Hoàn thiện",
    description: "Kiểm tra tỉ mỉ trước khi đóng gói gửi tới bạn.",
  },
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
      className="px-4 py-0 sm:px-6 xl:px-gutter"
      style={{ backgroundImage: "url('/images/story-section-background.png')" }}
    >
      <div className="mx-auto max-w-site py-8 sm:py-10">
        <h2 className="text-center text-display-section uppercase tracking-[-0.02em] text-white sm:text-display-hero">
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
      <section className="bg-background px-4 pt-0 sm:px-6 xl:px-gutter">
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
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.48)_100%)]" />
            <div className="relative z-[1] flex min-h-[290px] flex-col items-center justify-center px-6 text-center sm:min-h-[420px]">
              <h1 className="text-display-hero uppercase tracking-[-0.03em] text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] sm:text-[78px]">
                XÉO XỌ
              </h1>
              <p className="mt-2 text-body-sm text-white/92 sm:text-body-lg">
                Lưu giữ vẻ đẹp Á Đông trong từng thiết kế
              </p>
              <Link
                href={ROUTES.COLLECTIONS}
                className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/80 bg-black/12 px-6 text-button-hero text-white shadow-[0_8px_18px_rgba(0,0,0,0.2)] backdrop-blur-[10px] transition-colors hover:bg-white/16 sm:min-h-[58px] sm:px-9 sm:text-button-xl"
              >
                Khám phá bộ sưu tập
                <span className="ml-2 text-[22px] leading-none sm:text-[28px]">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-10 sm:px-6 sm:py-14 xl:px-gutter">
        <div className="mx-auto max-w-site text-center">
          <h2 className="mx-auto max-w-[1200px] text-display-section tracking-[-0.02em] text-foreground sm:text-display-hero">
            “Chúng tôi đơn giản chỉ muốn làm ra
            <br />
            những bộ quần áo đẹp để mặc”
          </h2>
          <div className="mx-auto mt-5 max-w-[980px] space-y-2 text-body-sm text-foreground/76 sm:mt-7 sm:text-body-lg">
            <p>
              Nhiều người hỏi “XÉO XỌ” có nghĩa là gì. Thật ra, nó không mang
              một ý nghĩa cụ thể nào cả.
            </p>
            <p>
              Chúng tôi thích việc mỗi người sẽ tự giữ cho mình một cách hiểu
              riêng về XÉO XỌ - giống như quần áo đôi khi cũng trở thành một
              phần rất riêng trong cuộc sống của mỗi người.
            </p>
          </div>
        </div>
      </section>

      <PatternSection title="CÂU CHUYỆN XÉO XỌ">
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.04fr_1fr] lg:items-start">
          <div>
            <div className="relative aspect-[1.47/1] overflow-hidden rounded-[12px] bg-white/15">
              <Image
                src="/images/story-main.jpg"
                alt="Câu chuyện Xéo Xọ"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {["/images/story-1.jpg", "/images/story-2.jpg", "/images/story-3.jpg"].map(
                (src) => (
                  <div
                    key={src}
                    className="relative aspect-square overflow-hidden rounded-[12px] bg-white/15"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 30vw, 15vw"
                      className="object-cover"
                    />
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="rounded-[12px] bg-white px-6 py-7 shadow-[0_14px_28px_rgba(0,0,0,0.08)] sm:px-8 sm:py-9">
            <h3 className="text-display-section tracking-[-0.02em] text-foreground sm:text-display-section">
              Mọi thứ bắt đầu từ
              <br />
              một căn phòng nhỏ ...
            </h3>
            <div className="mt-5 space-y-5 text-body-sm text-foreground/82 text-justify sm:text-body-lg">
              <p>
                Được thành lập bởi Hương và Hằng, XÉO XỌ bắt đầu từ tình yêu với
                chất liệu tự nhiên và niềm yêu thích dành cho những thiết kế mềm
                mại và gần gũi với đời sống thường ngày.
              </p>
              <p>
                Những ngày đầu tiên, XÉO XỌ chỉ là một căn phòng nhỏ nằm sâu
                trong một con ngõ yên tĩnh ở Hà Nội. Hai đứa mình - những người
                chưa từng học thời trang chuyên nghiệp - bắt đầu mọi thứ từ sự
                tò mò, niềm yêu thích với vải vóc và cảm giác muốn tự tay làm ra
                những bộ quần áo thật đẹp để mặc.
              </p>
            </div>
          </div>
        </div>
      </PatternSection>

      <section className="bg-white px-4 py-10 sm:px-6 sm:py-14 xl:px-gutter">
        <div className="mx-auto max-w-site">
          <h2 className="text-center text-display-section uppercase tracking-[-0.02em] text-foreground sm:text-display-hero">
            NHỮNG ĐIỀU XÉO XỌ LUÔN GIỮ
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-10">
            {PRINCIPLES.map((principle, index) => (
              <article
                key={principle.number}
                className={`mx-auto flex min-h-[300px] w-full max-w-[190px] flex-col rounded-[28px] rounded-t-[82px] bg-accent px-5 pb-7 pt-4 text-center text-white shadow-[0_10px_20px_rgba(0,0,0,0.18)] sm:min-h-[365px] sm:max-w-[205px] sm:px-6 sm:pb-8 ${
                  index % 2 === 1 ? "xl:translate-y-10" : ""
                }`}
              >
                <span className="text-[54px] font-black leading-[0.92] tracking-[-0.03em] sm:text-[68px]">
                  {principle.number}
                </span>
                <h3 className="mt-3 whitespace-pre-line text-heading-content uppercase sm:text-heading-card">
                  {principle.title}
                </h3>
                <p className="mt-5 text-caption text-white/94 sm:text-body">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-0 sm:px-6 xl:px-gutter">
        <div className="mx-auto max-w-site overflow-hidden bg-white shadow-[0_14px_28px_rgba(0,0,0,0.08)]">
          <div
            className="h-5 bg-[length:auto_100%] bg-repeat-x"
            style={{ backgroundImage: "url('/images/story-section-background.png')" }}
          />
          <div className="px-5 pb-8 pt-3 sm:px-8 sm:pb-10">
            <h2 className="text-center text-display-section uppercase tracking-[-0.02em] text-foreground sm:text-display-hero">
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
                  <h3 className="mt-4 text-heading-card text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-body-sm text-foreground/80">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-0 sm:px-6 xl:px-gutter">
        <div
          className="relative mx-auto mt-0 max-w-site overflow-hidden px-6 py-10 text-center sm:px-10 sm:py-14"
          style={{ backgroundImage: "url('/images/story-section-background.png')" }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(39,15,10,0.18)_0%,rgba(39,15,10,0.34)_44%,rgba(39,15,10,0.52)_100%)]" />
          <div className="relative z-[1]">
            <h2 className="mx-auto max-w-[860px] text-display-section tracking-[-0.02em] text-white sm:text-display-hero">
              XÉO XỌ vẫn đang tiếp tục lớn lên
              <br />
              mỗi ngày.
            </h2>
            <p className="mx-auto mt-4 max-w-form text-body-sm text-white/90 sm:text-body-lg">
              Cảm ơn bạn đã là một phần trong câu chuyện của chúng mình.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Hãy cùng Xéo Xọ viết tiếp những chương mới rạng rỡ hơn.
            </p>
            <AuthModalLink
              mode="register"
              className="mx-auto mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/80 bg-black/10 px-7 text-button-hero text-white shadow-[0_10px_18px_rgba(0,0,0,0.16)] backdrop-blur-[10px] transition-colors hover:bg-white/16 sm:min-h-[56px] sm:px-9 sm:text-button-xl"
            >
              Gia nhập Hội Xéo
              <span className="ml-2 text-[22px] leading-none sm:text-[28px]">
                →
              </span>
            </AuthModalLink>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
