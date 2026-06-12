import { NextRequest, NextResponse } from "next/server";
import { localeCookieName, shouldPreferEnglish } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/line") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname !== "/") return NextResponse.next();

  const savedLocale = request.cookies.get(localeCookieName)?.value;
  if (savedLocale === "ja") return NextResponse.next();
  if (savedLocale === "en" || shouldPreferEnglish(request.headers.get("accept-language"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
