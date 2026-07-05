"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export type AccountNavItem = {
  label: string;
  href?: string;
  action?: "logout";
};

function AccountNavCard({
  item,
  isActive,
  onLogout,
}: {
  item: AccountNavItem;
  isActive?: boolean;
  onLogout: () => void;
}) {
  const className = cn(
    "flex min-h-[58px] w-full items-center justify-between rounded-[14px] border px-5 py-4 text-left shadow-[0_10px_26px_rgba(0,0,0,0.08)] transition-transform",
    isActive
      ? "border-black bg-black text-white"
      : "border-black bg-white text-foreground hover:scale-[0.995]",
    !item.href && item.action !== "logout" && !isActive && "cursor-default",
  );

  const content = (
    <>
      <span className="text-base font-medium leading-tight md:text-[15px]">
        {item.label}
      </span>
      <Image
        src="/icons/arrow-right.svg"
        alt=""
        width={31}
        height={18}
        aria-hidden
        className={cn("h-auto w-8 shrink-0", isActive && "brightness-0 invert")}
      />
    </>
  );

  if (item.action === "logout") {
    return (
      <button type="button" onClick={onLogout} className={className}>
        {content}
      </button>
    );
  }

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export function AccountNavigation({
  items,
  activeHref,
}: {
  items: AccountNavItem[];
  activeHref?: string;
}) {
  const router = useRouter();
  const auth = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  async function handleLogout() {
    await auth.logout();

    if (!auth.errorMessage) {
      router.replace(ROUTES.HOME);
      router.refresh();
    }
  }

  return (
    <>
      <nav className="flex flex-col gap-4" aria-label="Điều hướng tài khoản">
        {items.map((item) => (
          <AccountNavCard
            key={item.label}
            item={item}
            isActive={item.href === activeHref}
            onLogout={() => setIsConfirmOpen(true)}
          />
        ))}
      </nav>

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[520px] rounded-[28px] bg-white p-7 shadow-[0_26px_70px_rgba(0,0,0,0.24)] md:p-8">
            <Image
              src="/images/logohong.png"
              alt="Xéo Xọ"
              width={122}
              height={72}
              className="h-auto w-[78px] md:w-[90px]"
              priority
            />
            <h2 className="mt-3 text-[30px] font-extrabold leading-none text-foreground">
              Xác nhận đăng xuất?
            </h2>
            <p className="mt-4 text-sm leading-6 text-foreground/72 md:text-base">
              Bạn sẽ được đưa về trang chủ sau khi đăng xuất thành công.
            </p>

            {auth.errorMessage ? (
              <p className="mt-4 rounded-[14px] border border-[#d76a54]/25 bg-[#fff2ee] px-4 py-3 text-sm font-medium text-[#b14f3d]">
                {auth.errorMessage}
              </p>
            ) : null}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={auth.isSubmitting}
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-black/20 px-7 text-sm font-semibold text-foreground transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={auth.isSubmitting}
                className="inline-flex min-h-[50px] min-w-[156px] items-center justify-center whitespace-nowrap rounded-full bg-black px-8 text-sm font-bold uppercase tracking-[0.03em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {auth.isSubmitting ? "Đang xử lý..." : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
