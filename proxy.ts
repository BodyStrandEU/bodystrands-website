import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { currencyForCountry } from "@/lib/currency";

const COOKIE_NAME     = "admin_token";
const CURRENCY_COOKIE = "bs_currency";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and login API through (no cookie yet)
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  // Protect /admin/* and /api/admin/*
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Detect shopper's local currency from Vercel's geo-IP header, once per browser
  const response = NextResponse.next();
  if (!request.cookies.get(CURRENCY_COOKIE)) {
    const country  = request.headers.get("x-vercel-ip-country") ?? "";
    const currency = currencyForCountry(country);
    response.cookies.set(CURRENCY_COOKIE, currency, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!admin|api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
