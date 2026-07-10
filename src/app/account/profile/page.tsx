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
  { label: "Đánh giá và phản hồi" },
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
                { label: "Hồ sơ thông tin" },
              ]}
            />

            <div className="mt-8 grid gap-8 lg:grid-cols-[20%_minmax(0,1fr)] lg:items-start">
              <aside className="account-sticky-rail">
                <AccountNavigation
                  items={ACCOUNT_NAV_ITEMS}
                  activeHref={ROUTES.ACCOUNT_PROFILE}
                  variant="account"
                />
              </aside>

              <section className="rounded-[26px] bg-white px-6 py-8 shadow-[0_14px_40px_rgba(0,0,0,0.12)] md:px-10 md:py-10 xl:px-12 xl:py-12">
                <div className="flex flex-col gap-2">
                  <h1 className="text-[28px] font-extrabold leading-none md:text-[42px]">
                    Hồ sơ thông tin
                  </h1>
                  <p className="text-sm font-medium text-foreground/72 md:text-lg">
                    Quản lý thông tin hồ sơ để bảo mật tài khoản
                  </p>
                </div>

                <FloralDivider className="mt-6" />

                {isAuthenticated ? (
                  <AccountProfileEditor user={user} customer={customer} />
                ) : (
                  <div className="mt-8 rounded-[20px] border border-border bg-secondary px-6 py-8">
                    <p className="text-lg font-medium">
                      Bạn cần đăng nhập để xem hồ sơ thông tin.
                    </p>
                    <p className="mt-2 text-sm font-light text-foreground/72">
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
