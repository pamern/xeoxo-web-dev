import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import {
  AccountNavigation,
  type AccountNavItem,
} from "@/components/organisms/AccountNavigation/AccountNavigation";
import { OrderDetailContent } from "@/components/organisms/OrderDetailContent";
import { PolicyClosingNote } from "@/components/organisms/PolicyClosingNote";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import {
  getAuthenticatedUser,
  getCustomerProfileByAccountId,
} from "@/features/auth/auth.service";
import { getCustomerOrderDetail } from "@/features/order/account-order.service";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng",
  description: "Xem chi tiết thông tin và trạng thái đơn hàng của bạn.",
};

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  { label: "Hồ sơ thông tin", href: ROUTES.ACCOUNT_PROFILE },
  { label: "Lịch sử mua hàng", href: ROUTES.ACCOUNT_ORDERS },
  { label: "Quản lý lịch hẹn", href: ROUTES.ACCOUNT_APPOINTMENTS },
  { label: "Sổ địa chỉ", href: ROUTES.ACCOUNT_ADDRESSES },
  { label: "Đánh giá và phản hồi" },
  { label: "Câu hỏi thường gặp", href: ROUTES.FAQ_ACCOUNT },
  { label: "Đăng xuất", action: "logout" },
];

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const orderId = Number(id);

  if (Number.isNaN(orderId)) {
    notFound();
  }

  const supabase = await createClient();
  const authenticatedUser = await getAuthenticatedUser(supabase);

  if (!authenticatedUser) {
    notFound();
  }

  const customer = await getCustomerProfileByAccountId(authenticatedUser.id);
  if (!customer?.customer_id) {
    notFound();
  }

  const order = await getCustomerOrderDetail(
    orderId,
    Number(customer.customer_id),
  );
  if (!order) {
    notFound();
  }

  return (
    <SiteLayout>
      <div className="bg-background">
        <section className="mx-auto w-full max-w-site px-6 pt-6 xl:px-[100px]">
          <Breadcrumbs
            items={[
              {
                label: "",
                href: ROUTES.HOME,
                iconSrc: "/icons/home.svg",
                iconAlt: "Trang chủ",
              },
              { label: "Lịch sử đơn hàng", href: ROUTES.ACCOUNT_ORDERS },
              { label: "Chi tiết đơn hàng" },
            ]}
          />
        </section>

        <section className="px-6 pb-16 pt-10 xl:px-[100px] xl:pb-24">
          <div className="mx-auto max-w-site">
            <div className="mt-2 grid gap-8 lg:grid-cols-[20%_minmax(0,1fr)] lg:items-start">
              <aside className="account-sticky-rail">
                <AccountNavigation
                  items={ACCOUNT_NAV_ITEMS}
                  activeHref={ROUTES.ACCOUNT_ORDERS}
                  variant="account"
                />
              </aside>

              <section>
                <OrderDetailContent
                  allowCancel
                  backHref={ROUTES.ACCOUNT_ORDERS}
                  customerName={customer.customer_name}
                  customerPhone={customer.phone}
                  order={order}
                />
              </section>
            </div>
          </div>
        </section>

        <PolicyClosingNote />
      </div>
    </SiteLayout>
  );
}
