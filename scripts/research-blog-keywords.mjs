import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Twice-weekly (Mon + Thu) keyword research for the blog queue. Claude searches the web for
// trending and long-tail searches around jewelry, gifting and styling, ties each
// one to specific products in the catalog, and the findings become
// data/blog-queue.json entries tagged source: "research" (with long-tail
// `keywords` to work into the post and `productIds` to feature).
// generate-blog-post.mjs rotates research entries with new-product and
// seasonal-calendar posts.
//
// Trend signals (Oct 8, 2026, user request): each run also looks for product trends —
// styles, motifs and materials people are starting to search for — and checks them against
// the catalog (sell it / partial / gap). Saved to data/trend-signals.json and emailed to the
// owner after every run by scripts/send-trend-report.mjs. Blog ideas with no matching
// product used to be dropped silently; they're kept there as gaps too.

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_FILE    = join(__dirname, "../data/blog-queue.json");
const BLOG_FILE     = join(__dirname, "../data/blog-posts.json");
const PRODUCTS_FILE = join(__dirname, "../data/products.json");
const TRENDS_FILE   = join(__dirname, "../data/trend-signals.json");

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

Every blog idea must tie to specific products in the catalog above that a reader would want to buy after reading.
3. Product trends — 3-6 jewelry and body-jewelry styles, motifs, materials or ways of wearing that are gaining search interest or social traction in Europe and the US now or over the next 2-4 months. For each: the exact phrases people search, concrete evidence naming each source by publication/company and URL (search trend data, retailer launches, Pinterest/TikTok trend reports, fashion press) with any numbers they give, whether interest is rising, peaking or steady, and how our catalog fits — we already sell it (name the ids), we partly cover it, or it's a gap we don't sell. Facts only: no trend without a named source. Don't force a catalog match: the most useful findings for the owner are trends we DON'T sell yet — report those plainly, and list any specific piece types a trend calls for that we lack (e.g. bow motifs, chunky cuffs).

Topics already covered or queued (skip these and close variants):
${recentTopics.map((t) => `- ${t}`).join("\n")}

Report back the product trends (point 3), then the 8 strongest blog ideas, each with: the main search phrase (exactly as people type it), 3-6 related long-tail keywords to work into the same post, why it's timely or worth targeting (with the source), which months it stays relevant, and the ids of the 1-4 best-matching products.`,
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
  required: ["entries", "trends"],
  properties: {
    trends: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "what", "searches", "evidence", "sources", "momentum", "fit", "missing", "productIds", "idea"],
        properties: {
          name:       { type: "string", description: "Short trend name, e.g. 'Charm necklaces'." },
          what:       { type: "string", description: "One or two plain sentences: what the trend is." },
          searches:   { type: "array", items: { type: "string" }, description: "Exact phrases people search, lowercase." },
          evidence:   { type: "string", description: "The facts behind it, with numbers where given. Name sources here too." },
          sources:    { type: "array", items: { type: "object", additionalProperties: false, required: ["name", "url"], properties: { name: { type: "string", description: "Publication or company, e.g. 'Vogue', 'Pinterest Predicts'." }, url: { type: "string", description: "Source URL from the findings, or empty string if none was given." } } } },
          missing:    { type: "array", items: { type: "string" }, description: "Specific piece types this trend calls for that the catalog lacks (empty if none)." },
          momentum:   { type: "string", enum: ["rising", "peaking", "steady"] },
          fit:        { type: "string", enum: ["we sell it", "partial", "gap"] },
          productIds: { type: "array", items: { type: "string" }, description: "Matching catalog ids (empty for a gap)." },
          idea:       { type: "string", description: "One sentence: what the shop could do — push an existing piece, adapt one, or make something new." },
        },
      },
    },
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
      content: `Turn these keyword research findings into product trends (from the trends section) and blog queue entries. For trends, keep every source name and URL that appears in the findings, and copy any piece types the shop lacks into "missing" — don't fold them into the idea. Keep only phrases a jewelry blog post could genuinely answer. productCategories must only use names from: ${productCategories.join(", ")} (empty array if the post should link the whole shop). productIds must only use these ids: ${productIds.join(", ")}.

${findings}`,
    }],
  });
  logCost("extract", response.usage);
  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("No extraction output.");
  return JSON.parse(text);
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
  const { entries, trends } = await extract(client, findings, productCategories, [...liveIds]);
  const gaps = [];

  const known = new Set([...queue.map((q) => norm(q.query)), ...posts.map((p) => norm(p.topic || ""))]);
  const added = [];
  for (const e of entries) {
    const months = [...new Set(e.months.filter((m) => m >= 1 && m <= 12))];
    if (!e.query.trim() || months.length === 0 || known.has(norm(e.query))) continue;
    known.add(norm(e.query));
    const productIds = e.productIds.filter((id) => liveIds.has(id)).slice(0, 4);
    if (productIds.length === 0) { gaps.push({ query: e.query.trim(), why: e.why }); continue; } // every post must sell something real
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

  // Trend signals: kept for the owner's report even when no blog idea was added.
  const signals = existsSync(TRENDS_FILE) ? JSON.parse(readFileSync(TRENDS_FILE, "utf-8")) : [];
  signals.unshift({
    date: now.toISOString().slice(0, 10),
    researchModel: MODEL,
    trends: trends.map((t) => ({ ...t, productIds: t.productIds.filter((id) => liveIds.has(id)) })),
    gaps,
    blogIdeas: added.map(({ query, why, productIds }) => ({ query, why, productIds })),
  });
  writeFileSync(TRENDS_FILE, JSON.stringify(signals.slice(0, 60), null, 2) + "\n");
  console.log(`Saved ${trends.length} trend signals and ${gaps.length} gaps.`);

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
