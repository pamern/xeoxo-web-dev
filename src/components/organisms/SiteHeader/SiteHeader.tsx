"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { AuthModal } from "@/components/organisms/AuthModal";
import { useCartDrawer } from "@/components/providers/CartDrawerProvider";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useLatestCollectionHighlight } from "@/hooks/useLatestCollectionHighlight";
import type { CategoryNavItem } from "@/features/homepage/homepage.service";
import type { LatestCollectionHighlight } from "@/types/collection-highlight.types";

type AuthMode = "login" | "register";
type UtilityLink = {
  label: string;
  href?: string;
  icon?: string;
  authMode?: AuthMode;
};

// Utility bar chia 2 cụm: trái (khám phá) và phải (tài khoản/ngôn ngữ).
const UTILITY_LEFT: UtilityLink[] = [
  { label: "Về XÉO XỌ", href: ROUTES.ABOUT },
  { label: "NEW ARRIVALS", href: ROUTES.COLLECTIONS },
  { label: "STARS in XÉO XỌ", href: ROUTES.COLLECTIONS },
];

const UTILITY_RIGHT: UtilityLink[] = [
  { label: "Xéo Hội", icon: "/icons/star-club.svg", authMode: "register" },
  { label: "Cửa hàng", href: ROUTES.COLLECTIONS },
  { label: "Blog", href: ROUTES.COLLECTIONS },
  { label: "CSKH", href: ROUTES.POLICIES },
  { label: "Đăng nhập", authMode: "login" },
];

const MAIN_NAV: UtilityLink[] = [
  { label: "NỮ", href: ROUTES.CATALOG_WOMEN },
  { label: "NAM", href: ROUTES.CATALOG_MEN },
  { label: "TRẺ EM", href: ROUTES.CATALOG_KIDS },
  { label: "ÁO DÀI", href: ROUTES.CATALOG_AO_DAI },
  { label: "BỘ SƯU TẬP", href: ROUTES.COLLECTIONS },
];

