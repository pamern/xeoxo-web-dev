import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import {
  AccountNavigation,
  type AccountNavItem,
} from "@/components/organisms/AccountNavigation/AccountNavigation";
import { PolicyClosingNote } from "@/components/organisms/PolicyClosingNote";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerReviews } from "@/features/review/review.service";
import { AccountReviewsContent } from "@/components/organisms/AccountReviewsContent/AccountReviewsContent";

export const metadata: Metadata = {
  title: "Đánh giá và phản hồi",
  description: "Quản lý đánh giá sản phẩm và phản hồi của bạn tại XÉO XỌ.",
};

export const dynamic = "force-dynamic";

const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  { label: "Hồ sơ thông tin", href: ROUTES.ACCOUNT_PROFILE },
  { label: "Lịch sử mua hàng", href: ROUTES.ACCOUNT_ORDERS },
  { label: "Quản lý lịch hẹn", href: ROUTES.APPOINTMENT },
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
        "h-[4px] w-full bg-[url('/images/header-line-up.png')] bg-[length:100%_100%] bg-center bg-no-repeat",
        className,
      )}
    />
  );
}

export default async function AccountReviewsRoute() {
  const supabase = await createClient();
  const admin = createAdminClient();

  // 1. Get logged-in user session
  const { data: { user } } = await supabase.auth.getUser();
  let initialReviews: any[] = [];
  let customerName = "Khách hàng";

  if (user) {
    // 2. Fetch corresponding customer
    const { data: customer, error: custErr } = await admin
      .schema("iam")
      .from("customer")
      .select("customer_id, customer_name")
      .eq("account_id", user.id)
      .maybeSingle();

    if (custErr) throw new Error(custErr.message);

    if (customer) {
      customerName = customer.customer_name || "Khách hàng XÉO XỌ";
      // 3. Fetch reviews from feature service
      const fetchedReviews = await getCustomerReviews(Number(customer.customer_id));
      initialReviews = fetchedReviews.map((r) => ({
        ...r,
        customer_name: customerName,
      }));
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
                { label: "Đánh giá và phản hồi" },
              ]}
            />

            <div className="account-page-grid">
              <aside className="account-sticky-rail">
                <AccountNavigation
                  items={ACCOUNT_NAV_ITEMS}
                  activeHref={ROUTES.ACCOUNT_REVIEWS}
                  variant="account"
                />
              </aside>

              <section className="rounded-[14px] bg-white px-6 py-8 shadow-[0_10px_34px_rgba(0,0,0,0.14)] md:px-9 md:py-9 xl:px-10 xl:py-10">
                <div className="flex flex-col gap-4">
                  <h1 className="text-[28px] font-extrabold leading-none md:text-[34px]">
                    Đánh giá và phản hồi
                  </h1>
                  <FloralDivider />
                </div>

                <AccountReviewsContent
                  initialReviews={initialReviews}
                  customerName={customerName}
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
