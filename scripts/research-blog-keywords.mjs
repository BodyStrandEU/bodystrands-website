import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Twice-weekly (Mon + Thu) keyword research for the blog queue. Claude searches the web for
// trending and long-tail searches around jewelry, gifting and styling, ties each
// one to specific products in the catalog, and the findings become
// data/blog-queue.json entries tagged source: "research" (with long-tail
// `keywords` to work into the post and `productIds` to feature).
// generate-blog-post.mjs rotates research entries with new-product and
// seasonal-calendar posts.

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_FILE    = join(__dirname, "../data/blog-queue.json");
const BLOG_FILE     = join(__dirname, "../data/blog-posts.json");
const PRODUCTS_FILE = join(__dirname, "../data/products.json");

// Model A/B test (started Sep 25, 2026): Monday runs research with Opus,
// Thursday runs with Sonnet. Entries and the posts built from them carry
// `researchModel`, so scripts/compare-research-models.mjs can compare them.
// RESEARCH_MODEL overrides (e.g. for manual runs).
const PRICES = { "claude-opus-5": [5, 25], "claude-sonnet-5": [2, 10] }; // $ per million in / out
const MODEL = process.env.RESEARCH_MODEL || (new Date().getUTCDay() === 4 ? "claude-sonnet-5" : "claude-opus-5");
// Rough spend per call, logged so the GitHub run logs show what research costs.
// Web search is $10 per 1,000 searches on top of tokens.
function logCost(label, usage) {
  const [inPrice, outPrice] = PRICES[MODEL];
  const input = (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0);
  const searches = usage.server_tool_use?.web_search_requests ?? 0;
  const usd = (input * inPrice + (usage.output_tokens ?? 0) * outPrice) / 1e6 + searches * 0.01;
  console.log(`[cost] ${MODEL} ${label}: ${input} in / ${usage.output_tokens ?? 0} out tokens${searches ? `, ${searches} searches` : ""} ≈ $${usd.toFixed(3)}`);
}

const MAX_NEW_ENTRIES = 5; // 2 runs/week ≈ 10 ideas; ~4-5 research posts/week are consumed
const BLOG_CATEGORIES = ["Style Guide", "Gift Guide", "Personalized Jewelry", "Care & Quality", "Inspiration", "Plus Size"];

async function research(client, now, catalog, recentTopics) {
  const messages = [{
    role: "user",
    content: `You're doing this week's keyword research for the blog of Bodystrands, a small handmade body jewelry shop in Portugal selling to customers across Europe (mostly women 20-45, on mobile). Prices €17.50-€55.

Our live catalog (id | name | category | price):
${catalog}

Today is ${now.toISOString().slice(0, 10)}. Use web search to find:
1. Trending searches — what people search now and over the next 3-6 weeks around jewelry, jewelry gifts and styling: seasonal events, holidays, gifting occasions, fashion trends, viral styles, "people also ask" questions.
2. Long-tail keywords — specific 4-8 word searches with clear intent that a small brand can realistically rank for (e.g. "gold heart pearl necklace with toggle clasp", "waterproof belly chain for swimming", "dainty body chain for backless dress"), especially ones that match our specific products.

Every idea must tie to specific products in the catalog above that a reader would want to buy after reading. Skip ideas with no good product match.

Topics already covered or queued (skip these and close variants):
${recentTopics.map((t) => `- ${t}`).join("\n")}

Report back the 8 strongest ideas, each with: the main search phrase (exactly as people type it), 3-6 related long-tail keywords to work into the same post, why it's timely or worth targeting (with the source), which months it stays relevant, and the ids of the 1-4 best-matching products.`,
  }];

  // Server-side web search can pause long turns; resume until it finishes.
  for (let i = 0; i < 5; i++) {
    const response = await client.beta.messages
      .stream({
        model: MODEL,
        max_tokens: 32000,
        ...(MODEL === "claude-opus-5" ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" } : {}),
        thinking: { type: "adaptive" },
        output_config: { effort: "high" },
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 10 }],
        messages,
      })
      .finalMessage();
    logCost("research", response.usage);

    if (response.stop_reason === "refusal") throw new Error("Model declined the research request.");
    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }
    return response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  }
  throw new Error("Research did not finish after 5 resumptions.");
}

