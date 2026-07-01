import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTES } from "@/constants/routes";

const BENEFITS = [
  { icon: "/icons/freeship.svg", line1: "Ưu đãi", line2: "Độc quyền" },
  { icon: "/icons/gift.svg", line1: "Quà tặng", line2: "Giới hạn" },
  { icon: "/icons/event.svg", line1: "Sự kiện", line2: "Đặc biệt" },
];

// Khung chung cho trang đăng nhập/đăng ký: logo, tiêu đề, thẻ đặc quyền,
// đăng nhập mạng xã hội và dải phân cách "Hoặc". Phần form + footer được truyền vào.
export function AuthShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-[720px] rounded-lg bg-background px-6 py-5 shadow-sm sm:px-8 sm:py-6">
        <Link
          href={ROUTES.HOME}
          aria-label="XÉO XỌ — Trang chủ"
          className="inline-block"
        >
          <Image src="/images/logohong.png" alt="XÉO XỌ" width={110} height={62} priority />
        </Link>

        <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">
          Vô số đặc quyền và quyền lợi mua sắm đang chờ bạn
        </h1>
        <p className="mt-2 text-sm font-light text-foreground/70">
          Quyền lợi dành riêng cho bạn khi tham gia{" "}
          <span className="font-bold text-foreground">Xéo Hội</span>
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.line1}
              className="flex items-center gap-2 rounded-md border-[3px] border-[#E8663C] bg-background p-2"
            >
              <Image src={benefit.icon} alt="" width={32} height={32} aria-hidden />
              <span className="text-sm font-bold leading-tight">
                {benefit.line1}
                <br />
                {benefit.line2}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-base font-bold">Đăng nhập hoặc đăng ký (miễn phí)</p>
        <div className="mt-2 flex gap-3">
          <SocialButton icon="/icons/google-color.svg" label="Đăng nhập với Google" />
          <SocialButton icon="/icons/facebook-color.svg" label="Đăng nhập với Facebook" />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <span className="text-base font-medium text-foreground/70">Hoặc</span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        <div className="mt-4">{children}</div>

        <div className="mt-4 flex items-center justify-between text-sm font-bold underline underline-offset-4">
          {footer}
        </div>
      </div>
    </main>
  );
}

function SocialButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted"
    >
      <Image src={icon} alt="" width={26} height={26} aria-hidden />
    </button>
  );
}
