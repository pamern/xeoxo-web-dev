import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  isAuthSessionMissing,
  isAuthUserMissing,
  isRefreshTokenNotFound,
  isTransientAuthNetworkError,
} from "@/features/auth/auth.service";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env variable: NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing env variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export async function updateSession(request: NextRequest) {
  const url = supabaseUrl;
  const key = supabaseAnonKey;

  if (!url) {
    throw new Error("Missing env variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!key) {
    throw new Error("Missing env variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Parameters<typeof response.cookies.set>[2];
        }>
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.getUser();

  if (error) {
    if (
      isAuthSessionMissing(error) ||
      isAuthUserMissing(error) ||
      isRefreshTokenNotFound(error)
    ) {
      return response;
    }

    if (isTransientAuthNetworkError(error)) {
      console.warn("[supabase-middleware] transient auth network error", error);
      return response;
    }

    throw new Error(error.message);
  }

  return response;
}
