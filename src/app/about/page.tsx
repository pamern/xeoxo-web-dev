import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Về XÉO XỌ",
  description:
    "Câu chuyện thương hiệu XÉO XỌ — được thành lập bởi Hương và Hằng, bắt đầu từ tình yêu với chất liệu tự nhiên và những thiết kế gần gũi đời sống.",
};

const PRINCIPLES = [
  {
    number: "01",
    title: "KHÔNG CHẠY THEO TRÀO LƯU",
    description:
      "Chúng mình tin vào giá trị của thời gian và sự bền vững thay vì chạy theo xu hướng nhất thời.",
  },
  {
    number: "02",
    title: "CHẤT LIỆU LÀ QUAN TRỌNG",
    description:
      "Linen, lụa, tơ... những sợi tự nhiên luôn là linh hồn trong mỗi thiết kế của Xéo Xọ.",
  },
  {
    number: "03",
    title: "TINH THẦN Á ĐÔNG",
    description:
      "Làm mới những giá trị truyền thống để phù hợp với người phụ nữ hiện đại.",
  },
  {
    number: "04",
    title: "KHÔNG BỎ CUỘC",
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
    description: "Kiểm tra tỉ mỉ trước khi đóng gói gửi cho bạn.",
  },
];

export default function AboutPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative flex h-[70vh] min-h-[460px] items-center justify-center overflow-hidden">
        <Image src="/images/hero.png" alt="XÉO XỌ" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/45" aria-hidden />
        <div className="relative flex flex-col items-center gap-4 px-6 text-center">
          <h1 className="text-shadow text-6xl font-extrabold text-white md:text-8xl">XÉO XỌ</h1>
          <p className="text-lg font-light text-white">
            Lưu giữ vẻ đẹp Á Đông trong từng thiết kế.
          </p>
          <Link
            href={ROUTES.COLLECTIONS}
            className="mt-2 inline-flex items-center rounded-pill border border-white px-6 py-3 text-lg font-medium text-white text-shadow transition-colors hover:bg-white hover:text-black hover:[text-shadow:none]"
          >
            Khám phá bộ sưu tập
          </Link>
        </div>
      </section>

      {/* Manifesto */}
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-16 text-center">
        <p className="text-2xl font-medium leading-snug md:text-3xl">
          “Chúng tôi chỉ đơn giản muốn làm ra những bộ quần áo đẹp để mặc”
        </p>
        <p className="text-base font-light leading-relaxed text-foreground/70">
          Nhiều người hỏi “XÉO XỌ” có nghĩa là gì. Thật ra, nó không mang một ý nghĩa cụ thể nào cả.
          Chúng tôi thích việc mỗi người sẽ tự giữ cho mình một cách hiểu riêng về XÉO XỌ — giống như cách quần áo
          đôi khi cũng trở thành một phần rất riêng trong cuộc sống của mỗi người.
        </p>
      </section>

      {/* Story */}
      <section className="bg-secondary py-16" style={{
    backgroundImage: "url('/images/story-section-background.png')",
  }}>
        <div className="mx-auto max-w-site px-6 xl:px-[100px]">
          <h2 className="text-shadow mb-10 text-center text-3xl font-extrabold uppercase md:text-4xl text-white">
            Câu chuyện Xéo Xọ
          </h2>
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="grid grid-cols-3 grid-rows-[2fr_1fr] gap-4">
              <div className="relative col-span-3 overflow-hidden rounded-lg">
                <Image
                  src="/images/story-main.jpg"
                  alt="Xưởng may XÉO XỌ"
                  width={665}
                  height={312}
                  className="h-full w-full object-cover"
                />
              </div>
              {["/images/story-1.jpg", "/images/story-2.jpg", "/images/story-3.jpg"].map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image src={src} alt="" fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center gap-5 rounded-lg bg-background p-8">
              <h3 className="text-2xl font-medium">Mọi thứ bắt đầu từ một căn phòng nhỏ...</h3>
              <p className="text-base font-light leading-relaxed text-foreground/80">
                Được thành lập bởi Hương và Hằng, XÉO XỌ bắt đầu từ tình yêu với chất liệu tự nhiên và
                niềm yêu thích dành cho những thiết kế mềm mại và gần gũi với đời sống thường ngày.
              </p>
              <p className="text-base font-light leading-relaxed text-foreground/80">
                Những ngày đầu tiên, XÉO XỌ chỉ là một căn phòng nhỏ nằm sâu trong một con ngõ yên
                tĩnh ở Hà Nội. Hai đứa mình — những người chưa từng học thời trang chuyên nghiệp — bắt
                đầu mọi thứ từ sự tò mò, niềm yêu thích với vải vóc và cảm giác muốn tự tay làm ra
                những bộ quần áo thật đẹp để mặc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-site px-6 py-16 xl:px-[100px]">
        <h2 className="mb-12 text-center text-3xl font-medium uppercase md:text-4xl">
          Những điều Xéo Xọ luôn giữ
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((principle) => (
            <article
              key={principle.number}
              className="flex flex-col items-center gap-4 rounded-lg bg-primary p-8 text-center text-primary-foreground"
            >
              <span className="text-5xl font-medium">{principle.number}</span>
              <h3 className="text-lg font-bold">{principle.title}</h3>
              <p className="text-sm font-light text-primary-foreground/80">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-site px-6 py-16 xl:px-[100px]">
        <h2 className="mb-12 text-center text-3xl font-medium uppercase md:text-4xl">
          Phía sau một thiết kế
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((step) => (
            <article key={step.title} className="flex flex-col gap-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image src={step.image} alt={step.title} fill sizes="300px" className="object-cover" />
              </div>
              <h3 className="text-xl font-medium">{step.title}</h3>
              <p className="text-base font-light text-foreground/70">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative flex min-h-[400px] items-center justify-center overflow-hidden">
        <Image src="/images/hero.png" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/55" aria-hidden />
        <div className="relative flex max-w-3xl flex-col items-center gap-5 px-6 text-center">
          <h2 className="text-shadow text-3xl font-extrabold text-white md:text-4xl">
            XÉO XỌ vẫn đang tiếp tục lớn lên mỗi ngày.
          </h2>
          <p className="text-base font-light text-white/90">
            Cảm ơn bạn đã là một phần trong câu chuyện của chúng mình. Hãy cùng Xéo Xọ viết tiếp những
            chương mới rạng rỡ hơn.
          </p>
          <Link
            href={ROUTES.REGISTER}
            className="inline-flex items-center rounded-pill border border-white px-6 py-3 text-lg font-medium text-white text-shadow transition-colors hover:bg-white hover:text-black hover:[text-shadow:none]"
          >
            Gia nhập Hội Xéo
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
