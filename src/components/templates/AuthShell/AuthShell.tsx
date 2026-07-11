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
        "relative w-full overflow-hidden rounded-[24px] bg-background shadow-[0_18px_44px_rgba(0,0,0,0.18)]",
        className,
      )}
    >
      <div className="px-4 pb-5 pt-6 sm:px-6 sm:pb-7 sm:pt-8 md:px-10 md:pb-8 md:pt-9">
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
            className="h-auto w-[84px] sm:w-[92px] md:w-[98px]"
          />
        </Link>

        <h1 className="mt-3 max-w-[520px] text-[20px] font-extrabold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-[23px] md:text-[25px]">
          Vô số đặc quyền và quyền lợi mua sắm đang chờ bạn
        </h1>
        <p className="mt-3 text-xs font-light text-foreground sm:text-sm md:text-[13px]">
          Quyền lợi dành riêng cho bạn khi tham gia{" "}
          <span className="font-bold text-foreground">Xéo Hội</span>
        </p>

        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.line1}
              className="rounded-[4px] bg-cover bg-center p-[4px]"
              style={{ backgroundImage: "url(/images/header-line-up.png)" }}
            >
              <div className="flex min-h-[64px] items-center gap-3 bg-background px-3 py-2">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[4px] bg-background/90">
                  <Image
                    src={benefit.icon}
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden
                  />
                </div>
                <span className="text-sm font-bold leading-tight text-foreground md:text-[15px]">
                  {benefit.line1}
                  <br />
                  {benefit.line2}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm font-bold md:text-base">
          Đăng nhập hoặc đăng ký (miễn phí)
        </p>
        <div className="mt-2.5 flex gap-3">
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

        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm font-light text-foreground/70 md:text-base">
            Hoặc
          </span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        <div className="mt-3">{children}</div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold sm:text-sm">
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
      className="flex h-[46px] w-[46px] items-center justify-center rounded-[8px] border border-[#DB7A6A] bg-background transition-colors hover:bg-muted"
    >
      <Image src={icon} alt="" width={34} height={34} aria-hidden />
    </button>
  );
}