export function SiteHeader({
  womenCategories = [],
  menCategories = [],
  aoDaiCategories = [],
}: {
  womenCategories?: CategoryNavItem[];
  menCategories?: CategoryNavItem[];
  aoDaiCategories?: CategoryNavItem[];
}) {
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart } = useCart();
  const cartCount = cart.total_quantity;
  const auth = useAuth();
  const latestCollectionHighlight = useLatestCollectionHighlight();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountSidebarOpen, setAccountSidebarOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthMode | null>(null);
  const { openDrawer: openCartDrawer } = useCartDrawer();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const CATEGORY_MENU_BY_HREF: Record<string, CategoryNavItem[]> = {
    [ROUTES.CATALOG_WOMEN]: womenCategories,
    [ROUTES.CATALOG_MEN]: menCategories,
    [ROUTES.CATALOG_AO_DAI]: aoDaiCategories,
  };
  const CATEGORY_MENU_BY_LABEL: Record<string, CategoryNavItem[]> = {
    NỮ: womenCategories,
    NAM: menCategories,
  };
  const authMode = searchParams.get("auth");
  const activeAuthMode =
    authMode === "login" || authMode === "register" ? authMode : null;

  useEffect(() => {
    function syncHeaderHeight() {
      const nextHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${Math.round(nextHeight)}px`,
      );
    }

    syncHeaderHeight();

    const headerElement = headerRef.current;
    const observer =
      typeof ResizeObserver !== "undefined" && headerElement
        ? new ResizeObserver(() => {
            syncHeaderHeight();
          })
        : null;

    if (headerElement && observer) {
      observer.observe(headerElement);
    }

    window.addEventListener("resize", syncHeaderHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncHeaderHeight);
    };
  }, []);

  useEffect(() => {
    setModalMode(activeAuthMode);
  }, [activeAuthMode]);

  useEffect(() => {
    if (!accountSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountSidebarOpen]);

  function updateAuthQuery(mode: AuthMode | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("authError");
    params.delete("authDetail");

    if (mode) {
      params.set("auth", mode);
    } else {
      params.delete("auth");
    }

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;

    router.replace(nextUrl, { scroll: false });
  }

  function openAuthModal(mode: AuthMode) {
    setMobileOpen(false);
    setAccountSidebarOpen(false);
    setModalMode(mode);
    updateAuthQuery(mode);
  }

  const utilityRightLinks: UtilityLink[] = auth.isAuthenticated
    ? [
        {
          label: "Xéo Hội",
          href: ROUTES.MEMBERSHIP,
          icon: "/icons/star-club.svg",
        },
        { label: "Cửa hàng", href: ROUTES.COLLECTIONS },
        { label: "Blog", href: ROUTES.COLLECTIONS },
        { label: "CSKH", href: ROUTES.POLICIES },
      ]
    : UTILITY_RIGHT;

  const latestCollectionHref = latestCollectionHighlight
    ? ROUTES.COLLECTION(latestCollectionHighlight.slug)
    : ROUTES.COLLECTIONS;
  const latestCollectionImage =
    latestCollectionHighlight?.collectionImage || "/images/story-main.jpg";
  const latestCollectionImageAlt =
    latestCollectionHighlight?.collectionImageAlt || "Bộ sưu tập mới nhất";
  const latestProductImage =
    latestCollectionHighlight?.productImage || "/images/story-2.jpg";
  const latestProductImageAlt =
    latestCollectionHighlight?.productImageAlt ||
    "Sản phẩm trong bộ sưu tập mới nhất";
  const isProductDetailPage = pathname.startsWith("/products/");

  const accountLabel =
    auth.customer?.customer_name?.trim() ||
    auth.user?.fullName ||
    auth.user?.email ||
    "Tài khoản";
  const hasAccountMenu = Boolean(
    auth.user || auth.customer?.account_id || auth.customer?.customer_name,
  );

  function openAccountSidebar() {
    setAccountSidebarOpen(true);
  }

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "z-[140] w-full bg-background",
          isProductDetailPage ? "relative" : "fixed inset-x-0 top-0",
        )}
      >
        <div
          className="relative bg-black bg-[length:100%_auto] bg-top text-white"
          style={{ backgroundImage: "url(/images/header-line-up.png)" }}
        >
          <div className="mx-auto flex h-10 max-w-site items-center justify-between px-6 text-base xl:px-[100px]">
            <UtilityGroup links={UTILITY_LEFT} />
            <div className="flex items-center gap-3">
              <UtilityGroup
                links={utilityRightLinks}
                onOpenAuthModal={openAuthModal}
              />
              {hasAccountMenu && (
                <>
                  <span aria-hidden className="h-[22px] w-px bg-white/60" />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={openAccountSidebar}
                      className="flex max-w-[220px] items-center gap-2 font-bold transition-opacity hover:opacity-70"
                    >
                      <span className="truncate">{accountLabel}</span>
                      <span aria-hidden className="text-[10px]">
                        ▾
                      </span>
                    </button>
                  </div>
                </>
              )}
              <span aria-hidden className="h-[22px] w-px bg-white/60" />
              <button
                type="button"
                className="flex items-center gap-2 font-bold"
              >
                <Image
                  src="/icons/flag-vn.svg"
                  alt=""
                  width={24}
                  height={18}
                  aria-hidden
                />
                VN
                <span aria-hidden className="text-[10px]">
                  ▾
                </span>
              </button>
            </div>
          </div>
        </div>

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
              <Link
                href={ROUTES.HOME}
                aria-label="XÉO XỌ — Trang chủ"
                className="block"
              >
                <Image
                  src="/images/logohong.png"
                  alt="XÉO XỌ"
                  width={206}
                  height={84}
                  priority
                  className="h-[88px] w-auto object-contain lg:h-[110px]"
                />
              </Link>
            </div>

            <nav
              aria-label="Danh mục chính"
              className="hidden items-center gap-10 lg:flex"
            >
              {MAIN_NAV.map((item) => {
                const active = pathname === item.href;
                const categories = item.href
                  ? CATEGORY_MENU_BY_HREF[item.href]
                  : CATEGORY_MENU_BY_LABEL[item.label];
                const hasDropdown = Boolean(categories?.length);
                const dropdownAlignment =
                  item.href === ROUTES.CATALOG_WOMEN ||
                  item.href === ROUTES.CATALOG_MEN
                    ? "left-0"
                    : "left-1/2 -translate-x-1/2";

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() =>
                      hasDropdown && setHoveredNav(item.label)
                    }
                    onMouseLeave={() => hasDropdown && setHoveredNav(null)}
                  >
                    <Link
                      href={item.href!}
                      className={cn(
                        "text-[22px] transition-colors hover:text-foreground/60",
                        active && "underline underline-offset-8",
                      )}
                    >
                      {item.label}
                    </Link>

                    {hasDropdown && (
                      <div
                        className={cn(
                          "absolute top-full z-[90] w-[720px] max-w-[calc(100vw-48px)] pt-[14px]",
                          dropdownAlignment,
                          hoveredNav === item.label
                            ? "pointer-events-auto"
                            : "pointer-events-none",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-[16px] bg-background p-5 text-foreground shadow-[0_18px_38px_rgba(0,0,0,0.16)] transition-all duration-200",
                            hoveredNav === item.label
                              ? "translate-y-0 opacity-100"
                              : "-translate-y-2 opacity-0",
                          )}
                        >
                          <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                            {categories.map((category) => (
                              <Link
                                key={category.categoryId}
                                href={ROUTES.CATEGORY(category.categorySlug)}
                                className="block min-w-0 whitespace-nowrap text-[18px] leading-[1.25] transition-colors hover:text-foreground/60"
                                onClick={() => setHoveredNav(null)}
                              >
                                {category.categoryName}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
                <Image
                  src="/icons/search.svg"
                  alt=""
                  width={18}
                  height={18}
                  aria-hidden
                />
              </label>
              <div className="relative">
                <button
                  type="button"
                  aria-label={
                    hasAccountMenu ? "Tài khoản của bạn" : "Đăng nhập"
                  }
                  onClick={() =>
                    hasAccountMenu
                      ? openAccountSidebar()
                      : openAuthModal("login")
                  }
                  className="transition-opacity hover:opacity-70"
                >
                  <Image
                    src="/icons/account.svg"
                    alt=""
                    width={36}
                    height={36}
                    aria-hidden
                  />
                </button>

              </div>
              <button
                type="button"
                onClick={() => {
                  if (isProductDetailPage) {
                    router.push(ROUTES.CART);
                    return;
                  }
                  openCartDrawer();
                }}
                aria-label="Giỏ hàng"
                className="relative"
              >
                <Image
                  src="/icons/cart.svg"
                  alt=""
                  width={36}
                  height={36}
                  aria-hidden
                />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <nav
            aria-label="Danh mục di động"
            className="border-b border-border bg-background lg:hidden"
          >
            <ul className="mx-auto flex max-w-site flex-col px-6">
              {[...MAIN_NAV, ...UTILITY_LEFT, ...utilityRightLinks].map(
                (item) => (
                  <li
                    key={item.label}
                    className="border-b border-border last:border-0"
                  >
                    {item.authMode ? (
                      <button
                        type="button"
                        onClick={() => openAuthModal(item.authMode!)}
                        className="block w-full py-4 text-left text-base"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        href={item.href!}
                        className="block py-4 text-base"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ),
              )}
              {hasAccountMenu ? (
                <>
                  <li className="border-b border-border">
                    <Link
                      href={ROUTES.ACCOUNT_PROFILE}
                      className="block py-4 text-base"
                      onClick={() => setMobileOpen(false)}
                    >
                      Hồ sơ tài khoản
                    </Link>
                  </li>
                  <li className="border-b border-border">
                    <Link
                      href={ROUTES.ACCOUNT_ORDERS}
                      className="block py-4 text-base"
                      onClick={() => setMobileOpen(false)}
                    >
                      Đơn hàng của tôi
                    </Link>
                  </li>
                </>
              ) : null}
            </ul>
          </nav>
        )}
      </header>

      {modalMode && (
        <AuthModal
          mode={modalMode}
          onClose={() => {
            setModalMode(null);
            updateAuthQuery(null);
          }}
          onModeChange={openAuthModal}
        />
      )}
      {hasAccountMenu && accountSidebarOpen && (
        <AccountSidebar
          accountLabel={accountLabel}
          latestCollectionHighlight={latestCollectionHighlight}
          onClose={() => setAccountSidebarOpen(false)}
        />
      )}
    </>
  );
}

function UtilityGroup({
  links,
  onOpenAuthModal,
}: {
  links: UtilityLink[];
  onOpenAuthModal?: (mode: AuthMode) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {links.map((link, index) => (
        <span key={link.label} className="flex items-center gap-3">
          {link.authMode ? (
            <button
              type="button"
              onClick={() => onOpenAuthModal?.(link.authMode!)}
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
            >
              {link.icon && (
                <Image
                  src={link.icon}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                />
              )}
              {link.label}
            </button>
          ) : (
            <Link
              href={link.href!}
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
            >
              {link.icon && (
                <Image
                  src={link.icon}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                />
              )}
              {link.label}
            </Link>
          )}
          {index < links.length - 1 && (
            <span aria-hidden className="h-[22px] w-px bg-white/60" />
          )}
        </span>
      ))}
    </div>
  );
}

function AccountSidebar({
  accountLabel,
  latestCollectionHighlight,
  onClose,
}: {
  accountLabel: string;
  latestCollectionHighlight: LatestCollectionHighlight | null;
  onClose: () => void;
}) {
  const sidebarLinks: Array<{ label: string; href?: string }> = [
    { label: "Hồ sơ thông tin", href: ROUTES.ACCOUNT_PROFILE },
    { label: "Lịch sử đơn hàng", href: ROUTES.ACCOUNT_ORDERS },
    { label: "Quản lý lịch hẹn", href: ROUTES.ACCOUNT_APPOINTMENTS },
    { label: "Sổ địa chỉ", href: ROUTES.ACCOUNT_ADDRESSES },
    { label: "Đánh giá và phản hồi" },
    { label: "Chính sách chúng tôi", href: ROUTES.POLICIES },
  ] as const;
  const latestCollectionHref = latestCollectionHighlight
    ? ROUTES.COLLECTION(latestCollectionHighlight.slug)
    : ROUTES.COLLECTIONS;
  const latestCollectionImage =
    latestCollectionHighlight?.collectionImage || "/images/story-main.jpg";
  const latestCollectionImageAlt =
    latestCollectionHighlight?.collectionImageAlt || "Bộ sưu tập mới nhất";
  const latestProductImage =
    latestCollectionHighlight?.productImage || "/images/story-2.jpg";
  const latestProductImageAlt =
    latestCollectionHighlight?.productImageAlt ||
    "Sản phẩm trong bộ sưu tập mới nhất";

  return (
    <div className="fixed inset-0 z-[95]">
      <button
        type="button"
        aria-label="Đóng thanh thông tin tài khoản"
        onClick={onClose}
        className="absolute inset-0 bg-black/28"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[620px] flex-col bg-background shadow-[-18px_0_40px_rgba(0,0,0,0.16)]">
        <div className="flex-1 overflow-y-auto px-[30px] pb-12 pt-[68px]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[30px] font-medium leading-[1] text-foreground">
                xin chào,
              </p>
              <h2 className="mt-1 text-[48px] font-bold leading-[0.95] text-foreground [overflow-wrap:anywhere]">
                {accountLabel}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Đóng"
              onClick={onClose}
              className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-foreground/15 transition-colors hover:bg-muted"
            >
              <span
                aria-hidden
                className="text-[30px] leading-none text-foreground"
              >
                ×
              </span>
            </button>
          </div>

          <div
            className="mt-5 h-[5px] w-full bg-[length:100%_100%] bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/images/header-line-up.png)" }}
          />

          <section className="mt-6">
            <SidebarPromoCard
              href={latestCollectionHref}
              imageSrc={latestCollectionImage}
              imageAlt={latestCollectionImageAlt}
              imageClassName="object-cover [object-position:center_25%]"
              className="min-h-[168px]"
              overlayClassName="bg-[linear-gradient(90deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.18)_46%,rgba(0,0,0,0.16)_100%)]"
              contentClassName="px-5 pb-3 pt-6"
              title={
                <>
                  <span className="block text-[16px] font-light leading-none text-white">
                    Bộ sưu tập
                  </span>
                  <span className="mt-2 block text-[28px] font-bold leading-none text-white">
                    {latestCollectionHighlight?.name || "Thanh Xuân"}
                  </span>
                </>
              }
              actionLabel="Khám phá"
              actionClassName="min-h-[58px] min-w-[196px] border-white/90 bg-black/20 px-6 text-[20px] font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur-[10px] transition-colors hover:bg-black hover:text-white"
              onClick={onClose}
            />

            <SidebarPromoCard
              imageSrc={latestProductImage}
              imageAlt={latestProductImageAlt}
              imageClassName="object-cover [object-position:center_28%]"
              className="mt-5 min-h-[336px]"
              overlayClassName="bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.12)_42%,rgba(0,0,0,0.64)_100%)]"
              contentClassName="px-6 pb-10 pt-8"
              title={
                <>
                  <span className="block text-[15px] font-light leading-[1.2] text-white">
                    Sống với tinh thần thanh lịch
                  </span>
                  <span className="mt-2 block text-[27px] font-light leading-none text-white">
                    Tham gia <span className="font-bold">Xéo Hội</span>
                  </span>
                </>
              }
              footer={
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <Link
                    href={ROUTES.MEMBERSHIP}
                    onClick={onClose}
                    className="flex min-h-[58px] w-full items-center justify-center rounded-full border border-white/80 bg-[url('/images/bg-tham-gia-sidebar-account-btn.png')] bg-cover bg-center bg-no-repeat px-6 text-center text-[20px] font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all hover:scale-[0.99] hover:opacity-85"
                  >
                    Tham gia
                  </Link>
                  <Link
                    href={ROUTES.BENEFITS}
                    onClick={onClose}
                    className="flex min-h-[58px] w-full items-center justify-center whitespace-nowrap rounded-full border border-white/80 bg-transparent px-6 text-center text-[20px] font-medium text-white transition-colors hover:bg-black hover:text-white"
                  >
                    Tìm hiểu thêm
                  </Link>
                </div>
              }
              onClick={onClose}
            />
          </section>

          <nav
            className="mt-6 flex flex-col gap-5"
            aria-label="Thông tin tài khoản"
          >
            {sidebarLinks.map((item) => (
              <SidebarPillAction
                key={item.label}
                label={item.label}
                href={item.href}
                onClick={item.href ? onClose : undefined}
              />
            ))}
          </nav>
        </div>

        <div className="bg-black px-[30px] py-7 md:py-8">
          <Link
            href={ROUTES.ACCOUNT_PROFILE}
            className="flex items-center justify-center text-center text-[34px] font-bold leading-none text-white md:text-[38px]"
            onClick={onClose}
          >
            Đến Hồ sơ
          </Link>
        </div>
      </aside>
    </div>
  );
}

function SidebarPromoCard({
  href,
  imageSrc,
  imageAlt,
  imageClassName,
  title,
  actionLabel,
  footer,
  className,
  contentClassName,
  overlayClassName,
  actionClassName,
  onClick,
}: {
  href?: string;
  imageSrc: string;
  imageAlt: string;
  imageClassName?: string;
  title: ReactNode;
  actionLabel?: string;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  actionClassName?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className={cn("object-cover", imageClassName)}
      />
      <div
        className={cn("absolute inset-0", overlayClassName)}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-[1] text-white",
          contentClassName,
        )}
      >
        {actionLabel ? (
          <div className="flex items-end justify-between gap-4">
            <div>{title}</div>
            <span
              className={cn(
                "inline-flex min-h-[52px] items-center justify-center rounded-full border px-8 text-center",
                "bg-white/8 backdrop-blur-[10px]",
                actionClassName,
              )}
            >
              {actionLabel}
            </span>
          </div>
        ) : (
          <div>{title}</div>
        )}
        {footer}
      </div>
    </>
  );

  const containerClassName = cn(
    "relative block overflow-hidden rounded-[22px] shadow-[0_10px_24px_rgba(0,0,0,0.14)]",
    className,
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={containerClassName}>
        {content}
      </Link>
    );
  }

  return <div className={containerClassName}>{content}</div>;
}

function SidebarPillAction({
  label,
  href,
  onClick,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const actionClassName =
    "flex min-h-[56px] w-full items-center justify-start rounded-full border border-black bg-white px-8 text-left text-[18px] font-medium text-foreground shadow-[0_12px_24px_rgba(0,0,0,0.14)] transition-all hover:scale-[0.995] hover:bg-black hover:text-white";

  if (href) {
    return (
      <Link href={href} className={actionClassName} onClick={onClick}>
        {label}
      </Link>
    );
  }

  return <div className={cn(actionClassName, "cursor-default")}>{label}</div>;
}

/* function GuestDropdownMenu({
  onClose,
  onOpenLogin,
}: {
  onClose: () => void;
  onOpenLogin: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onOpenLogin}
        className="block w-full rounded-[12px] px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted"
      >
        Đăng nhập
      </button>
      <Link
        href={ROUTES.ORDER_LOOKUP}
        className="block rounded-[12px] px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
        onClick={onClose}
      >
        Tra cứu đơn hàng
      </Link>
      <Link
        href={ROUTES.APPOINTMENT}
        className="block rounded-[12px] px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
        onClick={onClose}
      >
        Tra cứu lịch hẹn
      </Link>
      <Link
        href={ROUTES.FAQ}
        className="block rounded-[12px] px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
        onClick={onClose}
      >
        Câu hỏi thường gặp
      </Link>
    </>
  );
} */

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="flex h-6 w-6 flex-col items-center justify-center gap-1.5">
      <span
        className={cn(
          "h-0.5 w-6 bg-foreground transition-transform",
          open && "translate-y-2 rotate-45",
        )}
      />
      <span
        className={cn(
          "h-0.5 w-6 bg-foreground transition-opacity",
          open && "opacity-0",
        )}
      />
      <span
        className={cn(
          "h-0.5 w-6 bg-foreground transition-transform",
          open && "-translate-y-2 -rotate-45",
        )}
      />
    </span>
  );
}
