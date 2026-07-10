import type { Metadata } from "next";
import { AppointmentLookupExperience } from "@/components/organisms/AppointmentLookupExperience";
import { SiteLayout } from "@/components/templates/SiteLayout";

export const metadata: Metadata = {
  title: "Tra cứu lịch hẹn",
  description:
    "Kiểm tra nhanh thông tin lịch hẹn Xéo Xọ bằng mã lịch hẹn và số điện thoại hoặc email đã đặt lịch.",
};

type AppointmentPageProps = {
  searchParams?: Promise<{
    appointment_code?: string;
    appointment_id?: string;
    contact?: string;
  }>;
};

export default async function AppointmentPage({
  searchParams,
}: AppointmentPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <SiteLayout>
      <div className="bg-background">
        <section className="mx-auto w-full max-w-site px-6 py-8 xl:px-[100px] xl:py-10">
          <AppointmentLookupExperience
            initialValues={{
              appointment_code:
                resolvedSearchParams?.appointment_code ??
                resolvedSearchParams?.appointment_id,
              contact: resolvedSearchParams?.contact,
            }}
          />
        </section>
      </div>
    </SiteLayout>
  );
}
