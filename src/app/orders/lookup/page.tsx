import type { Metadata } from "next";
import { OrderLookupExperience } from "@/components/organisms/OrderLookupExperience";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { PolicyClosingNote } from "@/components/organisms/PolicyClosingNote";

export const metadata: Metadata = {
  title: "Tra cứu đơn hàng",
  description:
    "Kiểm tra nhanh trạng thái đơn hàng Xéo Xọ bằng mã đơn và số điện thoại hoặc email đã đặt hàng.",
};

type OrderLookupPageProps = {
  searchParams?: Promise<{
    contact?: string;
    order_code?: string;
  }>;
};

export default async function OrderLookupPage({
  searchParams,
}: OrderLookupPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <SiteLayout>
      <div className="bg-background">
        <section className="mx-auto w-full max-w-site px-6 py-8 xl:px-[100px] xl:py-10">
          <OrderLookupExperience
            initialValues={{
              contact: resolvedSearchParams?.contact,
              order_code: resolvedSearchParams?.order_code,
            }}
          />
        </section>

        <PolicyClosingNote />
      </div>
    </SiteLayout>
  );
}
