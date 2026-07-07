"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CurrencyCode, DEFAULT_CURRENCY, isCurrencyCode, formatMoney } from "@/lib/currency";

type CurrencyCtx = {
  currency: CurrencyCode;
  rates:    Record<CurrencyCode, number>;
  format:   (eurAmount: number) => string;
};

const CurrencyContext = createContext<CurrencyCtx | null>(null);

function readCookie(name: string): string | undefined {
  return document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))?.split("=")[1];
}

// Rates are fetched server-side (cached, doesn't block static generation).
// Currency is read from the geo cookie client-side on mount instead of via next/headers'
// cookies() in the root layout — that API forces every page on the site into full
// per-request dynamic rendering, which would undo the site's static/SSG performance.
export function CurrencyProvider({
  rates, children,
}: {
  rates:    Record<CurrencyCode, number>;
  children: ReactNode;
}) {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    const fromCookie = readCookie("bs_currency");
    if (isCurrencyCode(fromCookie)) setCurrency(fromCookie);
  }, []);

  const value: CurrencyCtx = {
    currency,
    rates,
    format: (eurAmount: number) => formatMoney(eurAmount, currency, rates),
  };
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
