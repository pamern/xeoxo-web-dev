import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteLayout } from "@/components/templates/SiteLayout";

type Params = { slug: string };

const POLICIES: Record<string, { title: string; body: string[] }> = {
  customer: {
    title: "Chinh sach khach hang",
    body: [
      "XEO XO tiep nhan va ho tro cac yeu cau cua khach hang trong qua trinh mua sam.",
      "Thong tin chi tiet se duoc cap nhat theo chinh sach van hanh chinh thuc.",
    ],
  },
  return: {
    title: "Chinh sach doi tra",
    body: [
      "San pham duoc ho tro doi tra theo dieu kien va thoi gian quy dinh.",
      "Vui long giu san pham con nguyen tinh trang ban dau de duoc ho tro tot nhat.",
    ],
  },
  inspection: {
    title: "Chinh sach kiem hang",
    body: ["Khach hang co the kiem tra san pham khi nhan hang theo quy dinh cua don vi van chuyen."],
  },
  shipping: {
    title: "Chinh sach van chuyen",
    body: ["Don hang duoc giao den dia chi khach hang cung cap trong qua trinh dat hang."],
  },
  payment: {
    title: "Chinh sach thanh toan",
    body: ["XEO XO ho tro cac phuong thuc thanh toan duoc hien thi tai buoc thanh toan."],
  },
  privacy: {
    title: "Chinh sach bao mat",
    body: ["Thong tin ca nhan cua khach hang duoc su dung cho muc dich xu ly don hang va cham soc khach hang."],
  },
  care: {
    title: "Huong dan giat la",
    body: ["Nen giat nhe, tranh chat tay manh va phoi noi thoang mat de giu chat lieu ben dep."],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) return { title: "Khong tim thay chinh sach" };
  return { title: policy.title };
}

export default async function PolicyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();

  return (
    <SiteLayout>
      <article className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-medium uppercase md:text-4xl">{policy.title}</h1>
        <div className="space-y-4 text-base font-light leading-relaxed text-foreground/80">
          {policy.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </SiteLayout>
  );
}
