// Cookie consent — who has to be asked, and what they answered.
//
// EU/EEA, UK and Swiss law requires opt-in before analytics/marketing cookies, and saying
// no must be as easy as saying yes. Everywhere else, analytics run by default and the
// shopper can still opt out from "Cookie settings" in the footer. The visitor's region is
// set by proxy.ts from Cloudflare's geo-IP header (cookie "bs_region": "eu" | "row");
// unknown counts as "eu" so we never track without asking where it's required.

export const CONSENT_KEY = "bs_cookie_consent";
export const REGION_COOKIE = "bs_region";

// EU 27 + Iceland, Liechtenstein, Norway (EEA) + UK + Switzerland
export const CONSENT_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT",
  "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
]);

export function readRegion(): "eu" | "row" {
  if (typeof document === "undefined") return "eu";
  const m = document.cookie.match(/(?:^|; )bs_region=([^;]+)/);
  return m?.[1] === "row" ? "row" : "eu";
}

export function readChoice(): "granted" | "denied" | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch { return null; }
}

/** The banner is up: an EU/UK/CH visitor who hasn't answered yet */
export const bannerPending = () => readRegion() === "eu" && readChoice() === null;
