"use client";

import { useEffect, useState } from "react";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { createClient } from "@/lib/supabase/client";
import {
  authService,
  isInvalidCredentialsError,
} from "@/services/auth.service";
import {
  getLoginBlockedMessage,
  getLoginBlockRemainingMs,
  registerFailedLoginAttempt,
  resetFailedLoginAttempts,
} from "@/lib/auth-login-guard";
import type {
  AuthCustomer,
  AuthProvider,
  AuthUser,
  LoginValues,
  RegisterValues,
} from "@/types/auth.types";
import { loginSchema } from "@/validations/auth/login.schema";
import { registerSchema } from "@/validations/auth/register.schema";

type SubmitResult = {
  ok: boolean;
  requiresEmailConfirmation?: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [customer, setCustomer] = useState<AuthCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [noticeMessage, setNoticeMessage] = useState<string>();

  function logAuthError(scope: string, error: unknown, metadata?: unknown) {
    console.error(`[useAuth/${scope}]`, {
      error,
      metadata: metadata ?? null,
    });
  }

  async function refresh() {
    setIsLoading(true);

    try {
      const me = await authService.getMe();
      setUser(me.user);
      setCustomer(me.customer);
    } catch (error) {
      // Kiểm tra đăng nhập nền chạy trên mọi trang, kể cả khi khách chưa
      // đăng nhập hoặc request bị huỷ giữa chừng do chuyển trang — đây là
      // tình huống bình thường, không phải lỗi ứng dụng, nên chỉ warn thay
      // vì console.error (Next.js dev mode bung overlay chặn UI cho mọi
      // console.error, gây cảm giác "lỗi" dù trang vẫn hoạt động đúng).
      console.warn("[useAuth/refresh]", error);
      setUser(null);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const supabase = createClient();
    refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleProfileUpdated() {
      void refresh();
    }

    window.addEventListener("xeoxo:profile-updated", handleProfileUpdated);

    return () => {
      window.removeEventListener("xeoxo:profile-updated", handleProfileUpdated);
    };
  }, []);

  async function login(values: LoginValues): Promise<SubmitResult> {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
      );
      setNoticeMessage(undefined);
      return { ok: false };
    }

    const identifier = parseAuthIdentifier(parsed.data.account);

    if (!identifier) {
      setErrorMessage("Email hoặc số điện thoại không hợp lệ.");
      setNoticeMessage(undefined);
      return { ok: false };
    }

    const blockedRemainingMs = getLoginBlockRemainingMs(identifier.value);
    if (blockedRemainingMs > 0) {
      setErrorMessage(getLoginBlockedMessage());
      setNoticeMessage(undefined);
      return { ok: false };
    }

    setIsSubmitting(true);
    setErrorMessage(undefined);
    setNoticeMessage(undefined);

    try {
      await authService.login(parsed.data);
      resetFailedLoginAttempts(identifier.value);
      await authService.syncProfile();
      await refresh();
      return { ok: true };
    } catch (error) {
      logAuthError("login", error, { account: parsed.data.account });
      if (isInvalidCredentialsError(error)) {
        const failureState = registerFailedLoginAttempt(identifier.value);
        if (failureState.isBlocked) {
          setErrorMessage(getLoginBlockedMessage());
          return { ok: false };
        }
      }
      setErrorMessage(
        error instanceof Error ? error.message : "Đăng nhập thất bại.",
      );
      return { ok: false };
    } finally {
      setIsSubmitting(false);
    }
  }

  async function register(
    values: RegisterValues,
    nextPath?: string,
  ): Promise<SubmitResult> {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
      );
      setNoticeMessage(undefined);
      return { ok: false };
    }

    setIsSubmitting(true);
    setErrorMessage(undefined);
    setNoticeMessage(undefined);

    try {
      const result = await authService.register(parsed.data, nextPath);
      const identifier = parseAuthIdentifier(parsed.data.account);

      if (result.session) {
        await authService.syncProfile();
        await refresh();
        return { ok: true };
      }

      try {
        if (!result.session) {
          await authService.login({
            account: parsed.data.account,
            password: parsed.data.password,
          });
        }
        await authService.syncProfile();
        await refresh();
        return { ok: true };
      } catch (loginAfterRegisterError) {
        logAuthError("register-login-fallback", loginAfterRegisterError, {
          account: parsed.data.account,
          identifierType: identifier?.type ?? null,
        });
      }

      setNoticeMessage(
        identifier?.type === "phone"
          ? "Vui lòng kiểm tra tin nhắn SMS để xác nhận tài khoản trước khi đăng nhập."
          : "Vui lòng kiểm tra email và bấm vào link xác nhận tài khoản trước khi đăng nhập.",
      );
      return { ok: true, requiresEmailConfirmation: true };
    } catch (error) {
      logAuthError("register", error, { account: parsed.data.account });
      setErrorMessage(
        error instanceof Error ? error.message : "Đăng ký thất bại.",
      );
      return { ok: false };
    } finally {
      setIsSubmitting(false);
    }
  }

  async function logout() {
    setIsSubmitting(true);
    setErrorMessage(undefined);
    setNoticeMessage(undefined);

    try {
      await authService.logout();
      await refresh();
    } catch (error) {
      logAuthError("logout", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Đăng xuất thất bại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signInWithProvider(provider: AuthProvider, nextPath?: string) {
    setErrorMessage(undefined);
    setNoticeMessage(undefined);

    try {
      await authService.signInWithProvider(provider, nextPath);
    } catch (error) {
      logAuthError("signInWithProvider", error, { provider, nextPath });
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể bắt đầu đăng nhập mạng xã hội.",
      );
    }
  }

  return {
    user,
    customer,
    isAuthenticated: Boolean(user),
    isLoading,
    isSubmitting,
    errorMessage,
    noticeMessage,
    login,
    register,
    logout,
    refresh,
    signInWithProvider,
  };
}
