"use client";

import type {
  AuthProvider,
  LoginValues,
  MeResponse,
  RegisterValues,
} from "@/types/auth.types";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { createClient } from "@/lib/supabase/client";

function getSiteUrl() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3002";
}

function normalizePath(path?: string) {
  if (!path || !path.startsWith("/")) {
    return "/";
  }

  return path;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 429
  ) {
    return "Hệ thống đang giới hạn tần suất đăng ký hoặc gửi email xác nhận. Vui lòng đợi vài phút rồi thử lại.";
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "over_email_send_rate_limit"
  ) {
    return "Email xác nhận đang bị giới hạn tần suất gửi. Vui lòng đợi vài phút rồi thử lại.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getApiErrorMessage(
  payload: {
    success: boolean;
    message?: string;
    error?: unknown;
  },
  fallback: string,
) {
  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return payload.message ?? fallback;
}

function isUnauthorizedResponse(
  response: Response,
  payload?: { error?: unknown },
) {
  return response.status === 401 || payload?.error === "Auth session missing";
}

function logAuthServiceError(
  scope: string,
  detail: {
    response?: Response;
    payload?: unknown;
    metadata?: unknown;
  },
) {
  console.error(`[authService/${scope}]`, {
    status: detail.response?.status ?? null,
    statusText: detail.response?.statusText ?? null,
    payload: detail.payload ?? null,
    metadata: detail.metadata ?? null,
  });
}

export const authService = {
  async login(values: LoginValues) {
    const supabase = createClient();
    const identifier = parseAuthIdentifier(values.account);

    if (!identifier) {
      throw new Error("Email hoặc số điện thoại không hợp lệ.");
    }

    const credentials =
      identifier.type === "email"
        ? { email: identifier.value, password: values.password }
        : { phone: identifier.value, password: values.password };

    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      throw new Error(getErrorMessage(error, "Đăng nhập thất bại."));
    }

    return data;
  },

  async register(values: RegisterValues, nextPath?: string) {
    const supabase = createClient();
    const identifier = parseAuthIdentifier(values.account);

    if (!identifier) {
      throw new Error("Email hoặc số điện thoại không hợp lệ.");
    }

    const redirectTo = `${getSiteUrl()}/api/v1/auth/callback?next=${encodeURIComponent(
      normalizePath(nextPath),
    )}`;

    const authPayload =
      identifier.type === "email"
        ? {
            email: identifier.value,
            password: values.password,
            options: {
              emailRedirectTo: redirectTo,
              data: {
                full_name: values.fullName.trim(),
              },
            },
          }
        : {
            phone: identifier.value,
            password: values.password,
            options: {
              channel: "sms" as const,
              data: {
                full_name: values.fullName.trim(),
                phone: identifier.value,
              },
            },
          };

    const { data, error } = await supabase.auth.signUp(authPayload);

    if (error) {
      throw new Error(getErrorMessage(error, "Đăng ký thất bại."));
    }

    return data;
  },

  async logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(getErrorMessage(error, "Đăng xuất thất bại."));
    }
  },

  async signInWithProvider(provider: AuthProvider, nextPath?: string) {
    const supabase = createClient();
    const redirectTo = `${getSiteUrl()}/api/v1/auth/callback?next=${encodeURIComponent(
      normalizePath(nextPath),
    )}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw new Error(
        getErrorMessage(error, "Không thể bắt đầu đăng nhập mạng xã hội."),
      );
    }

    return data;
  },

  async getMe() {
    const response = await fetch("/api/v1/auth/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
      error?: unknown;
      data?: MeResponse;
    };

    if (!response.ok || !payload.success || !payload.data) {
      logAuthServiceError("getMe", { response, payload });
      throw new Error(
        getApiErrorMessage(payload, "Không thể tải thông tin người dùng."),
      );
    }

    return payload.data;
  },

  async syncProfile() {
    const response = await fetch("/api/v1/auth/sync-profile", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
      error?: unknown;
      data?: { customer: MeResponse["customer"] };
    };

    if (isUnauthorizedResponse(response, payload)) {
      console.warn(
        "[authService/syncProfile] Unauthorized or missing session.",
        {
          status: response.status,
          payload,
        },
      );
      return null;
    }

    if (!response.ok || !payload.success) {
      logAuthServiceError("syncProfile", { response, payload });
      throw new Error(
        getApiErrorMessage(payload, "Không thể đồng bộ hồ sơ khách hàng."),
      );
    }

    return payload.data;
  },
};
