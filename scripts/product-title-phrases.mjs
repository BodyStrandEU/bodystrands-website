#!/usr/bin/env node
// Writes data/product-title-phrases.json: one permanent title phrase per product, used as
// "<Product Name> | <phrase> | Bodystrands".
//
// Grounded in data, not a fixed pool (Oct 2, 2026): each phrase comes from the searches
// Google already shows that product (or its category) for in Search Console, plus the
// research queue's keywords. Phrases are evergreen — the product's main search phrase,
// or a gift / outfit / purpose phrase that stays true all year. No seasons or holidays:
// seasonal and occasion searches are targeted by /gifts, /christmas, blog posts and pins.
//
// Usage: node scripts/product-title-phrases.mjs <search-console-grouped.json> [--only id,id]
//   <search-console-grouped.json> = { byprod: {id: {query: impressions}}, bycat: {category: {...}} }
//   (built from /api/admin/google-report page+query data)
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../data/product-title-phrases.json");
const products = JSON.parse(readFileSync(join(__dirname, "../data/products.json"), "utf-8"));
const queue = JSON.parse(readFileSync(join(__dirname, "../data/blog-queue.json"), "utf-8"));
const MODEL = "claude-opus-5";
const MAX_TITLE = 66; // Google shows ~60-65 characters of a title
const SEASONAL = /christmas|xmas|holiday|black friday|valentine|mother'?s day|easter|halloween|summer|winter|spring|autumn|fall\b|\b20\d\d\b/i;
const BANNED = /elevat|effortless|timeless|stunning|curated|must-have|portugal|etsy|316l|solid gold/i;

const [gscPath, ...rest] = process.argv.slice(2);
if (!gscPath) { console.error("usage: node scripts/product-title-phrases.mjs <search-console-grouped.json> [--only id,id]"); process.exit(1); }
const gsc = JSON.parse(readFileSync(gscPath, "utf-8"));
const onlyIdx = rest.indexOf("--only");
const only = onlyIdx >= 0 ? new Set(rest[onlyIdx + 1].split(",")) : null;

const top = (obj = {}, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([q, i]) => `${q} (${i})`);
const budget = (name) => MAX_TITLE - name.length - " |  | Bodystrands".length;
const researchKeywords = [...new Set(queue.flatMap((e) => [e.query, ...(e.keywords ?? [])]))];

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["phrases"],
  properties: { phrases: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "phrase"], properties: { id: { type: "string" }, phrase: { type: "string" } } } } },
};

function check(p, phrase, taken) {
  const issues = [];
  const max = Math.max(14, budget(p.name));
  if (phrase.length > max) issues.push(`phrase is ${phrase.length} chars, max ${max}`);
  if (phrase.length < 10) issues.push("phrase too short");
  if (SEASONAL.test(phrase)) issues.push("seasonal words are not allowed");
  if (BANNED.test(phrase)) issues.push("banned word");
  if (taken.has(phrase.toLowerCase())) issues.push("phrase already used by another product");
  if (p.name.toLowerCase() === phrase.toLowerCase()) issues.push("phrase repeats the product name");
  return issues;
}

async function ask(client, batch, taken, feedback) {
  const lines = batch.map((p) => [
    `id: ${p.id}`, `name: ${p.name}`, `category: ${p.category}`,
    p.variants?.length ? `finishes: ${p.variants.join(", ")}` : "",
    `description: ${String(p.description ?? "").slice(0, 220)}`,
    `max phrase length: ${Math.max(14, budget(p.name))} characters`,
    `searches Google shows THIS product for (impressions): ${top(gsc.byprod?.[p.id], 8).join("; ") || "none yet"}`,
    `searches for its category: ${top({ ...(gsc.bycat?.[p.category] ?? {}), ...(gsc.bycat?.[`__products__${p.category}`] ?? {}) }, 8).join("; ") || "none"}`,
  ].filter(Boolean).join("\n")).join("\n\n");

  const res = await client.messages.create({
    model: MODEL, max_tokens: 16000,
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    messages: [{ role: "user", content: `Write ONE permanent title phrase per product for a handmade stainless steel jewelry shop. The page title becomes "<Product Name> | <phrase> | Bodystrands".

Rules:
- Ground every phrase in the search data given. If the product already gets searches, the phrase should match the strongest real search that isn't already in the product name (e.g. name "Chain Waist Belt", searches "waist chain belt", "belly chain belt" -> "Waist Chain Belt for Dresses"). If it has no searches, use its category's searches plus one evergreen intent that fits the piece: giftability ("Gift for Her"), outfit ("for Backless Dresses"), or purpose ("for Weddings", "Everyday Layering").
- Evergreen only: NO seasons, holidays, months or years.
- Title Case, plain words people type. No hype words. Never mention Portugal, Etsy, steel grades or "solid gold".
- Respect each product's max length. Every phrase must be different from the others and from these already-used phrases: ${[...taken].slice(0, 200).join(" | ") || "(none)"}
- Research keywords trending for this shop (use only if they fit a product): ${researchKeywords.slice(0, 60).join("; ")}
${feedback}
Products:
${lines}` }],
  });
  const text = res.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error(`no output (${res.stop_reason})`);
  return JSON.parse(text).phrases;
}

async function main() {
  const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf-8")) : {};
  const result = only ? { ...existing } : {};
  const taken = new Set(Object.entries(result).filter(([id]) => !only?.has(id)).map(([, v]) => v.toLowerCase()));
  const todo = products.filter((p) => (only ? only.has(p.id) : true));
  const client = new Anthropic();

  for (let i = 0; i < todo.length; i += 20) {
    let batch = todo.slice(i, i + 20);
    for (let attempt = 1; attempt <= 3 && batch.length; attempt++) {
      const feedback = attempt === 1 ? "" : "\nPrevious attempt broke length/uniqueness/season rules for these products — fix them.";
      for (const { id, phrase } of await ask(client, batch, taken, feedback)) {
        const p = batch.find((x) => x.id === id);
        if (!p) continue;
        const issues = check(p, phrase.trim(), taken);
        if (issues.length) { console.error(`retry ${id}: ${issues.join("; ")}`); continue; }
        result[id] = phrase.trim(); taken.add(phrase.trim().toLowerCase());
      }
      batch = batch.filter((p) => !result[p.id] || (only?.has(p.id) && result[p.id] === existing[p.id]));
    }
    for (const p of batch) console.error(`gave up on ${p.id} — page falls back to its category name`);
  }
  writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");
  console.error(`wrote ${Object.keys(result).length} phrases to data/product-title-phrases.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
