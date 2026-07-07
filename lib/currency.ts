export type CurrencyCode =
  | "EUR" | "USD" | "GBP" | "CAD" | "CHF" | "AUD" | "NZD"
  | "JPY" | "KRW" | "SGD" | "HKD" | "TWD" | "INR" | "THB" | "IDR" | "MYR" | "PHP" | "VND"
  | "AED" | "SAR" | "QAR" | "KWD" | "BHD" | "ILS" | "TRY"
  | "NOK" | "ISK" | "BRL" | "MXN" | "ARS" | "CLP" | "COP" | "ZAR" | "NGN" | "EGP" | "MAD";

// All product/shipping prices in this codebase are stored in EUR — this module only ever
// converts EUR -> shopper-local currency for display. Covers every country in
// lib/shipping.ts's COUNTRY_GROUPS; EU member states are intentionally left out (they fall
// through to the EUR default) rather than mapped to their own national currencies.
export const CURRENCY_BY_COUNTRY: Record<string, CurrencyCode> = {
  US: "USD", CA: "CAD", GB: "GBP", CH: "CHF", AU: "AUD", NZ: "NZD",
  JP: "JPY", KR: "KRW", SG: "SGD", HK: "HKD", TW: "TWD", IN: "INR",
  TH: "THB", ID: "IDR", MY: "MYR", PH: "PHP", VN: "VND",
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD", IL: "ILS", TR: "TRY",
  NO: "NOK", IS: "ISK", BR: "BRL", MX: "MXN", AR: "ARS", CL: "CLP", CO: "COP",
  ZA: "ZAR", NG: "NGN", EG: "EGP", MA: "MAD",
};

export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

export const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  EUR: "en-IE", USD: "en-US", GBP: "en-GB", CAD: "en-CA", CHF: "de-CH",
  AUD: "en-AU", NZD: "en-NZ",
  JPY: "ja-JP", KRW: "ko-KR", SGD: "en-SG", HKD: "zh-HK", TWD: "zh-TW",
  INR: "en-IN", THB: "th-TH", IDR: "id-ID", MYR: "ms-MY", PHP: "en-PH", VND: "vi-VN",
  AED: "ar-AE", SAR: "ar-SA", QAR: "ar-QA", KWD: "ar-KW", BHD: "ar-BH", ILS: "he-IL", TRY: "tr-TR",
  NOK: "nb-NO", ISK: "is-IS", BRL: "pt-BR", MXN: "es-MX", ARS: "es-AR", CLP: "es-CL", COP: "es-CO",
  ZAR: "en-ZA", NGN: "en-NG", EGP: "ar-EG", MAD: "ar-MA",
};

// Safety net if the live rate fetch fails, or for currencies Frankfurter/ECB doesn't carry
// at all (see FRANKFURTER_SUPPORTED below) — approximate, not auto-updated. Worth refreshing
// these by hand every few months for the currencies that always rely on them.
export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  USD: 1.08, GBP: 0.84, CAD: 1.47, CHF: 0.94, AUD: 1.65, NZD: 1.79,
  JPY: 163, KRW: 1450, SGD: 1.45, HKD: 8.45, TWD: 34.5, INR: 90,
  THB: 38, IDR: 17000, MYR: 4.85, PHP: 61, VND: 27000,
  AED: 3.97, SAR: 4.05, QAR: 3.93, KWD: 0.332, BHD: 0.407, ILS: 4.0, TRY: 37,
  NOK: 11.7, ISK: 149, BRL: 6.1, MXN: 21.5, ARS: 1080, CLP: 1010, COP: 4350,
  ZAR: 19.8, NGN: 1650, EGP: 53, MAD: 10.8,
};

// Frankfurter (ECB reference rates) doesn't carry every currency above — these are the ones
// it does. Anything outside this set always uses the static FALLBACK_RATES value.
const FRANKFURTER_SUPPORTED = new Set<CurrencyCode>([
  "USD", "GBP", "CAD", "CHF", "AUD", "NZD", "JPY", "KRW", "SGD", "HKD",
  "INR", "THB", "IDR", "MYR", "PHP", "ILS", "TRY", "NOK", "ISK", "BRL", "MXN", "ZAR",
]);

export function currencyForCountry(countryCode: string | undefined | null): CurrencyCode {
  if (!countryCode) return DEFAULT_CURRENCY;
  return CURRENCY_BY_COUNTRY[countryCode.toUpperCase()] ?? DEFAULT_CURRENCY;
}

export function isCurrencyCode(value: string | undefined | null): value is CurrencyCode {
  return !!value && value in FALLBACK_RATES;
}

// Live rates via Frankfurter (frankfurter.dev) — free, no API key, refreshed hourly —
// merged with static fallback rates for the handful of currencies it doesn't carry.
export async function fetchExchangeRates(): Promise<Record<CurrencyCode, number>> {
  const allCodes = Object.keys(FALLBACK_RATES) as CurrencyCode[];
  const liveTargets = allCodes.filter((c) => c !== "EUR" && FRANKFURTER_SUPPORTED.has(c));
  const rates = { ...FALLBACK_RATES };

  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${liveTargets.join(",")}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`rate fetch failed: ${res.status}`);
    const data = await res.json() as { rates: Record<string, number> };
    for (const c of liveTargets) rates[c] = data.rates[c] ?? FALLBACK_RATES[c];
  } catch (e) {
    console.error("Exchange rate fetch failed, using fallback rates for live-tracked currencies:", e);
  }

  return rates;
}

export function convert(eurAmount: number, currency: CurrencyCode, rates: Record<CurrencyCode, number>): number {
  return eurAmount * (rates[currency] ?? 1);
}

export function formatMoney(eurAmount: number, currency: CurrencyCode, rates: Record<CurrencyCode, number>): string {
  const converted = convert(eurAmount, currency, rates);
  // No fraction-digit override — Intl already knows JPY/KRW/VND have zero decimal places
  // and applies the correct precision per currency automatically.
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
  }).format(converted);
}
