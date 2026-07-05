import type { Metadata } from "next";
import Link from "next/link";
import { AccountProfileEditor } from "@/components/organisms/AccountProfileEditor";
import {
  AccountNavigation,
  type AccountNavItem,
} from "@/components/organisms/AccountNavigation/AccountNavigation";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
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
  { label: "Quản lý lịch hẹn", href: ROUTES.APPOINTMENT },
  { label: "Sổ địa chỉ", href: ROUTES.ACCOUNT_ADDRESSES },
  { label: "Đánh giá và phản hồi" },
  { label: "Chính sách chúng tôi", href: ROUTES.POLICIES },
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
              className="text-sm font-medium text-foreground/68"
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

            <div className="mt-8 grid gap-8 xl:grid-cols-[290px_minmax(0,1fr)] xl:items-start">
              <aside className="xl:sticky xl:top-[180px]">
                <AccountNavigation
                  items={ACCOUNT_NAV_ITEMS}
                  activeHref={ROUTES.ACCOUNT_PROFILE}
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

        <section className="px-6 pb-16 xl:px-[100px] xl:pb-24">
          <div className="mx-auto max-w-site">
            <div className="max-w-[760px]">
              <FloralDivider className="max-w-[360px]" />
              <h2 className="mt-6 text-[34px] font-light leading-[1.05] text-foreground md:text-[62px]">
                <span className="font-extrabold">Xéo xọ</span> luôn lắng nghe bạn
              </h2>
              <p className="mt-4 max-w-[720px] text-sm font-light text-foreground/80 md:text-lg">
                Chúng tôi luôn trân trọng và mong đợi nhận được mọi ý kiến đóng
                góp từ khách hàng để có thể nâng cấp trải nghiệm dịch vụ và sản
                phẩm tốt hơn nữa.
              </p>
              <FloralDivider className="mt-6 max-w-[360px]" />
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
