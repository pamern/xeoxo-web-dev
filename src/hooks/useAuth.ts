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
};

/**
 * Hook trung tâm quản lý trạng thái xác thực phía client.
 *
 * Trách nhiệm chính:
 * - Theo dõi session hiện tại và đồng bộ `user` / `customer` cho UI.
 * - Bọc các flow đăng nhập, đăng ký, đăng xuất và OAuth thành API dễ dùng.
 * - Chuẩn hóa loading, submitting, errorMessage và noticeMessage cho auth UI.
 */
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

  /**
   * Tải lại trạng thái đăng nhập hiện tại từ `/api/v1/auth/me`.
   *
   * Flow này được gọi khi:
   * - hook mount lần đầu;
   * - Supabase auth state thay đổi;
   * - một phần khác của app phát event `xeoxo:profile-updated`;
   * - login/register/logout hoàn tất và cần đồng bộ lại UI.
   *
   * Nếu request thất bại vì guest/session hết hạn thì hook chủ động reset về
   * trạng thái chưa đăng nhập thay vì ném lỗi lên UI.
   */
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

  /**
   * Xử lý đăng nhập bằng email hoặc số điện thoại.
   *
   * Trình tự:
   * 1. Validate input bằng Zod.
   * 2. Chuẩn hóa account qua `parseAuthIdentifier()`.
   * 3. Kiểm tra chặn tạm thời nếu nhập sai password quá nhiều lần ở client.
   * 4. Gọi API signin.
   * 5. Nếu thành công thì reset số lần sai, đồng bộ customer profile và refresh UI.
   *
   * Nếu sai credential, hook tăng bộ đếm failed login để tạm chặn các lần thử tiếp theo.
   */
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
      try {
        await authService.syncProfile();
      } catch (syncProfileError) {
        logAuthError("login-sync-profile", syncProfileError, {
          account: parsed.data.account,
        });
        setNoticeMessage(
          "Đăng nhập thành công nhưng chưa đồng bộ được hồ sơ khách hàng.",
        );
      }
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

  /**
   * Xử lý đăng ký bằng email hoặc số điện thoại.
   *
   * Trình tự:
   * 1. Validate input đăng ký.
   * 2. Gọi API signup.
   * 3. Route signup sẽ tự tạo session ngay sau khi tạo tài khoản.
   * 4. Hook đồng bộ customer profile và refresh lại auth state cho UI.
   */
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

      if (!result.hasSession) {
        throw new Error("Không thể tự động đăng nhập sau khi đăng ký.");
      }

      try {
        await authService.syncProfile();
      } catch (syncProfileError) {
        logAuthError("register-sync-profile", syncProfileError, {
          account: parsed.data.account,
        });
        setNoticeMessage(
          "Tài khoản đã được tạo và đăng nhập, nhưng chưa đồng bộ được hồ sơ khách hàng.",
        );
      }
      await refresh();
      return { ok: true };
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

  /**
   * Đăng xuất session hiện tại rồi refresh lại auth state cho toàn bộ UI.
   */
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

  /**
   * Khởi động flow đăng nhập OAuth như Google/Facebook.
   *
   * Hàm này chỉ bắt đầu redirect tới provider; phần tạo session và sync profile
   * sẽ tiếp tục ở auth callback route sau khi provider trả người dùng về app.
   */
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
