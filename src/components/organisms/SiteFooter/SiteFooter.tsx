import Image from "next/image";
import Link from "next/link";
import { AuthModalLink } from "@/components/atoms/AuthModalLink";
import { ROUTES } from "@/constants/routes";

type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

const LINK_COLUMNS: FooterColumn[] = [
  {
    title: "Xéo Hội",
    links: [
      { label: "Đăng ký thành viên", href: ROUTES.REGISTER },
      { label: "Ưu đãi & đặc quyền", href: ROUTES.BENEFITS },
    ],
  },
  {
    title: "Về Xéo Xọ",
    links: [
      { label: "Câu chuyện thương hiệu", href: ROUTES.ABOUT },
      { label: "Chất liệu", href: `${ROUTES.ABOUT}#materials` },
      { label: "Blog", href: ROUTES.BLOG },
    ],
  },
  {
    title: "Công ty",
    links: [
      { label: "Tuyển dụng", href: ROUTES.CAREERS },
      { label: "Đăng ký bản quyền", href: ROUTES.COPYRIGHT },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Hướng dẫn chọn size", href: ROUTES.SIZE_GUIDE },
      { label: "Hướng dẫn giặt là", href: ROUTES.POLICY("care") },
      { label: "Hỏi đáp - FAQs", href: ROUTES.FAQ },
    ],
  },
];

const POLICY_LINKS = [
  { label: "Chính sách khách hàng", href: ROUTES.POLICY("customer") },
  { label: "Chính sách đổi trả", href: ROUTES.POLICY("return") },
  { label: "Chính sách kiểm hàng", href: ROUTES.POLICY("inspection") },
  { label: "Chính sách vận chuyển", href: ROUTES.POLICY("shipping") },
  { label: "Chính sách thanh toán", href: ROUTES.POLICY("payment") },
  { label: "Chính sách bảo mật", href: ROUTES.POLICY("privacy") },
];

const STORES = [
  "06 Nam Ngư, Phường Hoàn Kiếm, Hà Nội.",
  "43 Đặng Thị Nhu, Phường Sài Gòn, TP. Hồ Chí Minh.",
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    icon: "/icons/facebook.svg",
    href: "https://www.facebook.com/",
  },
  {
    label: "TikTok",
    icon: "/icons/tiktok.svg",
    href: "https://www.tiktok.com/",
  },
  {
    label: "Instagram",
    icon: "/icons/instagram.svg",
    href: "https://www.instagram.com/",
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid max-w-site gap-x-10 gap-y-6 px-6 py-[var(--footer-block-py)] lg:grid-cols-[minmax(0,1fr)_minmax(320px,430px)] xl:px-gutter">
        <div className="flex max-w-[1040px] flex-col gap-[var(--footer-gap)]">
          <div className="flex flex-col gap-[10px]">
            <p className="text-heading-content font-medium leading-tight md:text-heading-section">
              <span className="font-extrabold">XÉO XỌ</span> lưu giữ vẻ đẹp Á
              Đông trong từng thiết kế
            </p>
            <p className="text-body font-light text-white/80">
              Theo dõi Xéo Xọ để cập nhật bộ sưu tập mới, câu chuyện thiết kế và
              ưu đãi dành riêng cho khách hàng thân thiết.
            </p>
          </div>

          <Link
            href={ROUTES.COLLECTIONS}
            className="inline-flex w-fit items-center gap-[10px] rounded-pill border border-white px-6 py-3 text-button font-medium transition-colors hover:bg-white hover:text-black"
          >
            Khám phá bộ sưu tập
            <Image
              src="/icons/arrow-right.svg"
              alt=""
              width={30}
              height={16}
              aria-hidden
              className="brightness-0 invert"
            />
          </Link>

          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="transition-opacity hover:opacity-70"
              >
                <Image
                  src={social.icon}
                  alt={social.label}
                  width={50}
                  height={50}
                  className="h-[var(--footer-social-icon-size)] w-[var(--footer-social-icon-size)]"
                />
              </a>
            ))}
          </div>
        </div>

        <div className="flex w-full max-w-[430px] flex-col gap-[var(--footer-gap)] lg:justify-self-end">
          <ContactRow
            icon="/icons/phone.svg"
            label="Hotline"
            value="039 412 6556"
          />
          <ContactRow
            icon="/icons/email.svg"
            label="Email"
            value="info@xeoxo.com"
          />
        </div>
      </div>

      <div className="mx-auto h-px max-w-site bg-white/20" />

      <div className="mx-auto grid max-w-site gap-x-10 gap-y-6 px-6 py-[calc(var(--footer-block-py)/2)] lg:grid-cols-[1.6fr_1fr_1fr] xl:px-gutter">
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-[auto_auto]">
          {LINK_COLUMNS.map((column) => (
            <FooterLinkColumn key={column.title} column={column} />
          ))}
        </div>

        <div className="flex flex-col gap-[10px]">
          <h3 className="text-heading-content-sm font-bold">Chính sách</h3>
          {POLICY_LINKS.map((policy) => (
            <Link
              key={policy.label}
              href={policy.href}
              className="text-body font-light text-white/80 transition-colors hover:text-white"
            >
              {policy.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-[10px]">
          <h3 className="text-heading-content-sm font-bold">Hệ thống cửa hàng</h3>
          {STORES.map((address) => (
            <p key={address} className="text-body font-light text-white/80">
              {address}
            </p>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-site gap-x-10 gap-y-4 px-6 py-[calc(var(--footer-block-py)/2)] lg:grid-cols-[1.6fr_1fr_1fr] xl:px-gutter">
        <div className="flex flex-col gap-[10px] lg:col-span-2">
          <p className="text-body font-extrabold">
            © CÔNG TY TNHH MAI AN KIM VIỆT NAM
          </p>
          <p className="max-w-2xl text-body-sm font-light text-white/70">
            Mã số doanh nghiệp: 0110169383. Giấy chứng nhận đăng ký doanh nghiệp
            do Sở Kế hoạch và Đầu tư TP Hà Nội cấp lần đầu ngày 02/11/2022.
          </p>
        </div>

        <Image
          src="/icons/bocongthuong.png"
          alt="Đã thông báo Bộ Công Thương"
          width={180}
          height={65}
          className="h-16 w-auto object-contain"
        />
      </div>
    </footer>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-[25px]">
      <Image
        src={icon}
        alt=""
        width={80}
        height={80}
        aria-hidden
        className="h-[var(--footer-contact-icon-size)] w-[var(--footer-contact-icon-size)] brightness-0 invert"
      />
      <div className="flex flex-col gap-[5px]">
        <span className="text-body font-medium text-white/80">{label}</span>
        <span className="text-heading-content font-medium md:text-heading-section">
          {value}
        </span>
      </div>
    </div>
  );
}

function FooterLinkColumn({ column }: { column: FooterColumn }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <h3 className="text-heading-content-sm font-bold">{column.title}</h3>
      {column.links.map((link) =>
        link.href === ROUTES.REGISTER ? (
          <AuthModalLink
            key={link.label}
            mode="register"
            className="text-body font-light text-white/80 transition-colors hover:text-white"
          >
            {link.label}
          </AuthModalLink>
        ) : (
          <Link
            key={link.label}
            href={link.href}
            className="text-body font-light text-white/80 transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
  );
}
