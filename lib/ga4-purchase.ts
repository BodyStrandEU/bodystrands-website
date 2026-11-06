// Server-side GA4 `purchase` event (Measurement Protocol), sent from the Stripe webhook.
//
// Why: the browser purchase event (success page) never fires when the buyer uses an ad blocker,
// closes the tab early, or hasn't accepted analytics consent (EU/UK/CH). Stripe is the source of
// truth, so we also report from the webhook. GA4 de-duplicates purchases that share a
// transaction_id, so when the browser event DOES fire the order is still counted once.
//
// Needs the Worker secret GA4_MP_API_SECRET (GA4 Admin → Data streams → web stream →
// Measurement Protocol API secrets). Without it this is a silent no-op.

const MEASUREMENT_ID = "G-8ZSFBD94RN";

type PurchaseInput = {
  transactionId: string;
  value: number;
  currency: string;
  itemName: string;
  shipping?: number;
  country?: string;
  // From the browser's _ga / _ga_<id> cookies, saved in Stripe metadata at checkout. They tie
  // the purchase to the visitor's original session so source/medium attribution survives.
  clientId?: string;
  sessionId?: string;
};

export async function sendGa4Purchase(p: PurchaseInput): Promise<void> {
  const secret = process.env.GA4_MP_API_SECRET;
  if (!secret) return;

  // No consented cookie → synthetic client id so the order is still counted (attributed to "direct").
  const clientId = p.clientId || `server.${p.transactionId.slice(-12)}`;

  const params: Record<string, unknown> = {
    transaction_id: p.transactionId,
    value: p.value,
    currency: p.currency,
    ...(p.shipping ? { shipping: p.shipping } : {}),
    items: [{ item_name: p.itemName, price: p.value, quantity: 1 }],
    // Required for the event to show up in standard (non-realtime-only) reports.
    engagement_time_msec: 1,
  };
  if (p.sessionId) params.session_id = p.sessionId;

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${encodeURIComponent(secret)}`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          events: [{ name: "purchase", params }],
        }),
      },
    );
    if (!res.ok) console.error("GA4 MP purchase failed:", res.status);
  } catch (e) {
    console.error("GA4 MP purchase error:", e);
  }
}

// "GA1.1.123456789.1700000000" → "123456789.1700000000"
export function parseGaClientId(cookie?: string): string | undefined {
  const m = cookie?.match(/^GA\d\.\d\.(\d+\.\d+)$/);
  return m?.[1];
}

// "GS2.1.s1700000000$o3$g1$t..." (or GS1.1.<ts>.…) → session id (the timestamp after "s" / first number)
export function parseGaSessionId(cookie?: string): string | undefined {
  if (!cookie) return undefined;
  const m = cookie.match(/^GS\d\.\d\.s(\d+)/) ?? cookie.match(/^GS1\.1\.(\d+)\./);
  return m?.[1];
}
