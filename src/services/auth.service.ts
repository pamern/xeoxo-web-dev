"use client";

import type {
  AuthProvider,
  LoginValues,
  MeResponse,
  RegisterValues,
} from "@/types/auth.types";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import { createClient } from "@/lib/supabase/client";

function getErrorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

function getErrorText(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "";
}

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
  const errorCode = getErrorCode(error);
  const errorText = getErrorText(error).trim();
  const normalizedText = errorText.toLowerCase();

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 429
  ) {
    return "Hệ thống đang giới hạn tần suất đăng ký hoặc gửi email xác nhận. Vui lòng đợi vài phút rồi thử lại.";
  }

  if (
    errorCode === "over_email_send_rate_limit"
  ) {
    return "Email xác nhận đang bị giới hạn tần suất gửi. Vui lòng đợi vài phút rồi thử lại.";
  }

  if (
    normalizedText.includes("user already registered") ||
    normalizedText.includes("user already exists")
  ) {
    return "Email đã tồn tại. Vui lòng sử dụng email khác.";
  }

  if (
    normalizedText.includes("phone number already registered") ||
    normalizedText.includes("phone already registered") ||
    normalizedText.includes("phone number has already been registered")
  ) {
    return "Số điện thoại đã tồn tại. Vui lòng sử dụng số điện thoại khác.";
  }

  if (
    normalizedText.includes("error sending confirmation email") ||
    normalizedText.includes("error sending confirmation mail") ||
    normalizedText.includes("error sending email") ||
    normalizedText.includes("smtp")
  ) {
    return "Không gửi được email xác thực. Vui lòng thử lại sau.";
  }

  if (errorText) {
    return errorText;
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
    payload?: any;
    metadata?: unknown;
  },
) {
  const isGuest = detail.response && isUnauthorizedResponse(detail.response, detail.payload);
  if (isGuest) {
    console.warn(`[authService/${scope}] Guest user (unauthorized)`, {
      status: detail.response?.status ?? null,
      statusText: detail.response?.statusText ?? null,
    });
  } else {
    console.error(`[authService/${scope}]`, {
      status: detail.response?.status ?? null,
      statusText: detail.response?.statusText ?? null,
      payload: detail.payload ?? null,
      metadata: detail.metadata ?? null,
    });
  }
}

export function isInvalidCredentialsError(error: unknown) {
  const normalizedText = getErrorText(error).trim().toLowerCase();

  return (
    normalizedText.includes("invalid login credentials") ||
    normalizedText.includes("invalid credentials") ||
    normalizedText.includes("invalid password")
  );
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
