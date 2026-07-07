import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import {
  AccountNavigation,
  type AccountNavItem,
} from "@/components/organisms/AccountNavigation/AccountNavigation";
import { AccountOrderHistory } from "@/components/organisms/AccountOrderHistory";
import { PolicyClosingNote } from "@/components/organisms/PolicyClosingNote";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import {
  getAuthenticatedUser,
  getCustomerProfileByAccountId,
} from "@/features/auth/auth.service";
import { getCustomerOrdersByCustomerId } from "@/features/order/account-order.service";
import {
  filterOrdersByStatus,
  isOrderHistoryFilter,
  type OrderHistoryFilter,
} from "@/features/order/order-history";
import type { AccountOrder } from "@/types/account-order.types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Lịch sử đơn hàng",
  description: "Theo dõi các đơn hàng đã đặt trong tài khoản Xéo Xọ của bạn.",
};

export const dynamic = "force-dynamic";

type AccountOrdersPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  { label: "Hồ sơ thông tin", href: ROUTES.ACCOUNT_PROFILE },
  { label: "Lịch sử mua hàng", href: ROUTES.ACCOUNT_ORDERS },
  { label: "Quản lý lịch hẹn", href: ROUTES.APPOINTMENT },
  { label: "Sổ địa chỉ", href: ROUTES.ACCOUNT_ADDRESSES },
  { label: "Đánh giá và phản hồi" },
  { label: "Câu hỏi thường gặp", href: ROUTES.FAQ_ACCOUNT },
  { label: "Đăng xuất", action: "logout" },
];

export default async function AccountOrdersRoute({
  searchParams,
}: AccountOrdersPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter: OrderHistoryFilter = isOrderHistoryFilter(
    resolvedSearchParams?.status,
  )
    ? resolvedSearchParams.status
    : "all";

  const supabase = await createClient();
  const authenticatedUser = await getAuthenticatedUser(supabase);
  const isAuthenticated = Boolean(authenticatedUser);
  let initialOrders: AccountOrder[] | undefined;

  if (authenticatedUser) {
    const customer = await getCustomerProfileByAccountId(authenticatedUser.id);

    if (customer?.customer_id) {
      const orders = await getCustomerOrdersByCustomerId(
        Number(customer.customer_id),
      );
      initialOrders = filterOrdersByStatus(orders, activeFilter);
    }
  }

  return (
    <SiteLayout>
      <div className="bg-background">
        <section className="px-6 pb-16 pt-10 xl:px-[100px] xl:pb-24">
          <div className="mx-auto max-w-site">
            <Breadcrumbs
              variant="account"
              items={[
                {
                  label: "",
                  href: ROUTES.HOME,
                  iconSrc: "/icons/home.svg",
                  iconAlt: "Trang chủ",
                },
                { label: "Lịch sử đơn hàng" },
              ]}
            />

            <div className="mt-8 grid gap-8 xl:grid-cols-[290px_minmax(0,1fr)] xl:items-start">
              <aside className="xl:sticky xl:top-[180px]">
                <AccountNavigation
                  items={ACCOUNT_NAV_ITEMS}
                  activeHref={ROUTES.ACCOUNT_ORDERS}
                  variant="account"
                />
              </aside>

              <section className="rounded-[26px] bg-white px-6 py-8 shadow-[0_14px_40px_rgba(0,0,0,0.12)] md:px-10 md:py-10 xl:px-12 xl:py-12">
                <div className="flex flex-col gap-5">
                  <h1 className="text-[28px] font-extrabold leading-none md:text-[42px]">
                    Lịch sử đơn hàng
                  </h1>

                  <div className="h-[5px] w-full bg-[url('/images/strip-title-underline.png')] bg-[length:100%_100%] bg-center bg-no-repeat" />
                </div>

                <AccountOrderHistory
                  isAuthenticated={isAuthenticated}
                  initialOrders={initialOrders}
                  statusGroup={activeFilter}
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
