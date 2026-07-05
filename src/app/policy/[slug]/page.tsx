import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteLayout } from "@/components/templates/SiteLayout";

type Params = { slug: string };

const POLICIES: Record<string, { title: string; body: string[] }> = {
  customer: {
    title: "Chính sách khách hàng",
    body: [
      "XÉO XỌ luôn sẵn sàng tiếp nhận và hỗ trợ mọi yêu cầu của khách hàng trong suốt quá trình mua sắm.",
      "Thông tin chi tiết sẽ được cập nhật theo chính sách vận hành chính thức của thương hiệu.",
    ],
  },
  return: {
    title: "Chính sách đổi trả",
    body: [
      "Sản phẩm được hỗ trợ đổi trả theo các điều kiện và thời gian quy định.",
      "Vui lòng giữ sản phẩm còn nguyên tình trạng ban đầu để được hỗ trợ nhanh chóng và thuận tiện nhất.",
    ],
  },
  inspection: {
    title: "Chính sách kiểm hàng",
    body: [
      "Khách hàng có thể kiểm tra sản phẩm khi nhận hàng theo quy định của đơn vị vận chuyển.",
    ],
  },
  shipping: {
    title: "Chính sách vận chuyển",
    body: [
      "Đơn hàng sẽ được giao đến địa chỉ khách hàng cung cấp trong quá trình đặt hàng.",
    ],
  },
  payment: {
    title: "Chính sách thanh toán",
    body: [
      "XÉO XỌ hỗ trợ các phương thức thanh toán được hiển thị tại bước thanh toán.",
    ],
  },
  privacy: {
    title: "Chính sách bảo mật",
    body: [
      "Thông tin cá nhân của khách hàng chỉ được sử dụng nhằm phục vụ quá trình xử lý đơn hàng và chăm sóc khách hàng theo quy định.",
    ],
  },
  care: {
    title: "Hướng dẫn giặt là",
    body: [
      "Nên giặt nhẹ, tránh chà xát mạnh và phơi ở nơi thoáng mát để giữ chất liệu luôn bền đẹp.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];

  if (!policy) {
    return { title: "Không tìm thấy chính sách" };
  }

  return { title: policy.title };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const policy = POLICIES[slug];

  if (!policy) {
    notFound();
  }

  return (
    <SiteLayout>
      <article className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-medium uppercase md:text-4xl">
          {policy.title}
        </h1>

        <div className="space-y-4 text-body-lg font-light leading-relaxed text-foreground/80">
          {policy.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </SiteLayout>
  );
}