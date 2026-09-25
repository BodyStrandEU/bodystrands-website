import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Weekly trend research for the blog queue. Claude searches the web for what
// people are searching right now (and in the next few weeks) around jewelry,
// gifting and styling, then the findings are turned into data/blog-queue.json
// entries tagged source: "research". generate-blog-post.mjs prefers fresh
// research entries over the static calendar.

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_FILE    = join(__dirname, "../data/blog-queue.json");
const BLOG_FILE     = join(__dirname, "../data/blog-posts.json");
const PRODUCTS_FILE = join(__dirname, "../data/products.json");

const MODEL = "claude-opus-5";
const MAX_NEW_ENTRIES = 6;
const BLOG_CATEGORIES = ["Style Guide", "Gift Guide", "Personalized Jewelry", "Care & Quality", "Inspiration", "Plus Size"];

async function research(client, now, productCategories, recentTopics) {
  const messages = [{
    role: "user",
    content: `You're doing weekly keyword research for the blog of Bodystrands, a small handmade body jewelry shop in Portugal selling to customers across Europe (mostly women 20-45, on mobile). Products: ${productCategories.join(", ")}. Prices €17.50-€55.

Today is ${now.toISOString().slice(0, 10)}. Use web search to find what people are searching for now and over the next 3-6 weeks around jewelry, jewelry gifts and styling — seasonal events, holidays, gifting occasions, fashion trends, viral styles, and "people also ask" style questions. Prioritise searches where a small jewelry brand's blog post could realistically rank and lead to a sale of the products above.

Topics we've already covered recently (skip these and close variants):
${recentTopics.map((t) => `- ${t}`).join("\n")}

Report back a list of the 10 strongest search phrases, each with: the exact phrase as people type it, why it's trending or timely now (with the source), which months it stays relevant, and which of our product categories fit.`,
  }];

  // Server-side web search can pause long turns; resume until it finishes.
  for (let i = 0; i < 5; i++) {
    const response = await client.beta.messages
      .stream({
        model: MODEL,
        max_tokens: 32000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        thinking: { type: "adaptive" },
        output_config: { effort: "high" },
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 12 }],
        messages,
      })
      .finalMessage();

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
        required: ["query", "why", "category", "months", "productCategories"],
        properties: {
          query:             { type: "string", description: "The search phrase, lowercase, as people type it." },
          why:               { type: "string", description: "One sentence: why it's timely, naming the source." },
          category:          { type: "string", enum: BLOG_CATEGORIES },
          months:            { type: "array", items: { type: "integer" }, description: "Months (1-12) the topic stays relevant." },
          productCategories: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

async function extract(client, findings, productCategories) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: "low", format: { type: "json_schema", schema: EXTRACT_SCHEMA } },
    messages: [{
      role: "user",
      content: `Turn these keyword research findings into blog queue entries. Keep only phrases a jewelry blog post could genuinely answer. productCategories must only use names from: ${productCategories.join(", ")} (empty array if the post should link the whole shop).

${findings}`,
    }],
  });
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

  const productCategories = [...new Set(products.filter((p) => p.active !== false).map((p) => p.category))];
  const recentTopics = [...new Set([...queue.map((q) => q.query), ...posts.slice(0, 60).map((p) => p.topic || p.title)])];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const findings = await research(client, now, productCategories, recentTopics);
  const entries = await extract(client, findings, productCategories);

  const known = new Set([...queue.map((q) => norm(q.query)), ...posts.map((p) => norm(p.topic || ""))]);
  const added = [];
  for (const e of entries) {
    const months = [...new Set(e.months.filter((m) => m >= 1 && m <= 12))];
    if (!e.query.trim() || months.length === 0 || known.has(norm(e.query))) continue;
    known.add(norm(e.query));
    added.push({
      query: e.query.trim(),
      category: e.category,
      months,
      productCategories: e.productCategories.filter((c) => productCategories.includes(c)),
      source: "research",
      addedAt: now.toISOString().slice(0, 10),
      why: e.why,
    });
    if (added.length >= MAX_NEW_ENTRIES) break;
  }

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
