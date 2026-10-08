#!/usr/bin/env node
// Drafts Google titles + meta descriptions for pages that already rank on page 1-2 but get
// few clicks (the `opportunities` in data/seo-keywords.json). Writes data/seo-overrides.json,
// which the blog, category and product pages read for their <title> and description.
// Visible page copy (headlines, product names) is never changed — only what Google shows.
//
// NOT automatic (user decision, Oct 8, 2026): SEO needs time, so a page's Google copy is only
// rewritten once it has had 3 months (MIN_AGE_DAYS) since its last change and still isn't
// getting clicks or sales. Pages changed more recently are skipped; --force overrides.
//
// Usage: node scripts/seo-ctr-rewrite.mjs [--max 25] [--force]
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (f) => JSON.parse(readFileSync(join(__dirname, "..", f), "utf-8"));
const OUT = join(__dirname, "../data/seo-overrides.json");
const kw = read("data/seo-keywords.json");
const posts = read("data/blog-posts.json");
const products = read("data/products.json");
const redirects = read("data/blog-redirects.json");
const cfg = readFileSync(join(__dirname, "../next.config.ts"), "utf-8");
const shopSrc = readFileSync(join(__dirname, "../app/(site)/shop/page.tsx"), "utf-8");
const phrases = read("data/product-title-phrases.json");
const maxIdx = process.argv.indexOf("--max");
const MAX = maxIdx > 0 ? Number(process.argv[maxIdx + 1]) : 25;
const MODEL = "claude-opus-5";
const MIN_AGE_DAYS = 90;
const FORCE = process.argv.includes("--force");
const BANNED = /elevat|effortless|timeless|stunning|curated|must-have|etsy|316l|solid gold|link in bio/i;

// Old blog URLs Google still shows -> the live post they redirect to.
const hop = new Map([
  ...redirects.map((r) => [r.source, r.destination]),
  ...[...cfg.matchAll(/source:\s*"(\/blog\/[^"]+)",\s*destination:\s*"(\/blog\/[^"]+)"/g)].map((m) => [m[1], m[2]]),
]);
const live = (path) => { let p = path.replace(/\/$/, ""); for (let i = 0; i < 5 && hop.has(p); i++) p = hop.get(p); return p; };

/** Current Google title/description for a page, or null if it isn't one we can override. */
function current(path) {
  const u = new URL(path, "https://www.bodystrands.com");
  const blog = u.pathname.match(/^\/blog\/([^/]+)$/);
  if (blog) {
    const p = posts.find((x) => x.slug === blog[1]);
    return p && { kind: "blog", title: `${p.title} | Bodystrands`, description: p.excerpt, about: p.title };
  }
  const prod = u.pathname.match(/^\/shop\/([^/]+)$/);
  if (prod) {
    const p = products.find((x) => x.id === prod[1]);
    return p && { kind: "product", title: `${p.name} | ${phrases[p.id] ?? p.category} | Bodystrands`, description: p.altText ?? "", about: `${p.name} — ${p.category}, €${p.price}. ${String(p.description ?? "").slice(0, 300)}` };
  }
  const cat = u.searchParams.get("category");
  if (u.pathname === "/shop" && cat) {
    const m = shopSrc.match(new RegExp(`"${cat.replace(/[.*+?^${}()|[\]\\&]/g, "\\$&")}":\\s*\\{\\s*title:\\s*"([^"]+)",\\s*description:\\s*"([^"]+)"`));
    return m && { kind: "category", title: m[1], description: m[2], about: `shop category page: ${cat}` };
  }
  return null;
}