const EXTRACT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["entries"],
  properties: {
    entries: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["query", "keywords", "productIds", "why", "category", "months", "productCategories"],
        properties: {
          query:             { type: "string", description: "The main search phrase, lowercase, as people type it." },
          keywords:          { type: "array", items: { type: "string" }, description: "3-6 related long-tail keywords, lowercase." },
          productIds:        { type: "array", items: { type: "string" }, description: "Ids of the 1-4 best-matching catalog products." },
          why:               { type: "string", description: "One sentence: why it's timely, naming the source." },
          category:          { type: "string", enum: BLOG_CATEGORIES },
          months:            { type: "array", items: { type: "integer" }, description: "Months (1-12) the topic stays relevant." },
          productCategories: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

async function extract(client, findings, productCategories, productIds) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: "low", format: { type: "json_schema", schema: EXTRACT_SCHEMA } },
    messages: [{
      role: "user",
      content: `Turn these keyword research findings into blog queue entries. Keep only phrases a jewelry blog post could genuinely answer. productCategories must only use names from: ${productCategories.join(", ")} (empty array if the post should link the whole shop). productIds must only use these ids: ${productIds.join(", ")}.

${findings}`,
    }],
  });
  logCost("extract", response.usage);
  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("No extraction output.");
  return JSON.parse(text).entries;
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not set — skipping keyword research.");
    return;
  }
  const now      = new Date();
  const queue    = JSON.parse(readFileSync(QUEUE_FILE, "utf-8"));
  const posts    = JSON.parse(readFileSync(BLOG_FILE, "utf-8"));
  const products = JSON.parse(readFileSync(PRODUCTS_FILE, "utf-8"));

  const live = products.filter((p) => p.active !== false && p.images?.length);
  const productCategories = [...new Set(live.map((p) => p.category))];
  const liveIds = new Set(live.map((p) => p.id));
  const catalog = live.map((p) => `${p.id} | ${p.name} | ${p.category} | €${p.price}`).join("\n");
  const recentTopics = [...new Set([...queue.map((q) => q.query), ...posts.slice(0, 60).map((p) => p.topic || p.title)])];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const findings = await research(client, now, catalog, recentTopics);
  const entries = await extract(client, findings, productCategories, [...liveIds]);

  const known = new Set([...queue.map((q) => norm(q.query)), ...posts.map((p) => norm(p.topic || ""))]);
  const added = [];
  for (const e of entries) {
    const months = [...new Set(e.months.filter((m) => m >= 1 && m <= 12))];
    if (!e.query.trim() || months.length === 0 || known.has(norm(e.query))) continue;
    known.add(norm(e.query));
    const productIds = e.productIds.filter((id) => liveIds.has(id)).slice(0, 4);
    if (productIds.length === 0) continue; // every post must sell something real
    added.push({
      query: e.query.trim(),
      keywords: [...new Set(e.keywords.map((k) => k.trim().toLowerCase()).filter(Boolean))].slice(0, 6),
      productIds,
      category: e.category,
      months,
      productCategories: e.productCategories.filter((c) => productCategories.includes(c)),
      source: "research",
      researchModel: MODEL,
      addedAt: now.toISOString().slice(0, 10),
      why: e.why,
    });
    if (added.length >= MAX_NEW_ENTRIES) break;
  }

  console.log(`Research model: ${MODEL}`);
  if (added.length === 0) {
    console.log("No new trending queries this week.");
    return;
  }
  writeFileSync(QUEUE_FILE, JSON.stringify([...added, ...queue], null, 2) + "\n");
  console.log(`Added ${added.length} trending queries:`);
  for (const a of added) console.log(`- ${a.query} — ${a.why}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
