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
  isOrderHistoryFilter,
  ORDERS_PAGE_SIZE,
  type OrderHistoryFilter,
} from "@/features/order/order-history";
import type { AccountOrder } from "@/types/account-order.types";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

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
  { label: "Quản lý lịch hẹn", href: ROUTES.ACCOUNT_APPOINTMENTS },
  { label: "Sổ địa chỉ", href: ROUTES.ACCOUNT_ADDRESSES },
  { label: "Đánh giá và phản hồi", href: ROUTES.ACCOUNT_REVIEWS },
  { label: "Câu hỏi thường gặp", href: ROUTES.FAQ_ACCOUNT },
  { label: "Đăng xuất", action: "logout" },
];

function FloralDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-[5px] w-full bg-[length:100%_100%] bg-center bg-no-repeat",
        className,
      )}
      style={{ backgroundImage: "url(/images/header-line-up.png)" }}
    />
  );
}

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
  let initialTotal: number | undefined;

  if (authenticatedUser) {
    const customer = await getCustomerProfileByAccountId(authenticatedUser.id);

    if (customer?.customer_id) {
      const { orders, total } = await getCustomerOrdersByCustomerId(
        Number(customer.customer_id),
        { statusGroup: activeFilter, offset: 0, limit: ORDERS_PAGE_SIZE },
      );
      initialOrders = orders;
      initialTotal = total;
    }
  }

  return (
    <SiteLayout>
      <div className="account-page-shell">
        <section className="account-page-section">
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

            <div className="account-page-grid">
              <aside className="account-sticky-rail">
                <AccountNavigation
                  items={ACCOUNT_NAV_ITEMS}
                  activeHref={ROUTES.ACCOUNT_ORDERS}
                  variant="account"
                />
              </aside>

              <section className="account-content-panel md:px-6 md:py-6 xl:px-8 xl:py-8">
                <div className="flex flex-col gap-3 border-b border-black/10 pb-4">
                  <h1 className="text-[28px] font-extrabold leading-none md:text-[42px]">
                    Lịch sử đơn hàng
                  </h1>

                  <FloralDivider />
                </div>

                <AccountOrderHistory
                  isAuthenticated={isAuthenticated}
                  initialOrders={initialOrders}
                  initialTotal={initialTotal}
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
