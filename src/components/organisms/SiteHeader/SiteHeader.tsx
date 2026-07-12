"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AuthModal } from "@/components/organisms/AuthModal";
import { useCartDrawer } from "@/components/providers/CartDrawerProvider";
import { ROUTES } from "@/constants/routes";
import type { CategoryNavItem } from "@/features/homepage/homepage.service";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useLatestCollectionHighlight } from "@/hooks/useLatestCollectionHighlight";
import { useProductSearchSuggestions } from "@/hooks/useProductSearchSuggestions";
import { cn, formatPrice } from "@/lib/utils";
import type { LatestCollectionHighlight } from "@/types/collection-highlight.types";

type AuthMode = "login" | "register";

type UtilityLink = {
  label: string;
  href?: string;
  icon?: string;
  authMode?: AuthMode;
};

const UTILITY_LEFT: UtilityLink[] = [
  { label: "Về XÉO XỌ", href: ROUTES.ABOUT },
  { label: "NEW ARRIVALS", href: ROUTES.COLLECTIONS },
  { label: "STARS in XÉO XỌ", href: `${ROUTES.HOME}#stars-in-xeo-xo` },
];

const UTILITY_RIGHT: UtilityLink[] = [
  { label: "Xéo Hội", icon: "/icons/star-club.svg", authMode: "register" },
  { label: "Cửa hàng", href: `${ROUTES.HOME}#he-thong-cua-hang` },
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

const ACADEMIC_DISCLAIMER =
  "Website được xây dựng phục vụ mục đích học tập trong khuôn khổ đồ án môn. Không phải website chính thức của thương hiệu XÉO XỌ.";

function groupCategories(categories: CategoryNavItem[]) {
  const categoryIds = new Set(categories.map((category) => category.categoryId));
  const roots = categories.filter(
    (category) => !category.parentId || !categoryIds.has(category.parentId),
  );
  const mapped = roots.map((root) => {
    const children = categories
      .filter((category) => category.parentId === root.categoryId)
      .sort((left, right) => left.categoryName.localeCompare(right.categoryName));

    return {
      children,
      parent: root,
    };
  });
  const rootsWithChildren = mapped.filter((group) => group.children.length > 0);
  const rootsWithoutChildren = mapped
    .filter((group) => group.children.length === 0)
    .map((group) => group.parent);

  if (rootsWithoutChildren.length === 0) {
    return rootsWithChildren;
  }

  return [
    ...rootsWithChildren,
    {
      children: rootsWithoutChildren,
      parent: {
        categoryId: -999,
        categoryName: "Khác",
        categorySlug: "",
      },
    },
  ];
}

export function SiteHeader({
  fixedHeader = true,
  womenCategories = [],
  menCategories = [],
  aoDaiCategories = [],
}: {
  fixedHeader?: boolean;
  womenCategories?: CategoryNavItem[];
  menCategories?: CategoryNavItem[];
  aoDaiCategories?: CategoryNavItem[];
}) {
  const searchRef = useRef<HTMLDivElement | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { cart } = useCart();
  const cartCount = cart.total_quantity;
  const auth = useAuth();
  const latestCollectionHighlight = useLatestCollectionHighlight();
  const { openDrawer: openCartDrawer } = useCartDrawer();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountSidebarOpen, setAccountSidebarOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthMode | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [utilityBarVisible, setUtilityBarVisible] = useState(true);

  const authMode = searchParams.get("auth");
  const activeAuthMode =
    authMode === "login" || authMode === "register" ? authMode : null;
  const searchQueryFromParams = searchParams.get("q")?.trim() ?? "";
  const normalizedSearchQuery = searchQuery.trim();
  const canSearch = normalizedSearchQuery.length >= 2;

  const { suggestions, isLoading: searchSuggestionsLoading } =
    useProductSearchSuggestions(normalizedSearchQuery, {
      enabled: searchOpen && canSearch,
      limit: 4,
    });

  const categoryMenuByHref: Record<string, CategoryNavItem[]> = {
    [ROUTES.CATALOG_WOMEN]: womenCategories,
    [ROUTES.CATALOG_MEN]: menCategories,
    [ROUTES.CATALOG_AO_DAI]: aoDaiCategories,
  };

  const categoryMenuByLabel: Record<string, CategoryNavItem[]> = {
    NỮ: womenCategories,
    NAM: menCategories,
  };

  useEffect(() => {
    setModalMode(activeAuthMode);
  }, [activeAuthMode]);

  useEffect(() => {
    setSearchQuery(searchQueryFromParams);
  }, [searchQueryFromParams]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

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

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 24) {
        setUtilityBarVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setUtilityBarVisible(false);
      } else {
        setUtilityBarVisible(true);
      }

      lastScrollY = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  function openAccountSidebar() {
    setAccountSidebarOpen(true);
  }

  function submitSearch(rawValue: string) {
    const normalizedQuery = rawValue.trim();

    if (normalizedQuery.length < 2) {
      setSearchOpen(false);
      return;
    }

    if (
      pathname === ROUTES.PRODUCTS &&
      searchQueryFromParams.toLowerCase() === normalizedQuery.toLowerCase()
    ) {
      setSearchOpen(false);
      return;
    }

    const params = new URLSearchParams();
    params.set("q", normalizedQuery);
    setSearchOpen(false);
    router.push(`${ROUTES.PRODUCTS}?${params.toString()}`);
  }

  const searchResultsHref = canSearch
    ? `${ROUTES.PRODUCTS}?${new URLSearchParams({ q: normalizedSearchQuery }).toString()}`
    : ROUTES.PRODUCTS;

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

  return (
    <>
      <header
        className={cn(
          "z-[140] w-full bg-background",
          fixedHeader ? "fixed inset-x-0 top-0" : "relative",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden bg-black bg-[length:100%_auto] bg-top text-white transition-[max-height,opacity] duration-300",
            utilityBarVisible ? "max-h-16 opacity-100" : "max-h-0 opacity-0",
          )}
          style={{ backgroundImage: "url(/images/header-line-up.png)" }}
        >
          <div className="mx-auto flex w-full max-w-site items-center justify-between gap-3 px-4 py-1.5 text-[11px] font-medium sm:px-6 lg:px-8 xl:px-10 2xl:px-20">
            <UtilityGroup links={UTILITY_LEFT} />
            <div className="hidden flex-wrap items-center gap-x-3 gap-y-2 lg:flex lg:justify-end">
              <UtilityGroup
                links={utilityRightLinks}
                onOpenAuthModal={openAuthModal}
              />
              {hasAccountMenu && (
                <>
                  <span
                    aria-hidden
                    className="hidden h-4 w-px bg-white/40 lg:block"
                  />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={openAccountSidebar}
                      className="flex max-w-[220px] items-center gap-2 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-[0.02em] text-white transition-opacity hover:opacity-75"
                    >
                      <span className="truncate">{accountLabel}</span>
                      <span aria-hidden className="text-caption">
                        ▾
                      </span>
                    </button>
                  </div>
                </>
              )}
              <span
                aria-hidden
                className="hidden h-4 w-px bg-white/40 lg:block"
              />
              <button
                type="button"
                className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.02em] text-white transition-opacity hover:opacity-75"
              >
                <Image
                  src="/icons/flag-vn.svg"
                  alt=""
                  width={24}
                  height={18}
                  aria-hidden
                />
                VN
                <span aria-hidden className="text-caption">
                  ▾
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-site items-center justify-between gap-2.5 bg-background px-4 py-1.5 sm:px-6 lg:gap-3 lg:px-6 xl:px-7 2xl:px-10">
          <div className="flex items-center gap-3 justify-self-start">
            <button
              type="button"
              aria-label="Mở menu"
              className="lg:hidden"
              onClick={() => setMobileOpen((value) => !value)}
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
                className="h-auto w-[60px] object-contain sm:w-[74px] lg:w-[88px] xl:w-[96px]"
              />
            </Link>
          </div>

          <nav
            aria-label="Danh mục chính"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center justify-center gap-2.5 lg:flex xl:gap-3"
          >
            {MAIN_NAV.map((item) => {
              const active = pathname === item.href;
              const categories = item.href
                ? categoryMenuByHref[item.href]
                : categoryMenuByLabel[item.label];
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
                  onMouseEnter={() => hasDropdown && setHoveredNav(item.label)}
                  onMouseLeave={() => hasDropdown && setHoveredNav(null)}
                >
                  <Link
                    href={item.href!}
                    className={cn(
                      "whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.02em] text-foreground transition-colors hover:text-foreground/65 xl:text-[12px]",
                      active && "underline underline-offset-8",
                    )}
                  >
                    {item.label}
                  </Link>

                  {hasDropdown && (
                    (() => {
                      const grouped = groupCategories(categories);
                      const widthClass =
                        grouped.length === 1
                          ? "w-[240px]"
                          : grouped.length === 2
                            ? "w-[480px]"
                            : "w-[720px]";
                      const gridColsClass =
                        grouped.length === 1
                          ? "grid-cols-1"
                          : grouped.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-3";

                      return (
                        <div
                          className={cn(
                            "absolute top-full z-[90] max-w-[calc(100vw-48px)] pt-[14px]",
                            dropdownAlignment,
                            widthClass,
                            hoveredNav === item.label
                              ? "pointer-events-auto"
                              : "pointer-events-none",
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-[16px] border border-gray-100 bg-background p-6 text-foreground shadow-[0_18px_38px_rgba(0,0,0,0.16)] transition-all duration-200",
                              hoveredNav === item.label
                                ? "translate-y-0 opacity-100"
                                : "-translate-y-2 opacity-0",
                            )}
                          >
                            {item.href ? (
                              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                                <Link
                                  href={
                                    item.href === ROUTES.CATALOG_WOMEN
                                      ? "/categories/nu"
                                      : item.href === ROUTES.CATALOG_MEN
                                        ? "/categories/nam"
                                        : item.href === ROUTES.CATALOG_AO_DAI
                                          ? "/categories/ao-dai"
                                          : item.href
                                  }
                                  className="flex items-center gap-1 text-[11px] font-medium text-[#FF5C39] transition-colors hover:text-[#e04322]"
                                  onClick={() => setHoveredNav(null)}
                                >
                                  Xem tất cả sản phẩm →
                                </Link>
                              </div>
                            ) : null}
                            <div className={cn("grid gap-10", gridColsClass)}>
                              {grouped.map((group) => (
                                <div
                                  key={group.parent.categoryId}
                                  className="flex min-w-[180px] flex-col gap-3"
                                >
                                  {group.parent.categorySlug ? (
                                    <Link
                                      href={ROUTES.CATEGORY(group.parent.categorySlug)}
                                      className="border-b border-gray-100 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-black transition-colors hover:text-[#FF5C39]"
                                      onClick={() => setHoveredNav(null)}
                                    >
                                      {group.parent.categoryName}
                                    </Link>
                                  ) : (
                                    <span className="border-b border-gray-100 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-black">
                                      {group.parent.categoryName}
                                    </span>
                                  )}

                                  <div className="flex flex-col gap-2">
                                    {group.children.map((child) => (
                                      <Link
                                        key={child.categoryId}
                                        href={ROUTES.CATEGORY(child.categorySlug)}
                                        className="text-[11px] font-light text-muted-foreground transition-colors hover:text-black"
                                        onClick={() => setHoveredNav(null)}
                                      >
                                        {child.categoryName}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 justify-self-end sm:gap-2.5">
            <div ref={searchRef} className="relative flex items-center self-center">
              <label className="flex h-10 w-[160px] items-center gap-2 rounded-full border border-black/15 bg-white px-3 shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-colors focus-within:border-black/30 sm:h-11 sm:w-[220px] sm:px-4 lg:w-[220px] xl:w-[250px] 2xl:w-[270px]">
                <span className="sr-only">Tìm kiếm sản phẩm</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    const nextNormalizedValue = nextValue.trim();
                    setSearchQuery(nextValue);
                    setSearchOpen(nextNormalizedValue.length >= 2);
                  }}
                  onFocus={() => {
                    if (canSearch) {
                      setSearchOpen(true);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      submitSearch(searchQuery);
                    }

                    if (event.key === "Escape") {
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Tìm kiếm..."
                  className="min-w-0 flex-1 bg-transparent text-xs font-light text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => submitSearch(searchQuery)}
                  aria-label="Tìm kiếm"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/65 outline-none transition-opacity hover:opacity-70 focus-visible:outline-none"
                >
                  <Image
                    src="/icons/search.svg"
                    alt=""
                    width={18}
                    height={18}
                    aria-hidden
                    className="h-[17px] w-[17px] object-contain"
                  />
                </button>
              </label>

              {searchOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-[120] w-[min(420px,calc(100vw-32px))] overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.14)]">
                  {searchSuggestionsLoading ? (
                    <div className="px-4 py-4 text-sm text-muted-foreground">
                      Đang tìm kiếm...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      <ul className="py-2">
                        {suggestions.map((suggestion) => (
                          <li key={suggestion.product_line_id}>
                            <Link
                              href={`/products/${suggestion.slug}`}
                              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery(suggestion.name);
                              }}
                            >
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-muted">
                                <Image
                                  src={suggestion.thumbnail}
                                  alt={suggestion.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {suggestion.name}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-foreground/70">
                                  {formatPrice(suggestion.price)}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      {suggestions.length >= 4 && (
                        <div className="border-t border-black/10 px-4 py-3">
                          <Link
                            href={searchResultsHref}
                            className="flex items-center justify-between text-sm font-semibold text-foreground transition-opacity hover:opacity-70"
                            onClick={() => setSearchOpen(false)}
                          >
                            <span>Xem thêm kết quả</span>
                            <span aria-hidden>→</span>
                          </Link>
                        </div>
                      )}
                    </>
                  ) : canSearch ? (
                    <div className="px-4 py-4 text-sm text-muted-foreground">
                      Không tìm thấy sản phẩm phù hợp.
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                aria-label={hasAccountMenu ? "Tài khoản của bạn" : "Đăng nhập"}
                onClick={() =>
                  hasAccountMenu
                    ? openAccountSidebar()
                    : openAuthModal("login")
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full transition-opacity hover:opacity-70 sm:h-11 sm:w-11"
              >
                <Image
                  src="/icons/account.svg"
                  alt=""
                  width={26}
                  height={26}
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
              className="relative flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full transition-opacity hover:opacity-70 sm:h-11 sm:w-11"
            >
              <Image
                src="/icons/cart.svg"
                alt=""
                width={26}
                height={26}
                aria-hidden
              />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-caption text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="site-header-marquee hidden xl:block">
          <div className="site-header-marquee__track" aria-label={ACADEMIC_DISCLAIMER}>
            <span>{ACADEMIC_DISCLAIMER}</span>
            <span aria-hidden>{ACADEMIC_DISCLAIMER}</span>
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
  className,
}: {
  links: UtilityLink[];
  onOpenAuthModal?: (mode: AuthMode) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}
    >
      {links.map((link, index) => (
        <span key={link.label} className="flex items-center">
          {link.authMode ? (
            <button
              type="button"
              onClick={() => onOpenAuthModal?.(link.authMode!)}
              className="flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.02em] text-white transition-opacity hover:opacity-75"
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
              className="flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.02em] text-white transition-opacity hover:opacity-75"
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
            <span
              aria-hidden
              className="mx-3 hidden h-4 w-px bg-white/40 lg:block"
            />
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
    { label: "Đánh giá và phản hồi", href: ROUTES.ACCOUNT_REVIEWS },
    { label: "FAQ", href: ROUTES.FAQ_ACCOUNT },
  ];

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
    <div className="fixed inset-0 z-[180]">
      <button
        type="button"
        aria-label="Đóng thanh thông tin tài khoản"
        onClick={onClose}
        className="absolute inset-0 bg-black/18 backdrop-blur-sm"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[500px] flex-col bg-background shadow-[-18px_0_40px_rgba(0,0,0,0.16)]">
        <div className="flex-1 overflow-y-auto px-6 pb-10 pt-14">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-medium leading-none text-foreground">
                xin chào,
              </p>
              <h2 className="mt-1 text-[2.5rem] font-bold leading-[0.95] text-foreground [overflow-wrap:anywhere]">
                {accountLabel}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Đóng"
              onClick={onClose}
              className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-foreground/15 transition-colors hover:bg-muted"
            >
              <span
                aria-hidden
                className="text-2xl leading-none text-foreground"
              >
                ×
              </span>
            </button>
          </div>

          <div
            className="mt-5 h-[5px] w-full bg-[length:100%_100%] bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/images/header-line-up.png)" }}
          />

          <section className="mt-5">
            <SidebarPromoCard
              href={latestCollectionHref}
              imageSrc={latestCollectionImage}
              imageAlt={latestCollectionImageAlt}
              imageClassName="object-cover [object-position:center_25%]"
              className="min-h-[136px]"
              overlayClassName="bg-[linear-gradient(90deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.18)_46%,rgba(0,0,0,0.16)_100%)]"
              contentClassName="px-4 pb-3 pt-5"
              title={
                <>
                  <span className="block text-sm font-light leading-none text-white">
                    Bộ sưu tập
                  </span>
                  <span className="mt-1.5 block text-2xl font-bold leading-none text-white">
                    {latestCollectionHighlight?.name || "Thanh Xuân"}
                  </span>
                </>
              }
              actionLabel="Khám phá"
              actionClassName="min-h-[46px] min-w-[156px] border-white/90 bg-black/20 px-5 text-base font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur-[10px] transition-colors hover:bg-black hover:text-white"
              onClick={onClose}
            />

            <SidebarPromoCard
              imageSrc={latestProductImage}
              imageAlt={latestProductImageAlt}
              imageClassName="object-cover [object-position:center_28%]"
              className="mt-4 min-h-[270px] !rounded-none"
              overlayClassName="bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.12)_42%,rgba(0,0,0,0.64)_100%)]"
              contentClassName="px-5 pb-8 pt-6"
              title={
                <>
                  <span className="block text-xs font-light leading-[1.2] text-white">
                    Sống với tinh thần thanh lịch
                  </span>
                  <span className="mt-1.5 block text-2xl font-light leading-none text-white">
                    Tham gia <span className="font-bold">Xéo Hội</span>
                  </span>
                </>
              }
              footer={
                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  <Link
                    href={ROUTES.MEMBERSHIP}
                    onClick={onClose}
                    className="flex min-h-[46px] w-full items-center justify-center rounded-full border border-white/80 bg-[url('/images/bg-tham-gia-sidebar-account-btn.png')] bg-cover bg-center bg-no-repeat px-5 text-center text-base font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all hover:scale-[0.99] hover:opacity-85"
                  >
                    Tham gia
                  </Link>
                  <Link
                    href={ROUTES.BENEFITS}
                    onClick={onClose}
                    className="flex min-h-[46px] w-full items-center justify-center whitespace-nowrap rounded-full border border-white/80 bg-transparent px-5 text-center text-base font-medium text-white transition-colors hover:bg-black hover:text-white"
                  >
                    Tìm hiểu thêm
                  </Link>
                </div>
              }
              onClick={onClose}
            />
          </section>

          <nav
            className="mt-5 flex flex-col gap-4"
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

        <div className="bg-black px-6 py-4 md:py-5">
          <Link
            href={ROUTES.ACCOUNT_PROFILE}
            className="flex items-center justify-center text-center text-[1.2rem] font-bold leading-none text-white md:text-[1.4rem]"
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
        className={cn("rounded-[inherit] object-cover", imageClassName)}
      />
      <div
        className={cn("absolute inset-0 rounded-[inherit]", overlayClassName)}
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
    "relative block overflow-hidden rounded-[18px] shadow-[0_10px_24px_rgba(0,0,0,0.14)]",
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
    "ml-10 flex min-h-[46px] w-[calc(100%-40px)] items-center justify-start rounded-full border border-black bg-white px-6 text-left text-[15px] font-medium text-foreground shadow-[0_12px_24px_rgba(0,0,0,0.14)] transition-all hover:scale-[0.995] hover:bg-black hover:text-white";

  if (href) {
    return (
      <Link href={href} className={actionClassName} onClick={onClick}>
        {label}
      </Link>
    );
  }

  return <div className={cn(actionClassName, "cursor-default")}>{label}</div>;
}

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
