#!/usr/bin/env node
// Pinterest copy in the house style: chained long-tail keywords, where the end of one
// search phrase starts the next ("gold body chain for beach accessory for women bikini
// belly chain") so one title/description matches many searches. User rule, Oct 1, 2026.
//
// Pinterest and Etsy only — never use keyword chains in blog posts or visible website
// copy, where Google treats them as keyword stuffing.
//
// Usage: node scripts/pin-copy.mjs <product-id> [<product-id> ...] > pin-copy.json
// Output: { "<id>": { "title": "...", "description": "..." } } — every entry passes the
// same checks scripts/postiz-create.mjs enforces for Pinterest.
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const products = JSON.parse(readFileSync(join(__dirname, "../data/products.json"), "utf-8"));
// Shared keyword file (scripts/seo-keywords.mjs): real Google searches + research keywords per product.
const KW_PATH = join(__dirname, "../data/seo-keywords.json");
const keywords = existsSync(KW_PATH) ? JSON.parse(readFileSync(KW_PATH, "utf-8")) : { products: {}, categories: {} };
const MODEL = "claude-opus-5";
const BATCH = 15;
const BANNED = /elevat|effortless|quiet (confidence|luxury)|curated|timeless|stunning|must-have|portugal|canada|etsy|link in bio|316l|marine-grade|medical-grade|surgical-grade|solid gold/i;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["pins"],
  properties: {
    pins: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "description"],
        properties: { id: { type: "string" }, title: { type: "string" }, description: { type: "string" } },
      },
    },
  },
};

function facts(p) {
  const specs = Array.isArray(p.specs) ? p.specs.map((s) => `${s.label}: ${s.value}`).join("; ") : "";
  return [
    `id: ${p.id}`, `name: ${p.name}`, `category: ${p.category}`, `price: €${p.price}`,
    p.variants?.length ? `finishes: ${p.variants.join(", ")}` : "",
    `description: ${String(p.description ?? "").slice(0, 400)}`,
    p.altText ? `seo phrase: ${p.altText}` : "", specs ? `specs: ${specs.slice(0, 400)}` : "",
    searches(p),
  ].filter(Boolean).join("\n");
}

/** Real search wording for this piece: Google searches it already shows for, its category's, and research keywords. */
function searches(p) {
  const k = keywords.products?.[p.id] ?? {}, c = keywords.categories?.[p.category] ?? {};
  const q = (list = [], n) => list.slice(0, n).map((x) => x.q).join("; ");
  return [
    k.queries?.length ? `Google searches this piece already shows for: ${q(k.queries, 8)}` : "",
    c.queries?.length ? `Google searches for its category: ${q(c.queries, 6)}` : "",
    (k.research?.length || c.research?.length) ? `trending research keywords: ${[...(k.research ?? []), ...(c.research ?? [])].slice(0, 8).join("; ")}` : "",
  ].filter(Boolean).join("\n");
}

function problems(pin) {
  const out = [];
  if (!pin.title.includes(" | ") || pin.title.length < 25 || pin.title.length > 100) out.push(`title must be "Product Name | keyword chain", 25-100 chars (is ${pin.title.length})`);
  if (pin.description.length < 150 || pin.description.length > 480) out.push(`description must be 150-480 chars (is ${pin.description.length})`);
  const tags = (pin.description.match(/#[\p{L}\p{N}_]+/gu) ?? []).length;
  if (tags < 1 || tags > 3) out.push(`use 2 hashtags at the end (has ${tags})`);
  if (BANNED.test(pin.title + " " + pin.description)) out.push("contains a banned word or claim");
  return out;
}

async function writeBatch(client, batch, feedback = "") {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    messages: [{ role: "user", content: `Write Pinterest pin copy for these handmade stainless steel jewelry products from Bodystrands.

STYLE — chained long-tail keywords: the end of one search phrase begins the next, so one line covers many real searches. Example of the technique (don't copy the words): "gold body chain for beach accessory for women bikini belly chain" contains "gold body chain", "body chain for beach", "beach accessory for women", "women bikini belly chain".

SEARCH DATA FIRST: when a product lists real Google searches or research keywords, build the chain from that exact wording (only phrases that truly describe the piece). Fill the rest from its facts.

TITLE: "<Product Name> | <keyword chain>", 60-100 characters total. The chain uses what people search for this piece: finish (gold/silver), type (e.g. back necklace, belly chain, anklet), occasion (beach, wedding, bridal, festival, everyday, party), who it's for (for women, for her, bridesmaid), motif (pearl, coin, butterfly, zodiac, birthstone, cross, initial).

DESCRIPTION: 200-400 characters. First one plain, factual sentence about the piece (no hype). Then one chained long-tail keyword line. End with exactly 2 relevant hashtags.

FACTS ONLY: use only the facts given. Say "gold-tone" or "gold" for finish, never "solid gold". Never mention Portugal, Canada, Etsy, steel grades (316L etc.), or "link in bio". No hype words (elevate, effortless, timeless, stunning, curated, must-have).
${feedback}
Products:
${batch.map(facts).join("\n\n")}` }],
  });
  const text = res.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error(`No output (stop_reason ${res.stop_reason})`);
  return JSON.parse(text).pins;
}

async function main() {
  const ids = process.argv.slice(2);
  if (ids.length === 0) { console.error("usage: node scripts/pin-copy.mjs <product-id> ..."); process.exit(1); }
  const byId = new Map(products.map((p) => [p.id, p]));
  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length) { console.error(`unknown product ids: ${missing.join(", ")}`); process.exit(1); }

  const client = new Anthropic();
  const result = {};
  for (let i = 0; i < ids.length; i += BATCH) {
    let batch = ids.slice(i, i + BATCH).map((id) => byId.get(id));
    for (let attempt = 1; attempt <= 3 && batch.length; attempt++) {
      const feedback = attempt === 1 ? "" : "\nA previous attempt broke the rules — follow the lengths and hashtag count exactly.";
      const pins = await writeBatch(client, batch, feedback);
      for (const pin of pins) {
        if (!byId.has(pin.id)) continue;
        const issues = problems(pin);
        if (issues.length === 0) result[pin.id] = { title: pin.title.trim(), description: pin.description.trim() };
        else console.error(`retrying ${pin.id}: ${issues.join("; ")}`);
      }
      batch = batch.filter((p) => !result[p.id]);
    }
    for (const p of batch) console.error(`gave up on ${p.id}`);
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
