import type { Metadata } from "next";
import { OrderLookupExperience } from "@/components/organisms/OrderLookupExperience";
import { SiteLayout } from "@/components/templates/SiteLayout";

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

        <section className="mx-auto w-full max-w-site px-6 pb-12 pt-2 xl:px-[100px] xl:pb-16">
          <div className="mx-auto max-w-[1529px]">
            <div
              aria-hidden="true"
              className="h-[5px] w-full max-w-[438px] bg-[length:100%_100%] bg-center bg-no-repeat"
              style={{ backgroundImage: "url(/images/header-line-up.png)" }}
            />
            <div className="py-5 md:py-[20px]">
              <h2 className="text-[34px] font-bold uppercase leading-[1.1] text-black md:text-[50px]">
                Xéo xọ luôn lắng nghe bạn
              </h2>
              <p className="mt-3 max-w-[1149px] font-serif text-[18px] italic leading-[1.55] text-black md:text-[22px]">
                Chúng tôi luôn trân trọng và mong đợi nhận được mọi ý kiến đóng
                góp từ khách hàng để có thể nâng cấp trải nghiệm dịch vụ và sản
                phẩm tốt hơn nữa.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="h-[5px] w-full max-w-[438px] bg-[length:100%_100%] bg-center bg-no-repeat"
              style={{ backgroundImage: "url(/images/header-line-up.png)" }}
            />
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
