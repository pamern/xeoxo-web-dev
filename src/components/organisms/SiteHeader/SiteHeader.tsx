"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useCartStore } from "@/stores/cart.store";

// Utility bar chia 2 cụm: trái (khám phá) và phải (tài khoản/ngôn ngữ).
const UTILITY_LEFT = [
  { label: "Về XÉO XỌ", href: ROUTES.ABOUT },
  { label: "NEW ARRIVALS", href: ROUTES.COLLECTIONS },
  { label: "STARS in XÉO XỌ", href: ROUTES.COLLECTIONS },
];

const UTILITY_RIGHT = [
  { label: "Xéo Hội", href: ROUTES.SIGNUP, icon: "/icons/star.svg" },
  { label: "Cửa hàng", href: ROUTES.COLLECTIONS },
  { label: "Blog", href: ROUTES.COLLECTIONS },
  { label: "CSKH", href: ROUTES.POLICY },
  { label: "Đăng nhập", href: ROUTES.LOGIN },
];

const MAIN_NAV = [
  { label: "NỮ", href: ROUTES.CATALOG_WOMEN },
  { label: "NAM", href: ROUTES.CATALOG_MEN },
  { label: "TRẺ EM", href: ROUTES.CATALOG_KIDS },
  { label: "ÁO DÀI", href: `${ROUTES.CATALOG_WOMEN}#ao-dai-nu` },
  { label: "BỘ SƯU TẬP", href: ROUTES.COLLECTIONS },
];

export function SiteHeader() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.totalQuantity());
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      {/* Utility bar — nền là lát trên của dải texture */}
      <div
        className="relative hidden bg-black bg-[length:100%_auto] bg-top text-white lg:block"
        style={{ backgroundImage: "url(/images/brand/header-band.png)" }}
      >
        <div className="mx-auto flex h-10 max-w-site items-center justify-between px-6 text-base xl:px-[100px]">
          <UtilityGroup links={UTILITY_LEFT} />
          <div className="flex items-center gap-3">
            <UtilityGroup links={UTILITY_RIGHT} />
            <span aria-hidden className="h-[22px] w-px bg-white/60" />
            <button type="button" className="flex items-center gap-2 font-bold">
              <Image src="/icons/flag-vn.svg" alt="" width={24} height={18} aria-hidden />
              VN
              <span aria-hidden className="text-[10px]">▾</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div>
        <div className="mx-auto flex max-w-site items-center justify-between gap-4 px-6 py-[10px] xl:px-[100px]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Mở menu"
              className="lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <MenuIcon open={mobileOpen} />
            </button>
            <Link href={ROUTES.HOME} aria-label="XÉO XỌ — Trang chủ" className="block">
              <Image
                src="/images/brand/logo.png"
                alt="XÉO XỌ"
                width={206}
                height={84}
                priority
                className="h-[88px] w-auto object-contain lg:h-[110px]"
              />
            </Link>
          </div>

          <nav aria-label="Danh mục chính" className="hidden items-center gap-10 lg:flex">
            {MAIN_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "text-[22px] transition-colors hover:text-foreground/60",
                    active && "underline underline-offset-8"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <label className="hidden items-center gap-3 rounded-[30px] border-2 border-[#8f8f8f] py-2.5 pl-5 pr-2.5 md:flex">
              <span className="sr-only">Tìm kiếm sản phẩm</span>
              <input
                type="search"
                placeholder="Tìm kiếm..."
                className="w-32 bg-transparent text-base font-light text-foreground outline-none placeholder:text-[#8f8f8f]"
              />
              <Image src="/icons/search.svg" alt="" width={18} height={18} aria-hidden />
            </label>
            <Link href={ROUTES.LOGIN} aria-label="Tài khoản">
              <Image src="/icons/account.svg" alt="" width={36} height={36} aria-hidden />
            </Link>
            <Link href={ROUTES.CART} aria-label="Giỏ hàng" className="relative">
              <Image src="/icons/cart.svg" alt="" width={36} height={36} aria-hidden />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          aria-label="Danh mục di động"
          className="border-b border-border bg-background lg:hidden"
        >
          <ul className="mx-auto flex max-w-site flex-col px-6">
            {[...MAIN_NAV, ...UTILITY_LEFT, ...UTILITY_RIGHT].map((item) => (
              <li key={item.label} className="border-b border-border last:border-0">
                <Link
                  href={item.href}
                  className="block py-4 text-base"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function UtilityGroup({
  links,
}: {
  links: { label: string; href: string; icon?: string }[];
}) {
  return (
    <div className="flex items-center gap-3">
      {links.map((link, index) => (
        <span key={link.label} className="flex items-center gap-3">
          <Link href={link.href} className="flex items-center gap-2 transition-opacity hover:opacity-70">
            {link.icon && <Image src={link.icon} alt="" width={24} height={24} aria-hidden />}
            {link.label}
          </Link>
          {index < links.length - 1 && <span aria-hidden className="h-[22px] w-px bg-white/60" />}
        </span>
      ))}
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="flex h-6 w-6 flex-col items-center justify-center gap-1.5">
      <span
        className={cn(
          "h-0.5 w-6 bg-foreground transition-transform",
          open && "translate-y-2 rotate-45"
        )}
      />
      <span className={cn("h-0.5 w-6 bg-foreground transition-opacity", open && "opacity-0")} />
      <span
        className={cn(
          "h-0.5 w-6 bg-foreground transition-transform",
          open && "-translate-y-2 -rotate-45"
        )}
      />
    </span>
  );
}
