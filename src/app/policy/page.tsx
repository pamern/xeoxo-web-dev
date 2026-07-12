import type { Metadata } from "next";
import { Button } from "@/components/atoms/Button";
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
      <div className="mx-auto w-full max-w-site px-5 py-8 sm:px-6 sm:py-10 xl:px-[84px]">
        <h1 className="mb-6 text-[2rem] font-bold leading-[1.05] text-black sm:mb-7 sm:text-[2.4rem]">
          Chăm sóc khách hàng
        </h1>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POLICY_LINKS.map((policy) => (
            <Button
              key={policy.href}
              href={policy.href}
              variant="secondaryPill"
              size="sm"
              className="h-11 w-full justify-start !rounded-[6px] border-black px-5 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white sm:h-12 sm:px-6 sm:text-[15px]"
            >
              {policy.title}
            </Button>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
