import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { PersonalColorQuiz } from "@/components/organisms/PersonalColorQuiz";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Find your Personal Color",
  description: "Tìm personal color phù hợp với bạn cùng XÉO XỌ.",
};

export default function PersonalColorPage() {
  return (
    <SiteLayout>
      <section className="breadcrumb-shell">
        <Breadcrumbs
          items={[
            { label: "", href: ROUTES.HOME, iconSrc: "/icons/home.svg", iconAlt: "Trang chủ" },
            { label: "Tính năng mới" },
            { label: "Find your Personal Color" },
          ]}
        />
      </section>

      <section className="relative mt-4 flex h-[260px] items-center justify-center overflow-hidden md:h-[320px]">
        <Image
          src="/images/homepage_personal_color.png"
          alt="Find your personal color"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" aria-hidden />
        <h1 className="text-shadow relative px-6 text-center font-serif text-display-page italic text-white md:text-display-hero">
          Find your personal color
        </h1>
      </section>

      <div className="flex justify-center">
        <PersonalColorQuiz />
      </div>
    </SiteLayout>
  );
}
