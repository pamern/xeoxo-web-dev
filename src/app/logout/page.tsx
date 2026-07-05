"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export default function LogoutPage() {
  const router = useRouter();
  const auth = useAuth();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    let cancelled = false;

    async function runLogout() {
      await auth.logout();

      if (!cancelled) {
        router.replace(ROUTES.HOME);
      }
    }

    void runLogout();

    return () => {
      cancelled = true;
    };
  }, [auth, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-[520px] rounded-[28px] bg-background p-8 text-center shadow-[0_20px_48px_rgba(0,0,0,0.12)]">
        <p className="text-sm uppercase tracking-[0.24em] text-foreground/55">
          XEO XO
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-none text-foreground">
          Đang đăng xuất
        </h1>
        <p className="mt-4 text-base leading-7 text-foreground/68">
          Nếu trang chưa tự chuyển, bạn có thể bấm nút bên dưới để thử lại.
        </p>

        <button
          type="button"
          onClick={() =>
            void auth.logout().then(() => router.replace(ROUTES.HOME))
          }
          disabled={auth.isSubmitting}
          className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-full bg-black px-8 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {auth.isSubmitting ? "Đang xử lý..." : "Đăng xuất ngay"}
        </button>

        <div className="mt-5">
          <Link
            href={ROUTES.HOME}
            className="text-sm font-medium text-foreground/62 underline-offset-4 hover:text-foreground hover:underline"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
