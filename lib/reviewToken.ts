import { createHmac, timingSafeEqual } from "crypto";

// Signed, stateless "leave a review" links — proves the holder actually completed
// this specific Stripe order, without needing a login system or a token database.
export type ReviewTokenPayload = {
  sessionId:   string;
  category:    string;
  productName: string;
  productId?:  string; // undefined for multi-item cart orders we couldn't resolve to one product
  exp:         number; // unix seconds
};

function secret(): string {
  const s = process.env.REVIEW_TOKEN_SECRET;
  if (!s) throw new Error("REVIEW_TOKEN_SECRET env var is not set");
  return s;
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

const SIXTY_DAYS = 60 * 24 * 60 * 60;

export function createReviewToken(sessionId: string, category: string, productName: string, productId?: string): string {
  const payload: ReviewTokenPayload = {
    sessionId,
    category,
    productName,
    productId,
    exp: Math.floor(Date.now() / 1000) + SIXTY_DAYS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig  = sign(body);
  return `${body}.${sig}`;
}

export function verifyReviewToken(token: string): ReviewTokenPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expectedSig = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as ReviewTokenPayload;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
