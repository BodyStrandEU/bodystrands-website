#!/usr/bin/env node
// Emails the owner the latest research run from data/trend-signals.json (Oct 8, 2026, user
// request: every report emailed). Runs right after scripts/research-blog-keywords.mjs.
// Sends to info@bodystrands.com, like every other owner notification.
import { Resend } from "resend";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TRENDS_FILE = join(__dirname, "../data/trend-signals.json");
const products = JSON.parse(readFileSync(join(__dirname, "../data/products.json"), "utf-8"));
const TO = "info@bodystrands.com";
const SITE = "https://www.bodystrands.com";

const { RESEND_API_KEY, RESEND_FROM_EMAIL } = process.env;
if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) { console.error("RESEND_API_KEY / RESEND_FROM_EMAIL not set"); process.exit(1); }
if (!existsSync(TRENDS_FILE)) { console.error("no data/trend-signals.json yet"); process.exit(1); }

const run = JSON.parse(readFileSync(TRENDS_FILE, "utf-8"))[0];
const byId = new Map(products.map((p) => [p.id, p]));
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const links = (ids) => ids.map((id) => byId.get(id)).filter(Boolean)
  .map((p) => `<a href="${SITE}/shop/${p.id}" style="color:#A0622A">${esc(p.name)}</a>`).join(", ");

const FIT = { "gap": ["#A4473A", "Gap — we don't sell this"], "partial": ["#B0702A", "Partly covered"], "we sell it": ["#3F7A55", "We sell this"] };
const MOMENTUM = { rising: "Rising", peaking: "Peaking now", steady: "Steady" };
const pill = (color, text) => `<span style="display:inline-block;padding:2px 8px;border:1px solid ${color};color:${color};font-size:11px;letter-spacing:.06em;text-transform:uppercase;margin-right:6px">${esc(text)}</span>`;

// Gaps first: they're the product ideas.
const order = { "gap": 0, "partial": 1, "we sell it": 2 };
const trends = [...run.trends].sort((a, b) => order[a.fit] - order[b.fit]);

const trendHtml = trends.map((t) => `
  <tr><td style="padding:18px 0;border-bottom:1px solid #E9DCD4">
    <div style="margin-bottom:6px">${pill(...FIT[t.fit])}${pill("#8C7B6E", MOMENTUM[t.momentum])}</div>
    <div style="font-family:Georgia,serif;font-size:20px;color:#2C2220;margin:6px 0">${esc(t.name)}</div>
    <p style="margin:0 0 8px">${esc(t.what)}</p>
    <p style="margin:0 0 8px;color:#8C7B6E"><b style="color:#2C2220">People search:</b> ${t.searches.map(esc).join(" · ")}</p>
    <p style="margin:0 0 8px;color:#8C7B6E"><b style="color:#2C2220">Evidence:</b> ${esc(t.evidence)}</p>
    ${t.sources?.length ? `<p style="margin:0 0 8px;color:#8C7B6E;font-size:13px"><b style="color:#2C2220">Sources:</b> ${t.sources.map((x) => x.url ? `<a href="${esc(x.url)}" style="color:#A0622A">${esc(x.name)}</a>` : esc(x.name)).join(" · ")}</p>` : ""}
    ${t.missing?.length ? `<p style="margin:0 0 8px"><b style="color:#A4473A">Missing from the shop:</b> ${t.missing.map(esc).join(", ")}</p>` : ""}
    ${t.productIds.length ? `<p style="margin:0 0 8px;color:#8C7B6E"><b style="color:#2C2220">Your pieces:</b> ${links(t.productIds)}</p>` : ""}
    <p style="margin:0"><b>Idea:</b> ${esc(t.idea)}</p>
  </td></tr>`).join("");

const list = (items, render) => items.length ? `<ul style="margin:0;padding-left:18px">${items.map((x) => `<li style="margin-bottom:8px">${render(x)}</li>`).join("")}</ul>` : `<p style="margin:0;color:#8C7B6E">None this run.</p>`;
const gapCount = run.trends.filter((t) => t.fit === "gap" || t.missing?.length).length + run.gaps.length;

const html = `<div style="background:#FDF9F7;padding:24px 12px">
<div style="max-width:640px;margin:0 auto;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#2C2220">
  <p style="font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#A0622A;margin:0 0 6px">Bodystrands research · ${esc(run.date)}</p>
  <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:28px;margin:0 0 10px">Trends and search signals</h1>
  <p style="margin:0 0 6px">${run.trends.length} product trends found, ${gapCount} possible product ${gapCount === 1 ? "gap" : "gaps"}, ${run.blogIdeas.length} new blog ${run.blogIdeas.length === 1 ? "post" : "posts"} queued.</p>
  <p style="margin:0 0 18px;color:#8C7B6E;font-size:13px">Gaps are listed first: trends people search for that the shop doesn't sell yet.</p>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #2C2220">${trendHtml}</table>

  <h2 style="font-family:Georgia,serif;font-weight:normal;font-size:20px;margin:28px 0 8px">Searches with no matching product</h2>
  <p style="margin:0 0 10px;color:#8C7B6E;font-size:13px">Blog ideas the research found but skipped, because nothing in the shop fits.</p>
  ${list(run.gaps, (g) => `<b>${esc(g.query)}</b> — ${esc(g.why)}`)}

  <h2 style="font-family:Georgia,serif;font-weight:normal;font-size:20px;margin:28px 0 8px">Blog posts queued from this research</h2>
  ${list(run.blogIdeas, (b) => `<b>${esc(b.query)}</b> — ${esc(b.why)}<br><span style="color:#8C7B6E;font-size:13px">Features: ${links(b.productIds)}</span>`)}

  <p style="margin:28px 0 0;color:#8C7B6E;font-size:12px">Sent after every Monday and Thursday research run. Researched with ${esc(run.researchModel)}.</p>
</div></div>`;

const subject = `Trend report ${run.date}: ${run.trends.length} trends, ${gapCount} product ${gapCount === 1 ? "gap" : "gaps"}`;
const res = await new Resend(RESEND_API_KEY).emails.send({ from: `Bodystrands Research <${RESEND_FROM_EMAIL}>`, to: TO, subject, html });
if (res.error) { console.error(res.error); process.exit(1); }
console.log(`Sent "${subject}" to ${TO} (${res.data?.id})`);
