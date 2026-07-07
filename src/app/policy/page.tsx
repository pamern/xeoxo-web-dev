import Link from "next/link";
import type { Metadata } from "next";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";

const POLICIES = [
  { slug: "customer", title: "Chính sách khách hàng" },
  { slug: "return", title: "Chính sách đổi trả" },
  { slug: "inspection", title: "Chính sách kiểm hàng" },
  { slug: "shipping", title: "Chính sách vận chuyển" },
  { slug: "payment", title: "Chính sách thanh toán" },
  { slug: "privacy", title: "Chính sách bảo mật" },
  { slug: "care", title: "Hướng dẫn giặt là" },
];

export const metadata: Metadata = {
  title: "Chính sách",
};

export default function PolicyIndexPage() {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-site px-6 py-10 xl:px-[100px]">
        <h1 className="mb-8 text-3xl font-medium uppercase md:text-4xl">
          Chính sách
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POLICIES.map((policy) => (
            <Link
              key={policy.slug}
              href={ROUTES.POLICY(policy.slug)}
              className="rounded-md border border-border p-5 text-lg font-medium transition-colors hover:border-primary hover:text-primary"
            >
              {policy.title}
            </Link>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}