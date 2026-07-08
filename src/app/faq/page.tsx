import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import {
  AccountNavigation,
  type AccountNavItem,
} from "@/components/organisms/AccountNavigation/AccountNavigation";
import { PolicyClosingNote } from "@/components/organisms/PolicyClosingNote";
import {
  PolicyFaqAccordion,
  type PolicyFaqAccordionItem,
} from "@/components/organisms/PolicyFaqAccordion";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const FAQ_NAV_ITEMS: AccountNavItem[] = [
  { label: "Hồ sơ thông tin", href: ROUTES.ACCOUNT_PROFILE },
  { label: "Lịch sử mua hàng", href: ROUTES.ACCOUNT_ORDERS },
  { label: "Quản lý lịch hẹn", href: ROUTES.APPOINTMENT },
  { label: "Sổ địa chỉ", href: ROUTES.ACCOUNT_ADDRESSES },
  { label: "Đánh giá và phản hồi" },
  { label: "Câu hỏi thường gặp", href: ROUTES.FAQ_ACCOUNT },
  { label: "Đăng xuất", action: "logout" },
];

const FAQ_ITEMS: PolicyFaqAccordionItem[] = [
  {
    id: "find-products",
    question: "Làm thế nào để tìm sản phẩm phù hợp trên website Xéo Xọ?",
    answer:
      "Khách hàng có thể nhập từ khóa vào ô tìm kiếm hoặc chọn danh mục sản phẩm trên thanh điều hướng. Tại trang danh sách sản phẩm, khách hàng có thể lọc theo màu sắc, kích thước, khoảng giá, bộ sưu tập và sắp xếp theo sản phẩm mới, giá hoặc mức độ bán chạy.",
  },
  {
    id: "virtual-fit",
    question: "Virtual Fit hoạt động như thế nào?",
    answer:
      "Khách hàng nhập các chỉ số như chiều cao, cân nặng, vòng ngực, vòng eo và vòng hông. Hệ thống sẽ tạo mô hình có vóc dáng tương ứng, mô phỏng sản phẩm và hiển thị thông tin tham khảo về độ dài, dáng mặc và mức độ vừa vặn dự kiến.",
  },
  {
    id: "size-recommendation",
    question: "Làm thế nào để được gợi ý size phù hợp?",
    answer:
      "Khách hàng nhập chiều cao, cân nặng và các số đo cần thiết. Hệ thống đối chiếu thông tin với bảng size của sản phẩm để đề xuất size phù hợp nhất. Kết quả chỉ mang tính hỗ trợ nên khách hàng vẫn có thể lựa chọn size khác.",
  },
  {
    id: "personal-color",
    question: "Tư vấn màu sắc Personal Color là gì?",
    answer:
      "Đây là bài quiz giúp xác định palette màu phù hợp dựa trên các đặc điểm như sắc độ da, màu tóc, màu tĩnh mạch cổ tay và phản ứng của da dưới ánh nắng. Sau khi hoàn thành, hệ thống hiển thị nhóm màu phù hợp và gợi ý các sản phẩm tương ứng.",
  },
  {
    id: "custom-order",
    question: "Xéo Xọ có hỗ trợ đặt sản phẩm theo số đo riêng không?",
    answer:
      "Có. Khách hàng có thể chọn chức năng đặt đồ custom tại trang chi tiết sản phẩm, sau đó nhập số đo và yêu cầu riêng. Nếu đã là thành viên và có số đo được lưu, khách hàng có thể sử dụng lại hoặc cập nhật số đo mới.",
  },
  {
    id: "appointment",
    question: "Tôi có thể đặt lịch để được đo trực tiếp không?",
    answer:
      "Có. Khách hàng chọn chức năng “Đặt lịch đo”, xem các lịch còn trống, nhập thông tin cá nhân và lựa chọn thời gian phù hợp. Sau khi đặt lịch thành công, hệ thống sẽ gửi email xác nhận.",
  },
  {
    id: "place-order",
    question: "Làm thế nào để đặt hàng tại Xéo Xọ?",
    answer:
      "Khách hàng chọn sản phẩm, số lượng, size và màu sắc nếu có, sau đó thêm sản phẩm vào giỏ hàng. Tại bước thanh toán, khách hàng kiểm tra thông tin nhận hàng, đồng ý với chính sách đổi hàng, chọn phương thức thanh toán và xác nhận đơn hàng.",
  },
  {
    id: "payment-methods",
    question: "Xéo Xọ hỗ trợ những phương thức thanh toán nào?",
    answer:
      "Theo chức năng hiện tại, khách hàng có thể chọn cổng thanh toán OnePay nội địa hoặc OnePay quốc tế. Sau khi thông tin hợp lệ, hệ thống hiển thị mã QR để khách hàng thực hiện thanh toán trong thời gian quy định.",
  },
  {
    id: "track-order",
    question: "Làm thế nào để theo dõi tình trạng đơn hàng?",
    answer:
      "Thành viên có thể đăng nhập và xem đơn hàng trong mục “Lịch sử đơn hàng”. Khách vãng lai sử dụng chức năng “Tra cứu đơn hàng”, nhập mã đơn cùng số điện thoại hoặc email đã sử dụng khi đặt hàng, sau đó xác thực bằng OTP.",
  },
  {
    id: "return-policy",
    question: "Chính sách đổi hàng của Xéo Xọ được áp dụng như thế nào?",
    answer:
      "Xéo Xọ hỗ trợ đổi size hoặc đổi sang mẫu có giá trị tương đương trong vòng 78 giờ kể từ khi thanh toán tại cửa hàng hoặc kể từ khi nhận hàng đối với đơn online. Sản phẩm phải còn nguyên trạng, chưa cắt tag và chưa qua sử dụng. Sản phẩm sale, phụ kiện và sản phẩm custom không được hỗ trợ đổi; chính sách này không áp dụng hoàn tiền.",
  },
];

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp",
  description:
    "Giải đáp những câu hỏi thường gặp về mua sắm, đặt lịch, thanh toán và theo dõi đơn hàng tại Xéo Xọ.",
};

function FloralDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-[5px] w-full bg-[length:100%_100%] bg-center bg-no-repeat",
        className,
      )}
      style={{ backgroundImage: "url(/images/strip-title-underline.png)" }}
    />
  );
}

type FaqPageProps = {
  searchParams?: Promise<{
    view?: string;
  }>;
};

export default async function FaqPage({ searchParams }: FaqPageProps) {
  const resolvedSearchParams = await searchParams;
  const isAccountView = resolvedSearchParams?.view === "account";

  if (isAccountView) {
    return <AccountFaqPage />;
  }

  return <PublicFaqPage />;
}

function AccountFaqPage() {
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
                { label: "Câu hỏi thường gặp" },
              ]}
            />

            <div className="mt-8 grid gap-8 xl:grid-cols-[290px_minmax(0,1fr)] xl:items-start">
              <aside className="xl:sticky xl:top-[180px]">
                <AccountNavigation
                  items={FAQ_NAV_ITEMS}
                  activeHref={ROUTES.FAQ_ACCOUNT}
                  variant="account"
                />
              </aside>

              <section className="rounded-[26px] bg-white px-6 py-8 shadow-[0_14px_40px_rgba(0,0,0,0.12)] md:px-10 md:py-10 xl:px-12 xl:py-12">
                <div className="flex flex-col gap-5">
                  <h1 className="text-[28px] font-extrabold leading-none md:text-[42px]">
                    Câu hỏi thường gặp
                  </h1>
                  <FloralDivider />
                </div>

                <div className="mt-8">
                  <PolicyFaqAccordion
                    items={FAQ_ITEMS}
                    defaultOpenId={FAQ_ITEMS[0]?.id ?? null}
                    className="space-y-7 md:space-y-[26px]"
                  />
                </div>
              </section>
            </div>
          </div>
        </section>

        <PolicyClosingNote />
      </div>
    </SiteLayout>
  );
}

function PublicFaqPage() {
  return (
    <SiteLayout>
      <div className="bg-background">
        <div className="site-container pb-5 pt-12">
          <Breadcrumbs
            items={[
              {
                label: "",
                href: ROUTES.HOME,
                iconSrc: "/icons/home.svg",
                iconAlt: "Trang chủ",
              },
              { label: "Câu hỏi thường gặp" },
            ]}
          />
        </div>

        <section className="site-container flex flex-col items-center pb-8 pt-3 text-center md:pb-10">
          <h1 className="page-heading text-foreground">Câu hỏi thường gặp</h1>
          <Image
            src="/images/strip-title-underline.png"
            alt=""
            width={438}
            height={5}
            className="mt-[10px] h-[5px] w-full max-w-[438px]"
            aria-hidden
          />
        </section>

        <section className="site-container pb-14 md:pb-16">
          <div className="mx-auto w-full max-w-[1320px]">
            <PolicyFaqAccordion
              items={FAQ_ITEMS}
              defaultOpenId={FAQ_ITEMS[0]?.id ?? null}
              className="space-y-7 md:space-y-[26px]"
            />
          </div>
        </section>

        <PolicyClosingNote />
      </div>
    </SiteLayout>
  );
}
