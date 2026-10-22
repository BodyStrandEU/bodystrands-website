import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { currencyForCountry } from "@/lib/currency";
import { CONSENT_COUNTRIES, REGION_COOKIE } from "@/lib/consent";

const COOKIE_NAME     = "admin_token";
const CURRENCY_COOKIE = "bs_currency";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bare domain → www (Vercel did this at the edge; the Cloudflare Worker serves
  // both hostnames, which split carts/cookies between two origins). Page loads
  // only — API routes and non-GET requests are left alone so a webhook or form
  // POST configured against the bare domain never gets bounced by a redirect.
  const host = request.headers.get("host");
  if (host === "bodystrands.com" && (request.method === "GET" || request.method === "HEAD") && !pathname.startsWith("/api")) {
    return NextResponse.redirect(`https://www.bodystrands.com${pathname}${request.nextUrl.search}`, 301);
  }

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

  // Detect shopper's local currency from the edge's geo-IP header on every visit —
  // there's no manual currency switcher on the site, so nothing is lost by always
  // re-deriving it. Previously this only ran once per browser (gated on the cookie's
  // mere presence), so a shopper's currency stayed stuck at whatever country they were
  // in up to 30 days ago even after they'd moved somewhere else — confirmed Oct 14,
  // 2026 by a user who travelled Turkey -> Germany and kept seeing TRY prices.
  const response = NextResponse.next();
  const country  = request.headers.get("cf-ipcountry") ?? "";
  const currency = currencyForCountry(country);
  response.cookies.set(CURRENCY_COOKIE, currency, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  // Whether this visitor must be asked before analytics run (see lib/consent.ts). Unknown
  // country (e.g. local dev) counts as "eu" so nobody is tracked without asking by mistake.
  const region = country && !CONSENT_COUNTRIES.has(country.toUpperCase()) ? "row" : "eu";
  response.cookies.set(REGION_COOKIE, region, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!admin|api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
