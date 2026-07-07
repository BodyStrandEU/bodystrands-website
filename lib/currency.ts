export type CurrencyCode = "EUR" | "USD" | "GBP" | "CAD" | "CHF";

// All product/shipping prices in this codebase are stored in EUR — this
// module only ever converts EUR -> shopper-local currency for display.
export const CURRENCY_BY_COUNTRY: Record<string, CurrencyCode> = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  CH: "CHF",
};

export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

export const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  EUR: "en-IE",
  USD: "en-US",
  GBP: "en-GB",
  CAD: "en-CA",
  CHF: "de-CH",
};

// Safety net if the live rate fetch fails — approximate, not auto-updated.
export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.84,
  CAD: 1.47,
  CHF: 0.94,
};

export function currencyForCountry(countryCode: string | undefined | null): CurrencyCode {
  if (!countryCode) return DEFAULT_CURRENCY;
  return CURRENCY_BY_COUNTRY[countryCode.toUpperCase()] ?? DEFAULT_CURRENCY;
}

export function isCurrencyCode(value: string | undefined | null): value is CurrencyCode {
  return !!value && value in FALLBACK_RATES;
}

// ECB rates via Frankfurter (frankfurter.dev) — free, no API key, refreshed hourly.
export async function fetchExchangeRates(): Promise<Record<CurrencyCode, number>> {
  const targets = (Object.keys(FALLBACK_RATES) as CurrencyCode[]).filter((c) => c !== "EUR");
  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${targets.join(",")}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`rate fetch failed: ${res.status}`);
    const data = await res.json() as { rates: Record<string, number> };
    const rates = { EUR: 1 } as Record<CurrencyCode, number>;
    for (const c of targets) rates[c] = data.rates[c] ?? FALLBACK_RATES[c];
    return rates;
  } catch (e) {
    console.error("Exchange rate fetch failed, using fallback rates:", e);
    return FALLBACK_RATES;
  }
}

export function convert(eurAmount: number, currency: CurrencyCode, rates: Record<CurrencyCode, number>): number {
  return eurAmount * (rates[currency] ?? 1);
}

export function formatMoney(eurAmount: number, currency: CurrencyCode, rates: Record<CurrencyCode, number>): string {
  const converted = convert(eurAmount, currency, rates);
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(converted);
}
