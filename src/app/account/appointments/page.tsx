import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import {
  AccountNavigation,
  type AccountNavItem,
} from "@/components/organisms/AccountNavigation/AccountNavigation";
import { AccountAppointmentHistory } from "@/components/organisms/AccountAppointmentHistory";
import { PolicyClosingNote } from "@/components/organisms/PolicyClosingNote";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import {
  getMeasurementAppointmentsByCustomerId,
  isAccountAppointmentFilter,
} from "@/features/appointment/account-appointment-history";
import {
  getAuthenticatedUser,
  getCustomerProfileByAccountId,
} from "@/features/auth/auth.service";
import type {
  AccountAppointment,
  AccountAppointmentStatus,
} from "@/types/account-appointment.types";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quản lý lịch hẹn",
  description:
    "Theo dõi các lịch hẹn tư vấn, may đo và trải nghiệm dịch vụ trong tài khoản Xéo Xọ của bạn.",
};

export const dynamic = "force-dynamic";

type AccountAppointmentsPageProps = {
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
        "floral-divider",
        className,
      )}
      style={{ backgroundImage: "url(/images/header-line-up.png)" }}
    />
  );
}

export default async function AccountAppointmentsPage({
  searchParams,
}: AccountAppointmentsPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter: AccountAppointmentStatus = isAccountAppointmentFilter(
    resolvedSearchParams?.status,
  )
    ? resolvedSearchParams.status
    : "all";

  const supabase = await createClient();
  const authenticatedUser = await getAuthenticatedUser(supabase);
  const isAuthenticated = Boolean(authenticatedUser);

  let initialAppointments: AccountAppointment[] = [];

  if (authenticatedUser) {
    const customer = await getCustomerProfileByAccountId(authenticatedUser.id);

    if (customer?.customer_id) {
      const appointments = await getMeasurementAppointmentsByCustomerId(
        Number(customer.customer_id),
        {
          limit: 20,
          page: 1,
          status_group: activeFilter,
        },
      );

      initialAppointments = appointments.items;
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
                { label: "Quản lý lịch hẹn" },
              ]}
            />

            <div className="account-page-grid">
              <aside className="account-sticky-rail">
                <AccountNavigation
                  items={ACCOUNT_NAV_ITEMS}
                  activeHref={ROUTES.ACCOUNT_APPOINTMENTS}
                  variant="account"
                />
              </aside>

              <section className="account-content-panel">
                <div className="flex flex-col gap-5">
                  <h1 className="account-panel-title">
                    Quản lý lịch hẹn
                  </h1>

                  <FloralDivider />
                </div>

                <AccountAppointmentHistory
                  initialAppointments={initialAppointments}
                  isAuthenticated={isAuthenticated}
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
