"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation";
import { useEffect } from "react";
import { AuthShell } from "@/components/templates/AuthShell";
import { LoginForm } from "@/components/organisms/LoginForm";
import { RegisterForm } from "@/components/organisms/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import type { AuthMode } from "@/types/auth.types";

function currentPathWithSearch(
  pathname: string,
  searchParams: ReadonlyURLSearchParams,
) {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.delete("auth");
  nextParams.delete("authError");
  nextParams.delete("authDetail");

  const query = nextParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function AuthExperience({
  mode,
  onModeChange,
  onAuthSuccess,
  className,
  pageFallback = false,
}: {
  mode: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  onAuthSuccess?: () => void;
  className?: string;
  pageFallback?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const nextPath = pageFallback
    ? ROUTES.HOME
    : currentPathWithSearch(pathname, searchParams);
  const handleSuccess =
    onAuthSuccess ??
    (pageFallback ? () => router.replace(ROUTES.HOME) : undefined);

  useEffect(() => {
    if (pageFallback && !auth.isLoading && auth.isAuthenticated) {
      router.replace(ROUTES.HOME);
    }
  }, [auth.isAuthenticated, auth.isLoading, pageFallback, router]);
  const authError = searchParams.get("authError");
  const authDetail = searchParams.get("authDetail");
  const profileSyncMessage =
    authDetail && process.env.NODE_ENV !== "production"
      ? `Đăng nhập đã thành công nhưng chưa đồng bộ được hồ sơ khách hàng. Chi tiết: ${authDetail}`
      : "Đăng nhập đã thành công nhưng chưa đồng bộ được hồ sơ khách hàng. Vui lòng thử lại.";
  const oauthErrorMessage =
    authError === "oauth_callback"
      ? "Đăng nhập mạng xã hội chưa hoàn tất. Vui lòng thử lại."
      : authError === "profile_sync"
        ? profileSyncMessage
        : undefined;

  async function handleLogin(values: { account: string; password: string }) {
    const result = await auth.login(values);
    if (result.ok) {
      handleSuccess?.();
    }
  }

  async function handleRegister(values: {
    fullName: string;
    account: string;
    password: string;
    confirmPassword: string;
  }) {
    const result = await auth.register(values, nextPath);
    if (result.ok && !result.requiresEmailConfirmation) {
      handleSuccess?.();
    }
  }

  const switchMode = mode === "login" ? "register" : "login";

  return (
    <AuthShell
      className={className}
      onGoogleClick={() => auth.signInWithProvider("google", nextPath)}
      onFacebookClick={() => auth.signInWithProvider("facebook", nextPath)}
      footer={
        <>
          {onModeChange ? (
            <button
              type="button"
              onClick={() => onModeChange(switchMode)}
              className="text-left transition-opacity hover:opacity-70"
            >
              {mode === "login" ? "Đăng ký tài khoản" : "Đăng nhập ngay"}
            </button>
          ) : (
            <Link href={`${ROUTES.HOME}?auth=${switchMode}`}>
              {mode === "login" ? "Đăng ký tài khoản" : "Đăng nhập ngay"}
            </Link>
          )}
          <Link
            href={pageFallback ? ROUTES.HOME : `${ROUTES.HOME}?auth=${mode}`}
          >
            Quên mật khẩu
          </Link>
        </>
      }
    >
      {mode === "login" ? (
        <LoginForm
          onSubmit={handleLogin}
          isLoading={auth.isSubmitting || auth.isLoading}
          errorMessage={auth.errorMessage ?? oauthErrorMessage}
          noticeMessage={auth.noticeMessage}
        />
      ) : (
        <RegisterForm
          onSubmit={handleRegister}
          isLoading={auth.isSubmitting || auth.isLoading}
          errorMessage={auth.errorMessage ?? oauthErrorMessage}
          noticeMessage={auth.noticeMessage}
        />
      )}
    </AuthShell>
  );
}
