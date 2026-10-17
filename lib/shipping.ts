import { FALLBACK_RATES, type CurrencyCode } from "./currency";

export type ShippingRate = {
  displayName: string;
  amount:      number; // cents
  deliveryMin: number;
  deliveryMax: number;
  freeThreshold: number | null; // EUR cart total that unlocks free shipping, null = no free tier
};

const EU = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
  "DE","GR","HU","IE","IT","LV","LT","LU","MT","NL",
  "PL","PT","RO","SK","SI","ES","SE",
]);

export function getShippingRate(
  countryCode: string,
  cartTotal: number,
  // Live CAD rate (from lib/currency.ts's fetchExchangeRates) so Canada's free-shipping
  // cutoff always resolves to an exact $75 CAD, not a stale EUR approximation. US is a flat EUR threshold.
  // Defaults to the static fallback rates for call sites that only need deliveryMin/Max.
  rates: Record<CurrencyCode, number> = FALLBACK_RATES,
): ShippingRate {
  if (EU.has(countryCode)) {
    const free = cartTotal >= 50;
    return {
      displayName: free ? "Free Shipping — European Union" : "Standard Shipping — European Union",
      amount:      free ? 0 : 500,
      deliveryMin: 4, deliveryMax: 7,
      freeThreshold: 50,
    };
  }
  if (countryCode === "GB" || countryCode === "CH") {
    const free = cartTotal >= 50;
    return {
      displayName: free ? "Free Shipping — UK & Switzerland" : "Standard Shipping — UK & Switzerland",
      amount:      free ? 0 : 500,
      deliveryMin: 4, deliveryMax: 7,
      freeThreshold: 50,
    };
  }
  if (countryCode === "US") {
    // Exact $100 USD free-shipping threshold — converted to EUR using the live rate passed
    // in, not a hardcoded snapshot, so it always resolves to a real $100.00 regardless of
    // FX drift (same pattern as Canada's $75 CAD threshold below).
    const threshold = 100 / rates.USD;
    const free = cartTotal >= threshold;
    return {
      displayName: free ? "Free Shipping — USA" : "Standard Shipping — USA",
      amount:      free ? 0 : 1500,
      deliveryMin: 3, deliveryMax: 10,
      freeThreshold: threshold,
    };
  }
  if (countryCode === "CA") {
    // Exact $75 CAD threshold — converted to EUR using the live rate passed in, not a
    // hardcoded snapshot, so it always resolves to a real $75.00 regardless of FX drift.
    const threshold = 75 / rates.CAD;
    const free = cartTotal >= threshold;
    return {
      displayName: free ? "Free Shipping — Canada" : "Standard Shipping — Canada",
      amount:      free ? 0 : 500,
      deliveryMin: 3, deliveryMax: 10,
      freeThreshold: threshold,
    };
  }
  // Discounted tier added Oct 17, 2026 for the highest-traffic "Rest of World" countries
  // (ranked by all-time GA4 sessions): €8 standard, free over a clean native-currency number
  // close to a converted 50 EUR, same methodology as the US/CA thresholds above. China, Iran
  // and Pakistan also ranked high but aren't in COUNTRY_GROUPS below (not currently offered
  // as a checkout destination at all), so they're excluded here too until that's resolved.
  const DISCOUNTED_COUNTRIES: Record<string, { name: string; currency: CurrencyCode; freeTarget: number }> = {
    SG: { name: "Singapore",     currency: "SGD", freeTarget: 75 },
    IN: { name: "India",         currency: "INR", freeTarget: 4500 },
    AU: { name: "Australia",     currency: "AUD", freeTarget: 85 },
    BR: { name: "Brazil",        currency: "BRL", freeTarget: 305 },
    SA: { name: "Saudi Arabia",  currency: "SAR", freeTarget: 200 },
    TR: { name: "Turkey",        currency: "TRY", freeTarget: 1850 },
    AE: { name: "UAE",           currency: "AED", freeTarget: 200 },
  };
  const discounted = DISCOUNTED_COUNTRIES[countryCode];
  if (discounted) {
    const threshold = discounted.freeTarget / rates[discounted.currency];
    const free = cartTotal >= threshold;
    return {
      displayName: free ? `Free Shipping — ${discounted.name}` : `Standard Shipping — ${discounted.name}`,
      amount:      free ? 0 : 800,
      deliveryMin: 7, deliveryMax: 20,
      freeThreshold: threshold,
    };
  }
  return {
    displayName: "International Shipping — Rest of World",
    amount:      1500,
    deliveryMin: 7, deliveryMax: 20,
    freeThreshold: null,
  };
}

// Countries available in the shipping dropdown, grouped by zone
export const COUNTRY_GROUPS: { label: string; countries: { code: string; name: string }[] }[] = [
  {
    label: "European Union",
    countries: [
      { code: "AT", name: "Austria" }, { code: "BE", name: "Belgium" },
      { code: "BG", name: "Bulgaria" }, { code: "HR", name: "Croatia" },
      { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czech Republic" },
      { code: "DK", name: "Denmark" }, { code: "EE", name: "Estonia" },
      { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
      { code: "DE", name: "Germany" }, { code: "GR", name: "Greece" },
      { code: "HU", name: "Hungary" }, { code: "IE", name: "Ireland" },
      { code: "IT", name: "Italy" }, { code: "LV", name: "Latvia" },
      { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" },
      { code: "MT", name: "Malta" }, { code: "NL", name: "Netherlands" },
      { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" },
      { code: "RO", name: "Romania" }, { code: "SK", name: "Slovakia" },
      { code: "SI", name: "Slovenia" }, { code: "ES", name: "Spain" },
      { code: "SE", name: "Sweden" },
    ],
  },
  {
    label: "UK & Switzerland",
    countries: [
      { code: "GB", name: "United Kingdom" },
      { code: "CH", name: "Switzerland" },
    ],
  },
  {
    label: "USA & Canada",
    countries: [
      { code: "US", name: "United States" },
      { code: "CA", name: "Canada" },
    ],
  },
  {
    label: "Rest of World",
    countries: [
      { code: "AU", name: "Australia" }, { code: "NZ", name: "New Zealand" },
      { code: "JP", name: "Japan" }, { code: "KR", name: "South Korea" },
      { code: "SG", name: "Singapore" }, { code: "HK", name: "Hong Kong" },
      { code: "TW", name: "Taiwan" }, { code: "IN", name: "India" },
      { code: "TH", name: "Thailand" }, { code: "ID", name: "Indonesia" },
      { code: "MY", name: "Malaysia" }, { code: "PH", name: "Philippines" },
      { code: "VN", name: "Vietnam" }, { code: "AE", name: "UAE" },
      { code: "SA", name: "Saudi Arabia" }, { code: "QA", name: "Qatar" },
      { code: "KW", name: "Kuwait" }, { code: "BH", name: "Bahrain" },
      { code: "IL", name: "Israel" }, { code: "TR", name: "Turkey" },
      { code: "NO", name: "Norway" }, { code: "IS", name: "Iceland" },
      { code: "BR", name: "Brazil" }, { code: "MX", name: "Mexico" },
      { code: "AR", name: "Argentina" }, { code: "CL", name: "Chile" },
      { code: "CO", name: "Colombia" }, { code: "ZA", name: "South Africa" },
      { code: "NG", name: "Nigeria" }, { code: "EG", name: "Egypt" },
      { code: "MA", name: "Morocco" },
    ],
  },
];

// All supported country codes (for Stripe allowed_countries)
export const ALL_COUNTRIES = COUNTRY_GROUPS.flatMap((g) => g.countries.map((c) => c.code));
