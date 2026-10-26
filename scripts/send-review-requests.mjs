// Automatically emails a review request to every paid order that is 7–14 days old and
// hasn't been asked yet. Run daily via .github/workflows/review-request.yml. The 7-day
// catch-up window means a skipped or delayed run never loses an order — the next run
// picks it up; the review_requested_at stamp stops anyone getting it twice.
//
// Mirrors the logic in app/(site)/api/admin/request-review/route.ts exactly, so an
// order requested automatically here and one requested manually via the admin
// panel can never double-send (both check/set the same PaymentIntent metadata flag).
//
// Safety: defaults to DRY RUN (lists what it would send, sends nothing). Pass
// --live (or LIVE=true) to actually send emails and stamp metadata.
//
// Run via: node scripts/send-review-requests.mjs [--live]

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createHmac } from "crypto";
import Stripe from "stripe";
import { Resend } from "resend";
import { buildReviewEmail } from "./review-email.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const LIVE = process.argv.includes("--live") || process.env.LIVE === "true";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const REVIEW_TOKEN_SECRET = process.env.REVIEW_TOKEN_SECRET;

for (const [name, val] of Object.entries({ STRIPE_SECRET_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL, REVIEW_TOKEN_SECRET })) {
  if (!val) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
}

const stripe = new Stripe(STRIPE_SECRET_KEY);
const resend = new Resend(RESEND_API_KEY);
const products = JSON.parse(readFileSync(join(ROOT, "data/products.json"), "utf8"));

// Same signing scheme as lib/reviewToken.ts, duplicated here since plain Node
// scripts (run via `node`, no TS loader) can't import the .ts module directly.
const SIXTY_DAYS = 60 * 24 * 60 * 60;
function sign(data) {
  return createHmac("sha256", REVIEW_TOKEN_SECRET).update(data).digest("base64url");
}
// Same as reviewerName() in lib/reviewToken.ts: "stacey marie smith" → "Stacey S."
function reviewerName(fullName) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return undefined;
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  return parts.length > 1 ? `${cap(parts[0])} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : cap(parts[0]);
}
function createReviewToken(sessionId, category, productName, productId, customerName) {
  const payload = {
    sessionId,
    category,
    productName,
    productId,
    customerName,
    exp: Math.floor(Date.now() / 1000) + SIXTY_DAYS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

// Orders placed 7 to 14 days ago (UTC day boundaries). Each order is emailed on the first
// run once it's a week old; already-stamped orders are skipped on later runs.
function sevenDaysAgoWindow() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 14, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7, 23, 59, 59));
  return { gte: Math.floor(start.getTime() / 1000), lte: Math.floor(end.getTime() / 1000) };
}

async function listSessionsInWindow({ gte, lte }) {
  const sessions = [];
  for await (const session of stripe.checkout.sessions.list({
    created: { gte, lte },
    limit: 100,
    expand: ["data.payment_intent"],
  })) {
    sessions.push(session);
  }
  return sessions;
}

async function main() {
  const window = sevenDaysAgoWindow();
  console.log(`Checking orders created ${new Date(window.gte * 1000).toISOString()} .. ${new Date(window.lte * 1000).toISOString()}`);
  console.log(LIVE ? "Mode: LIVE — will send real emails" : "Mode: DRY RUN — no emails will be sent");

  const sessions = await listSessionsInWindow(window);
  console.log(`Found ${sessions.length} checkout session(s) in that window`);

  let sent = 0, skippedUnpaid = 0, skippedAlreadyRequested = 0, skippedNoEmail = 0;

  for (const session of sessions) {
    if (session.payment_status !== "paid") { skippedUnpaid++; continue; }

    const pi = session.payment_intent;
    const alreadyRequested = pi && typeof pi === "object" && pi.metadata?.review_requested_at;
    if (alreadyRequested) { skippedAlreadyRequested++; continue; }

    const email = session.customer_details?.email;
    if (!email) { skippedNoEmail++; continue; }

    const name = session.collected_information?.shipping_details?.name || session.customer_details?.name || "there";
    const firstName = name.split(" ")[0];

    const productId = session.metadata?.productId;
    const productName = session.metadata?.productName ?? "your order";
    const product = productId
      ? products.find((p) => p.id === productId)
      : products.find((p) => productName.startsWith(p.name));
    const category = product?.category ?? "General";

    const token = createReviewToken(session.id, category, productName, product?.id, reviewerName(name === "there" ? null : name));
    const reviewUrl = `https://www.bodystrands.com/review/${token}`;

    console.log(`${LIVE ? "Sending" : "Would send"} review request: ${email} — ${productName} (order ${session.id})`);

    if (LIVE) {
      await resend.emails.send({
        from: `Bodystrands <${RESEND_FROM_EMAIL}>`,
        to: email,
        subject: `How's your ${productName.split(" — ")[0]}?`,
        ...(await buildReviewEmail({ firstName, productName, product, reviewUrl })),
      });

      if (pi && typeof pi === "object") {
        // The stamp is what prevents a second email tomorrow — fail loudly if it doesn't stick
        await stripe.paymentIntents.update(pi.id, {
          metadata: { review_requested_at: new Date().toISOString() },
        }).catch((e) => { console.error(`Could not mark order ${session.id} as requested:`, e.message); process.exitCode = 1; });
      }
    }

    sent++;
  }

  console.log(`\n${LIVE ? "Sent" : "Would send"}: ${sent}`);
  console.log(`Skipped — not paid: ${skippedUnpaid}`);
  console.log(`Skipped — already requested: ${skippedAlreadyRequested}`);
  console.log(`Skipped — no email on file: ${skippedNoEmail}`);
}

main().catch((err) => {
  console.error("send-review-requests failed:", err);
  process.exit(1);
});
