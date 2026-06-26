import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getLocaleFromPath,
  stripLocaleFromPath,
  withLocale,
} from "@/lib/i18n/config";

/** Routes that require authentication — unauthenticated users are bounced to login. */
const PROTECTED_ROUTES = ["/dashboard"];

/** Routes only for guests — authenticated users are bounced to dashboard. */
const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

/**
 * Refreshes the Supabase session on every request, stores it back in cookies,
 * and enforces route-level auth guards (protected + guest-only routes).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase env is not configured, skip session handling (e.g. first-run docs build).
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not run code between createServerClient and getUser.
  // getUser() refreshes the session token and must be awaited.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = stripLocaleFromPath(request.nextUrl.pathname);
  const locale =
    getLocaleFromPath(request.nextUrl.pathname) ??
    getLocaleFromPath(`/${request.headers.get("x-gita-locale") ?? ""}`);

  // ── Protected routes: bounce unauthenticated users to login ──
  if (!user && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = locale ? withLocale("/auth/login", locale) : "/auth/login";
    loginUrl.searchParams.set("redirectTo", locale ? withLocale(pathname, locale) : pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Auth routes: bounce authenticated users to dashboard ──
  if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = locale ? withLocale("/dashboard", locale) : "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  return supabaseResponse;
}
