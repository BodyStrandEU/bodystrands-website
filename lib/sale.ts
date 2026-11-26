// Sitewide sales. One switch for the whole store: every price goes through
// getSalePrice (lib/pricing.ts), which reads this.
//
// Black Friday: Fri Nov 27 - Sun Nov 29 2026 (ends Sunday midnight, Lisbon = UTC in Nov)
// Cyber Monday: Mon Nov 30 2026 (all day)
//
// Pages are pre-built, so the banner name and struck-through prices only change on a
// deploy. Checkout checks the clock on every request, so it never honours a sale outside
// its window. To switch from Black Friday to Cyber Monday (Mon) or to end the sale
// (Tue), push to main: the phases below pick the right one at build time.
//
// A product's own admin sale (salePercent) is never lowered: the bigger of the two applies.
export type SalePhase = { name: string; percent: number; start: string; end: string; endLabel: string };

export const SALE_PHASES: SalePhase[] = [
  { name: "Black Friday", percent: 25, start: "2026-11-26T00:00:00Z", end: "2026-11-29T23:59:59Z", endLabel: "Sunday midnight" },
  { name: "Cyber Monday", percent: 25, start: "2026-11-30T00:00:00Z", end: "2026-11-30T23:59:59Z", endLabel: "Monday midnight" },
];

export function activeSale(now: number = Date.now()): SalePhase | null {
  return SALE_PHASES.find((p) => p.percent > 0 && now >= Date.parse(p.start) && now <= Date.parse(p.end)) ?? null;
}

export const sitewideSalePercent = (now?: number) => activeSale(now)?.percent ?? 0;

/** The discount percent that actually applies to a product right now (0 = none). */
export function effectiveSalePercent(product: { salePercent?: number }): number {
  return Math.max(product.salePercent ?? 0, sitewideSalePercent());
}
