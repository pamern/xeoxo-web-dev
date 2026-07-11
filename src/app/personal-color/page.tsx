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

      <div className="w-full flex justify-center">
        <PersonalColorQuiz />
      </div>
    </SiteLayout>
  );
}
