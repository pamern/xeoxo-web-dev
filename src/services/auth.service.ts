"use client";

import type {
  AuthProvider,
  LoginValues,
  MeResponse,
  RegisterValues,
} from "@/types/auth.types";
import { getAuthErrorMessage } from "@/lib/auth-error-message";
import { createClient } from "@/lib/supabase/client";

class AuthRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthRequestError";
  }
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

function getApiErrorMessage(
  payload: {
    success: boolean;
    message?: string;
    error?: unknown;
  },
  fallback: string,
) {
  if (payload.error) {
    return getAuthErrorMessage(payload.error, payload.message ?? fallback);
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
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
  if (error instanceof AuthRequestError) {
    return error.status === 401;
  }

  const normalizedText = getErrorText(error).trim().toLowerCase();

  return (
    normalizedText.includes("invalid login credentials") ||
    normalizedText.includes("invalid credentials") ||
    normalizedText.includes("invalid password") ||
    normalizedText.includes("email, số điện thoại hoặc mật khẩu không đúng")
  );
}

export const authService = {
  async login(values: LoginValues) {
    const response = await fetch("/api/v1/auth/signin", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
      error?: unknown;
      data?: { authenticated: boolean };
    };

    if (!response.ok || !payload.success || !payload.data?.authenticated) {
      throw new AuthRequestError(
        getApiErrorMessage(payload, "Đăng nhập thất bại."),
        response.status,
      );
    }

    return payload.data;
  },

  async register(values: RegisterValues, nextPath?: string) {
    const response = await fetch("/api/v1/auth/signup", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        nextPath: normalizePath(nextPath),
      }),
    });

    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
      error?: unknown;
      data?: { hasSession: boolean };
    };

    if (!response.ok || !payload.success || !payload.data) {
      throw new AuthRequestError(
        getApiErrorMessage(payload, "Đăng ký thất bại."),
        response.status,
      );
    }

    return payload.data;
  },

  async logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(getAuthErrorMessage(error, "Đăng xuất thất bại."));
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
        getAuthErrorMessage(error, "Không thể bắt đầu đăng nhập mạng xã hội."),
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
      throw new AuthRequestError(
        getApiErrorMessage(payload, "Không thể tải thông tin người dùng."),
        response.status,
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
      throw new AuthRequestError(
        getApiErrorMessage(payload, "Không thể đồng bộ hồ sơ khách hàng."),
        response.status,
      );
    }

    return payload.data;
  },
};
