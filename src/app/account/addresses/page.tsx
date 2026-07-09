import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import {
  AccountNavigation,
  type AccountNavItem,
} from "@/components/organisms/AccountNavigation/AccountNavigation";
import { AccountAddressBook } from "@/components/organisms/AccountAddressBook";
import { PolicyClosingNote } from "@/components/organisms/PolicyClosingNote";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import {
  getAuthenticatedUser,
  getCustomerProfileByAccountId,
} from "@/features/auth/auth.service";
import { getCustomerAddressesByCustomerId } from "@/features/customers/customer-address.service";
import type { CustomerAddress } from "@/types/customer.types";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sổ địa chỉ",
  description: "Quản lý địa chỉ giao hàng trong tài khoản Xéo Xọ của bạn.",
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

export default async function AccountAddressesRoute() {
  const supabase = await createClient();
  const authenticatedUser = await getAuthenticatedUser(supabase);
  const isAuthenticated = Boolean(authenticatedUser);
  let initialAddresses: CustomerAddress[] | undefined;

  if (authenticatedUser) {
    const customer = await getCustomerProfileByAccountId(authenticatedUser.id);

    if (customer?.customer_id) {
      initialAddresses = await getCustomerAddressesByCustomerId(
        Number(customer.customer_id),
      );
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
                { label: "Sổ địa chỉ" },
              ]}
            />

            <div className="mt-8 grid gap-8 lg:grid-cols-[20%_minmax(0,1fr)] lg:items-start">
              <aside className="lg:sticky lg:top-[180px]">
                <AccountNavigation
                  items={ACCOUNT_NAV_ITEMS}
                  activeHref={ROUTES.ACCOUNT_ADDRESSES}
                  variant="account"
                />
              </aside>

              <section className="rounded-[26px] bg-white px-6 py-8 shadow-[0_14px_40px_rgba(0,0,0,0.12)] md:px-10 md:py-10 xl:px-12 xl:py-12">
                <div className="flex flex-col gap-2">
                  <h1 className="text-[28px] font-extrabold leading-none md:text-[42px]">
                    Sổ địa chỉ
                  </h1>
                  <p className="text-sm font-medium text-foreground/72 md:text-lg">
                    Địa chỉ đã được cập nhật theo thông tin hành chính mới.
                  </p>
                </div>

                <FloralDivider className="mt-6" />

                <AccountAddressBook
                  isAuthenticated={isAuthenticated}
                  initialAddresses={initialAddresses}
                />

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
