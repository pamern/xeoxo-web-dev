import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  isIamSchemaUnavailable,
} from "@/features/auth/auth.service";
import { syncCustomerProfile } from "@/features/auth/profile-sync.service";

function normalizeNextPath(next: string | null) {
  if (!next || !next.startsWith("/")) {
    return "/";
  }

  return next;
}

function appendAuthError(path: string) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("auth", "login");
  url.searchParams.set("authError", "oauth_callback");

  return `${url.pathname}${url.search}`;
}

function appendProfileSyncError(path: string, detail?: string) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("auth", "login");
  url.searchParams.set("authError", "profile_sync");
  if (detail) {
    url.searchParams.set("authDetail", detail);
  }

  return `${url.pathname}${url.search}`;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = normalizeNextPath(requestUrl.searchParams.get("next"));
  const redirectUrl = new URL(next, requestUrl.origin);

  if (!code) {
    return NextResponse.redirect(new URL(appendAuthError(next), requestUrl.origin));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] Failed to exchange code for session.", error);
      return NextResponse.redirect(new URL(appendAuthError(next), requestUrl.origin));
    }

    const user = await getAuthenticatedUser(supabase);
    if (user) {
      try {
        await syncCustomerProfile(user);
      } catch (error) {
        if (isIamSchemaUnavailable(error)) {
          console.warn(
            "[auth/callback] Skipping customer profile sync because schema iam is not exposed in Supabase Data API."
          );
          return NextResponse.redirect(redirectUrl);
        }

        console.error("[auth/callback] Failed to sync customer profile.", error);
        return NextResponse.redirect(
          new URL(
            appendProfileSyncError(
              next,
              error instanceof Error ? error.message : "Unknown profile sync error"
            ),
            requestUrl.origin
          )
        );
      }
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("[auth/callback] Unexpected callback error.", error);
    return NextResponse.redirect(new URL(appendAuthError(next), requestUrl.origin));
  }
}
