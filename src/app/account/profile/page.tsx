import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { AccountProfileEditor } from "@/components/organisms/AccountProfileEditor";
import {
  AccountNavigation,
  type AccountNavItem,
} from "@/components/organisms/AccountNavigation/AccountNavigation";
import { PolicyClosingNote } from "@/components/organisms/PolicyClosingNote";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import {
  getAuthenticatedUser,
  getCustomerProfileByAccountId,
  mapAuthUser,
} from "@/features/auth/auth.service";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hồ sơ thông tin",
  description:
    "Quản lý thông tin hồ sơ, tài khoản và các chi tiết thành viên của bạn tại XÉO XỌ.",
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

export default async function AccountProfileRoute() {
  const supabase = await createClient();
  const authenticatedUser = await getAuthenticatedUser(supabase);
  const user = mapAuthUser(authenticatedUser);
  const customer = authenticatedUser
    ? await getCustomerProfileByAccountId(authenticatedUser.id)
    : null;
  const isAuthenticated = Boolean(authenticatedUser);

  return (
    <SiteLayout>
      <div className="bg-background">
        <section className="px-6 pb-10 pt-6 xl:px-[100px] xl:pb-16">
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
                { label: "Hồ sơ thông tin" },
              ]}
            />

            <div className="account-page-grid">
              <aside className="account-sticky-rail">
                <AccountNavigation
                  items={ACCOUNT_NAV_ITEMS}
                  activeHref={ROUTES.ACCOUNT_PROFILE}
                  variant="account"
                />
              </aside>

              <section className="account-panel-soft">
                <div className="flex flex-col gap-1.5">
                  <h1 className="account-panel-heading">
                    Hồ sơ thông tin
                  </h1>
                  <p className="text-xs font-medium text-foreground/72">
                    Quản lý thông tin hồ sơ để bảo mật tài khoản
                  </p>
                </div>

                <FloralDivider className="mt-6" />

                {isAuthenticated ? (
                  <AccountProfileEditor user={user} customer={customer} />
                ) : (
                  <div className="account-empty-panel mt-8">
                    <p className="text-body-lg font-medium">
                      Bạn cần đăng nhập để xem hồ sơ thông tin.
                    </p>
                    <p className="mt-2 text-body-sm font-light text-foreground/72">
                      Sau khi đăng nhập, trang này sẽ hiển thị tên, email và các
                      thông tin thành viên đã đồng bộ từ tài khoản của bạn.
                    </p>
                    <div className="mt-6">
                      <Link
                        href={`${ROUTES.HOME}?auth=login`}
                        className="inline-flex h-12 items-center justify-center rounded-pill bg-black px-8 text-sm font-bold uppercase tracking-[0.03em] text-white"
                      >
                        Đăng nhập ngay
                      </Link>
                    </div>
                  </div>
                )}

                <FloralDivider className="mt-10" />
              </section>
            </div>
          </div>
        </section>

        <PolicyClosingNote />
      </div>
    </SiteLayout>
  );
}
