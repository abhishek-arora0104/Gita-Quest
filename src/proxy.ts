import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session-refresh";
import {
  DEFAULT_LOCALE,
  getLocaleFromPath,
  isLocale,
  stripLocaleFromPath,
  withLocale,
} from "@/lib/i18n/config";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    const cookieLocale = request.cookies.get("gita-locale")?.value;
    const preferredLocale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
    return Response.redirect(new URL(withLocale("/", preferredLocale), request.url));
  }

  const locale = getLocaleFromPath(pathname);
  if (locale) {
    const headers = new Headers(request.headers);
    headers.set("x-gita-locale", locale);

    const authResponse = await updateSession(request);
    if (authResponse.headers.get("location")) {
      return authResponse;
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = stripLocaleFromPath(pathname);

    const nextResponse = NextResponse.rewrite(rewriteUrl, {
      request: { headers },
    });
    authResponse.cookies.getAll().forEach((cookie) => {
      nextResponse.cookies.set(cookie);
    });
    nextResponse.cookies.set("gita-locale", locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return nextResponse;
  }

  const cookieLocale = request.cookies.get("gita-locale")?.value;
  const preferredLocale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = withLocale(pathname, preferredLocale);
  return Response.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