// Group opportunity searches by the live page they now land on.
const pages = new Map();
for (const o of kw.opportunities) {
  const key = (() => { const u = new URL(o.page, "https://www.bodystrands.com"); return u.pathname.startsWith("/blog/") ? live(u.pathname) : o.page; })();
  const cur = current(key);
  if (!cur) continue;
  const g = pages.get(key) ?? { path: key, ...cur, queries: [], impressions: 0 };
  g.queries.push(o); g.impressions += o.impressions; pages.set(key, g);
}
// Respect the 3-month rule: skip pages whose Google copy changed less than MIN_AGE_DAYS ago,
// and products that sold in the data window (they're working — leave them alone).
const prior = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf-8")) : {};
const ageDays = (d) => (Date.now() - new Date(d).getTime()) / 86400000;
// Last change before this tool existed: product title phrases and category titles were all
// rewritten on Oct 2, 2026; a blog post counts from its publish date.
const BASELINE = { product: "2026-10-02", category: "2026-10-02" };
for (const [path, g] of pages) {
  const changed = prior[path]?.updated ?? BASELINE[g.kind] ?? posts.find((x) => `/blog/${x.slug}` === path)?.date?.slice(0, 10);
  const sold = g.kind === "product" && (kw.products[path.split("/").pop()]?.sales ?? 0) > 0;
  if (!FORCE && ((changed && ageDays(changed) < MIN_AGE_DAYS) || sold)) {
    console.error(`skip ${path}: ${sold ? "has sales" : `changed ${changed}, under ${MIN_AGE_DAYS} days`}`);
    pages.delete(path);
  }
}
const todo = [...pages.values()].sort((a, b) => b.impressions - a.impressions).slice(0, MAX);

const SCHEMA = { type: "object", additionalProperties: false, required: ["pages"], properties: { pages: { type: "array", items: {
  type: "object", additionalProperties: false, required: ["path", "title", "description"],
  properties: { path: { type: "string" }, title: { type: "string" }, description: { type: "string" } } } } } };

function issues(x) {
  const out = [];
  if (!x.title.endsWith(" | Bodystrands")) out.push('title must end with " | Bodystrands"');
  if (x.title.length > 65) out.push(`title ${x.title.length} chars, max 65`);
  if (x.description.length < 110 || x.description.length > 158) out.push(`description ${x.description.length} chars, need 110-158`);
  if (BANNED.test(x.title + x.description)) out.push("banned word");
  return out;
}

async function main() {
  const client = new Anthropic();
  const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf-8")) : {};
  const result = { ...existing };
  let batch = todo;
  for (let attempt = 1; attempt <= 3 && batch.length; attempt++) {
    const res = await client.messages.create({
      model: MODEL, max_tokens: 16000,
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: `These pages of Bodystrands (handmade stainless steel body jewelry shop) already appear on Google page 1-2 for the searches listed, but almost nobody clicks. Rewrite each page's Google title and meta description so a person who typed those searches clicks.

Rules:
- Title: lead with the exact wording of the page's biggest search, then what makes this result worth clicking. End with " | Bodystrands". Max 65 characters total. Title Case.
- Description: 110-158 characters. Answer the searcher's question or show what they'll find (styles, finishes, price "from €X" when given), in plain words. One sentence or two short ones.
- Only claim what's in the page info. Plain language, no hype (no elevate, effortless, timeless, stunning, curated, must-have). Never mention Etsy, steel grades or "solid gold". No keyword lists.
${attempt > 1 ? "\nA previous attempt broke the length rules — count characters carefully." : ""}
Pages:
${batch.map((p) => `path: ${p.path}
page: ${p.about}
current title: ${p.title}
current description: ${p.description}
searches (impressions, clicks, avg position): ${p.queries.map((q) => `"${q.q}" (${q.impressions}, ${q.clicks}, #${q.position})`).join("; ")}`).join("\n\n")}` }],
    });
    const text = res.content.find((b) => b.type === "text")?.text;
    if (!text) throw new Error(`no output (${res.stop_reason})`);
    for (const x of JSON.parse(text).pages) {
      const p = batch.find((b) => b.path === x.path);
      if (!p) continue;
      const bad = issues(x);
      if (bad.length) { console.error(`retry ${x.path}: ${bad.join("; ")}`); continue; }
      result[x.path] = { title: x.title.trim(), description: x.description.trim(), was: { title: p.title, description: p.description }, searches: p.queries.map((q) => q.q), impressions: p.impressions, updated: new Date().toISOString().slice(0, 10) };
    }
    batch = batch.filter((p) => !result[p.path] || result[p.path].updated !== new Date().toISOString().slice(0, 10));
  }
  for (const p of batch) console.error(`gave up on ${p.path}`);
  writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");
  console.error(`wrote ${Object.keys(result).length} overrides to data/seo-overrides.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
