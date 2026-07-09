"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
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
  className,
  onGoogleClick,
  onFacebookClick,
}: {
  children: ReactNode;
  footer: ReactNode;
  className?: string;
  onGoogleClick?: () => void;
  onFacebookClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[32px] bg-background shadow-[0_20px_60px_rgba(0,0,0,0.18)]",
        className,
      )}
    >
      <div className="px-5 pb-7 pt-9 sm:px-8 sm:pb-9 sm:pt-12 md:px-[56px] md:pb-11 md:pt-[54px]">
        <Link
          href={ROUTES.HOME}
          aria-label="XÉO XỌ — Trang chủ"
          className="inline-block"
        >
          <Image
            src="/images/logohong.png"
            alt="XÉO XỌ"
            width={138}
            height={82}
            priority
            className="h-auto w-[118px] sm:w-[128px] md:w-[138px]"
          />
        </Link>

        <h1 className="mt-4 max-w-[680px] text-[28px] font-extrabold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-[32px] md:text-[36px]">
          Vô số đặc quyền và quyền lợi mua sắm đang chờ bạn
        </h1>
        <p className="mt-4 text-sm font-light text-foreground sm:text-base md:text-[18px]">
          Quyền lợi dành riêng cho bạn khi tham gia{" "}
          <span className="font-bold text-foreground">Xéo Hội</span>
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.line1}
              className="rounded-[4px] bg-cover bg-center p-[6px]"
              style={{ backgroundImage: "url(/images/header-line-up.png)" }}
            >
              <div className="flex min-h-[88px] items-center gap-4 bg-background px-4 py-3">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[4px] bg-background/90">
                  <Image
                    src={benefit.icon}
                    alt=""
                    width={34}
                    height={34}
                    aria-hidden
                  />
                </div>
                <span className="text-lg font-bold leading-tight text-foreground">
                  {benefit.line1}
                  <br />
                  {benefit.line2}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-lg font-bold">
          Đăng nhập hoặc đăng ký (miễn phí)
        </p>
        <div className="mt-3 flex gap-4">
          <SocialButton
            icon="/icons/google-color.svg"
            label="Đăng nhập với Google"
            onClick={onGoogleClick}
          />
          <SocialButton
            icon="/icons/facebook-color.svg"
            label="Đăng nhập với Facebook"
            onClick={onFacebookClick}
          />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="text-lg font-light text-foreground/70">Hoặc</span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        <div className="mt-4">{children}</div>

        <div className="mt-4 flex items-center justify-between gap-4 text-sm font-bold sm:text-lg">
          {footer}
        </div>
      </div>
    </div>
  );
}

function SocialButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-[64px] w-[64px] items-center justify-center rounded-[10px] border border-[#DB7A6A] bg-background transition-colors hover:bg-muted"
    >
      <Image src={icon} alt="" width={48} height={48} aria-hidden />
    </button>
  );
}
