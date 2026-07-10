import Link from "next/link";
import type { Metadata } from "next";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";

const POLICY_LINKS = [
  { href: ROUTES.ORDER_LOOKUP, title: "Tra cứu đơn hàng" },
  { href: ROUTES.APPOINTMENT, title: "Tra cứu lịch hẹn" },
  { href: ROUTES.POLICY("customer"), title: "Chính sách khách hàng" },
  { href: ROUTES.POLICY("return"), title: "Chính sách đổi trả" },
  { href: ROUTES.POLICY("inspection"), title: "Chính sách kiểm hàng" },
  { href: ROUTES.POLICY("shipping"), title: "Chính sách vận chuyển" },
  { href: ROUTES.POLICY("payment"), title: "Chính sách thanh toán" },
  { href: ROUTES.POLICY("privacy"), title: "Chính sách bảo mật" },
  { href: ROUTES.POLICY("care"), title: "Hướng dẫn giặt là" },
];

export const metadata: Metadata = {
  title: "CSKH",
};

export default function PolicyIndexPage() {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-site px-6 py-10 xl:px-[100px]">
        <h1 className="page-heading mb-8">Chăm sóc khách hàng</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POLICY_LINKS.map((policy) => (
            <Link
              key={policy.href}
              href={policy.href}
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
