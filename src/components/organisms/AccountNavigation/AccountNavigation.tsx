"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export type AccountNavItem = {
  label: string;
  href?: string;
  action?: "logout";
};

type AccountNavigationVariant = "default" | "account";

function AccountNavCard({
  item,
  isActive,
  onLogout,
  variant,
}: {
  item: AccountNavItem;
  isActive?: boolean;
  onLogout: () => void;
  variant: AccountNavigationVariant;
}) {
  const className = cn(
    variant === "account"
      ? "flex min-h-[46px] w-full items-center gap-2 rounded-md border-2 border-black px-3 py-2 text-left transition-colors md:min-h-[56px] md:gap-4 md:px-5 md:py-3"
      : "flex min-h-[50px] w-full items-center justify-between rounded-[14px] border px-3 py-3 text-left shadow-[0_10px_26px_rgba(0,0,0,0.08)] transition-transform md:min-h-[58px] md:px-5 md:py-4",
    isActive
      ? "border-black bg-black text-white"
      : variant === "account"
        ? "border-black bg-white text-foreground hover:bg-black/[0.02]"
        : "border-black bg-white text-foreground hover:scale-[0.995]",
    !item.href && item.action !== "logout" && !isActive && "cursor-default",
  );

  const content = (
    <>
      <span
        className={cn(
          "min-w-0 flex-1 whitespace-nowrap leading-tight text-ellipsis overflow-hidden",
          variant === "account"
            ? isActive
              ? "text-[13px] font-bold md:text-[15px]"
              : "text-[13px] font-normal md:text-[15px]"
            : "text-[13px] font-medium md:text-[15px]",
        )}
      >
        {item.label}
      </span>
      <Image
        src="/icons/arrow-right.svg"
        alt=""
        width={24}
        height={14}
        aria-hidden
        className={cn(
          "h-auto shrink-0",
          variant === "account" ? "w-5 md:w-8" : "w-5",
          isActive ? "brightness-0 invert" : "brightness-0",
        )}
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
  variant = "default",
}: {
  items: AccountNavItem[];
  activeHref?: string;
  variant?: AccountNavigationVariant;
}) {
  const router = useRouter();
  const auth = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [modalOffset, setModalOffset] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isConfirmOpen) {
      setModalOffset({ x: 0, y: 0 });
      dragStateRef.current = null;
    }
  }, [isConfirmOpen]);

  useEffect(() => {
    if (!isConfirmOpen) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const dragState = dragStateRef.current;

      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      setModalOffset({
        x: dragState.originX + (event.clientX - dragState.startX),
        y: dragState.originY + (event.clientY - dragState.startY),
      });
    }

    function handlePointerUp(event: PointerEvent) {
      if (dragStateRef.current?.pointerId === event.pointerId) {
        dragStateRef.current = null;
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsConfirmOpen(false);
      }
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isConfirmOpen]);

  async function handleLogout() {
    await auth.logout();

    if (!auth.errorMessage) {
      router.replace(ROUTES.HOME);
      router.refresh();
    }
  }

  function handleDragStart(event: React.PointerEvent<HTMLDivElement>) {
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: modalOffset.x,
      originY: modalOffset.y,
    };
  }

  return (
    <>
      <nav
        className={cn("flex flex-col", variant === "account" ? "gap-2.5 md:gap-5" : "gap-2 md:gap-4")}
        aria-label="Điều hướng tài khoản"
      >
        {items.map((item) => (
          <AccountNavCard
            key={item.label}
            item={item}
            isActive={item.href === activeHref}
            onLogout={() => setIsConfirmOpen(true)}
            variant={variant}
          />
        ))}
      </nav>

      {isMounted && isConfirmOpen
        ? createPortal(
            <div className="fixed inset-0 z-[260] bg-black/45 px-4">
              <div
                className="flex min-h-full items-center justify-center"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setIsConfirmOpen(false);
                  }
                }}
              >
                <div
                  className="w-full max-w-[520px] rounded-[28px] bg-white p-7 shadow-[0_26px_70px_rgba(0,0,0,0.24)] md:p-8"
                  style={{
                    transform: `translate(${modalOffset.x}px, ${modalOffset.y}px)`,
                  }}
                >
                  <div
                    className="-mx-2 -mt-2 mb-4 flex cursor-grab touch-none justify-center rounded-[18px] px-2 py-2 active:cursor-grabbing"
                    onPointerDown={handleDragStart}
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-12 rounded-full bg-black/12"
                    />
                  </div>

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
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
