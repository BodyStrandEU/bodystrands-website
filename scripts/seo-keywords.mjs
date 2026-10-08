#!/usr/bin/env node
// Writes data/seo-keywords.json: one shared keyword file for every place that needs search
// wording — product titles + meta descriptions, category guides, Pinterest copy, Instagram
// hashtags, Etsy titles (Oct 8, 2026, user request: "use the same SEO research for everything").
//
// Per product and per category it records:
//   - queries:  the real searches Google showed that page for (Search Console, last 90 days)
//   - research: long-tail keywords from the twice-weekly research queue (data/blog-queue.json)
//               that the research matched to the product / its category
//   - ai:       visits from AI assistants (ChatGPT etc.) that landed on the page (GA4)
//   - sales:    purchases from sessions that landed on the page (GA4)
// plus `opportunities`: searches where a page already sits in positions 3-20 with real
// impressions — the cheapest wins, since a better title/description can move them.
//
// No AI calls — pure data. Reads Google either directly (GA4_SERVICE_ACCOUNT_JSON + GA4_PROPERTY_ID)
// or, when those aren't set, through the live site's admin report endpoint (ADMIN_PASSWORD) —
// the Google key itself only lives in the Worker's secrets.
// Usage: node scripts/seo-keywords.mjs [--days 90]

import { readFileSync, writeFileSync } from "fs";
import { createSign } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../data/seo-keywords.json");
const products = JSON.parse(readFileSync(join(__dirname, "../data/products.json"), "utf-8"));
const queue = JSON.parse(readFileSync(join(__dirname, "../data/blog-queue.json"), "utf-8"));
const daysIdx = process.argv.indexOf("--days");
const DAYS = daysIdx > 0 ? Number(process.argv[daysIdx + 1]) : 90;

const creds = process.env.GA4_SERVICE_ACCOUNT_JSON;
const SITE = "https://www.bodystrands.com";
if (!creds && !process.env.ADMIN_PASSWORD) { console.error("Set GA4_SERVICE_ACCOUNT_JSON (+ GA4_PROPERTY_ID) or ADMIN_PASSWORD"); process.exit(1); }

async function token(scope) {
  const sa = JSON.parse(creds);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: sa.client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function call(url, tok, body) {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${url} ${res.status}: ${await res.text()}`);
  return res.json();
}

// Admin endpoint session (only used without a local Google key).
let cookie = null;
async function viaSite(body) {
  if (!cookie) {
    const res = await fetch(`${SITE}/api/admin/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }) });
    if (!res.ok) throw new Error(`admin login failed: ${res.status}`);
    cookie = (res.headers.getSetCookie?.() ?? [res.headers.get("set-cookie")]).map((c) => c.split(";")[0]).join("; ");
  }
  const res = await fetch(`${SITE}/api/admin/google-report`, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`google-report ${res.status}: ${await res.text()}`);
  return res.json();
}

async function searchRows(body) {
  if (!creds) return (await viaSite({ api: "gsc", body })).rows ?? [];
  const tok = await token("https://www.googleapis.com/auth/webmasters.readonly");
  const sites = ((await call("https://searchconsole.googleapis.com/webmasters/v3/sites", tok)).siteEntry ?? [])
    .filter((s) => s.permissionLevel !== "siteUnverifiedUser").map((s) => s.siteUrl);
  const site = sites.find((s) => s.startsWith("sc-domain:")) ?? sites.find((s) => s.includes("www.bodystrands.com")) ?? sites[0];
  return (await call(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, tok, body)).rows ?? [];
}

async function ga4Report(body) {
  if (!creds) return viaSite({ api: "ga4", body });
  if (!process.env.GA4_PROPERTY_ID) return null;
  const tok = await token("https://www.googleapis.com/auth/analytics.readonly");
  return call(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`, tok, body);
}

const day = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
const start = day(DAYS + 3), end = day(3); // Search Console lags ~2-3 days

/** "/shop/<id>" -> {product}, "/shop?category=X" -> {category}. */
function classify(url) {
  const u = new URL(url, "https://www.bodystrands.com");
  const m = u.pathname.match(/^\/shop\/([^/]+)\/?$/);
  if (m) return { product: m[1] };
  if (u.pathname.replace(/\/$/, "") === "/shop" && u.searchParams.get("category")) return { category: u.searchParams.get("category") };
  return null;
}

async function main() {
  const byId = new Map(products.map((p) => [p.id, p]));
  const out = { generatedAt: new Date().toISOString().slice(0, 10), window: { start, end }, products: {}, categories: {}, opportunities: [] };
  const prod = (id) => (out.products[id] ??= { queries: [], research: [], ai: 0, sales: 0 });
  const cat = (c) => (out.categories[c] ??= { queries: [], research: [] });
  for (const p of products) if (p.active !== false) { prod(p.id); cat(p.category); }

  // ── Search Console: page × query ──
  const rows = await searchRows({ startDate: start, endDate: end, dimensions: ["page", "query"], rowLimit: 25000 });
  for (const r of rows) {
    const [page, q] = r.keys;
    const row = { q, impressions: r.impressions, clicks: r.clicks, position: Math.round(r.position * 10) / 10 };
    const where = classify(page);
    if (where?.product && byId.has(where.product)) prod(where.product).queries.push(row);
    else if (where?.category) cat(where.category).queries.push(row);
    if (row.position >= 3 && row.position <= 20 && row.impressions >= 15) {
      out.opportunities.push({ page: new URL(page).pathname + new URL(page).search, ...row });
    }
  }

  // ── Research queue: keywords the research matched to products / categories ──
  for (const e of queue) {
    const kws = [e.query, ...(e.keywords ?? [])].filter(Boolean);
    for (const id of e.productIds ?? []) if (out.products[id]) out.products[id].research.push(...kws);
    for (const c of e.productCategories ?? []) if (out.categories[c]) out.categories[c].research.push(...kws);
  }

  // ── GA4: AI-assistant visits and sales per landing page ──
  const rep = await ga4Report({
    dateRanges: [{ startDate: start, endDate: day(0) }],
    dimensions: [{ name: "landingPage" }, { name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }, { name: "ecommercePurchases" }],
    limit: 10000,
  });
  if (rep) {
    for (const r of rep.rows ?? []) {
      const where = classify(r.dimensionValues[0].value);
      if (!where?.product || !out.products[where.product]) continue;
      const p = out.products[where.product];
      if (r.dimensionValues[1].value === "AI Assistant") p.ai += Number(r.metricValues[0].value);
      p.sales += Number(r.metricValues[1].value);
    }
  } else console.error("GA4 not available — skipping AI visits and sales");

  // Tidy: strongest searches first, deduped research keywords.
  const sortQ = (a, b) => b.clicks - a.clicks || b.impressions - a.impressions;
  for (const v of [...Object.values(out.products), ...Object.values(out.categories)]) {
    v.queries = v.queries.sort(sortQ).slice(0, 15);
    v.research = [...new Set(v.research.map((k) => k.toLowerCase()))].slice(0, 15);
  }
  out.opportunities = out.opportunities.sort((a, b) => b.impressions - a.impressions).slice(0, 60);

  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  const withQ = Object.values(out.products).filter((p) => p.queries.length).length;
  console.error(`wrote data/seo-keywords.json — ${rows.length} search rows, ${withQ}/${Object.keys(out.products).length} products with real searches, ${out.opportunities.length} opportunities`);
}

main().catch((e) => { console.error(e); process.exit(1); });
