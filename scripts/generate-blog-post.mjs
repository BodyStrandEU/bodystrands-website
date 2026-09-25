import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_FILE     = join(__dirname, "../data/blog-posts.json");
const PRODUCTS_FILE = join(__dirname, "../data/products.json");
const QUEUE_FILE    = join(__dirname, "../data/blog-queue.json");

// Sep 2026 revamp: research-driven, long-form posts instead of the old random
// topic pool (which exhausted itself into near-duplicates and off-season topics
// like Valentine's Day in September). cron-job.org fires the workflow 3x/day,
// so the cadence is enforced here: at most MAX_POSTS_PER_DAY posts per UTC day.
// FORCE=1 bypasses it for manual runs.
const MAX_POSTS_PER_DAY = 2;

// Products added within this window that no post has covered yet get a post of
// their own (targeting what people search about that type of piece).
const NEW_PRODUCT_WINDOW_DAYS = 45;


const MODEL = "claude-opus-5";
const MIN_WORDS = 800;
const BLOG_CATEGORIES = ["Style Guide", "Gift Guide", "Personalized Jewelry", "Care & Quality", "Inspiration", "Plus Size"];
const BANNED_WORDS = ["elevate", "curated", "testament", "journey", "delve", "game-changer", "transformative", "effortless", "quiet confidence", "316l", "marine-grade", "medical-grade", "surgical-grade"];

// ─── Selection ──────────────────────────────────────────────────────────────

const daysBetween = (a, b) => Math.floor((b.getTime() - a.getTime()) / 86_400_000);

function isLive(product) {
  return product.active !== false && Array.isArray(product.images) && product.images.length > 0;
}

function pickNewProduct(posts, products, now) {
  const covered = new Set(posts.map((p) => p.sourceProductId).filter(Boolean));
  return products
    .filter((p) => isLive(p) && !covered.has(p.id))
    .filter((p) => daysBetween(new Date(p.dateAdded), now) <= NEW_PRODUCT_WINDOW_DAYS)
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))[0] ?? null;
}

function pickQueueEntry(posts, queue, now, fromResearch) {
  const month = now.getMonth() + 1;
  const used = new Set(posts.map((p) => p.topic).filter(Boolean));
  const candidates = queue.filter((q) =>
    (q.source === "research") === fromResearch &&
    q.months.includes(month) &&
    !used.has(q.query) &&
    // Cheap pre-check (no API call) so a query we've effectively already
    // covered under an older post title doesn't get regenerated every run.
    !findSimilarTitle(q.query, posts)
  );
  // Research entries: newest findings first (trends go stale). Calendar: file order.
  if (fromResearch) candidates.sort((a, b) => String(b.addedAt).localeCompare(String(a.addedAt)));
  return candidates[0] ?? null;
}

// Rotate new product → trending research → seasonal calendar, skipping empty
// buckets, so daily research doesn't starve the Q4 calendar (and a burst of
// new listings doesn't crowd out either).
const ROTATION = ["product", "research", "calendar"];

function pickSubject(posts, products, queue, now) {
  const available = {
    product:  pickNewProduct(posts, products, now),
    research: pickQueueEntry(posts, queue, now, true),
    calendar: pickQueueEntry(posts, queue, now, false),
  };
  const last = posts[0]?.source === "queue" ? "calendar" : posts[0]?.source;
  const start = (ROTATION.indexOf(last) + 1) % ROTATION.length;
  for (let i = 0; i < ROTATION.length; i++) {
    const kind = ROTATION[(start + i) % ROTATION.length];
    if (!available[kind]) continue;
    return kind === "product" ? { kind, product: available[kind] } : { kind, entry: available[kind] };
  }
  return null;
}

// ─── Product context ────────────────────────────────────────────────────────

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function productsForEntry(entry, products) {
  // Research ties each query to specific products — those lead.
  const pinned = (entry.productIds ?? [])
    .map((id) => products.find((p) => p.id === id))
    .filter((p) => p && isLive(p));
  let pool = products.filter((p) => isLive(p) && !pinned.includes(p));
  if (entry.productCategories?.length) pool = pool.filter((p) => entry.productCategories.includes(p.category));
  if (entry.maxPrice) pool = pool.filter((p) => Number(p.price) <= entry.maxPrice);
  const preferred = pool.filter((p) =>
    (entry.christmas && p.christmas) || (entry.giftTag && p.giftTags?.includes(entry.giftTag))
  );
  const rest = pool.filter((p) => !preferred.includes(p));
  return [...pinned, ...shuffle(preferred), ...shuffle(rest)].slice(0, 6);
}

function relatedProducts(product, products) {
  return shuffle(products.filter((p) => isLive(p) && p.id !== product.id && p.category === product.category)).slice(0, 3);
}

function describeProduct(p, detailed = false) {
  const line = `- "${p.name}" (${p.category}, €${p.price}) → /shop/${p.id}`;
  if (!detailed) return line;
  const specs = p.specs ? `\n  Specs: ${JSON.stringify(p.specs)}` : "";
  const variants = p.variants?.length ? `\n  Finishes: ${p.variants.join(", ")}` : "";
  const desc = String(p.fullDescription || p.description || "").slice(0, 1500);
  return `${line}${variants}${specs}\n  Description: ${desc}`;
}

// ─── Prompt ─────────────────────────────────────────────────────────────────

const BRAND = `Bodystrands is a small, couple-run handmade body jewelry brand based in Portugal, run by El & Gio. Every piece is made by the two of them in their studio. Products: belly chains, back chains, body chains, shoulder chains, leg chains, anklets, bracelets (birthstone, birth flower, zodiac, initial, pearl), necklaces, hand chains, head chains, eyeglasses chains, bikini clip chains. Stainless steel — waterproof, tarnish-resistant, made for everyday wear. Never claim a specific steel grade ("316L", "marine-grade", "medical-grade", "surgical-grade") — it hasn't been verified. Never call anything solid gold — say "gold-tone". Prices range from about €17.50 to €55. The brand name is one word: Bodystrands.`;

const VOICE = `Voice: warm, plain and direct, like a friend who knows jewelry. Talk to "you". Short sentences, no filler. Never use: ${BANNED_WORDS.slice(0, 8).join(", ")}, "actually", "quiet confidence", or any influencer-style phrasing.`;

function buildPrompt(subject, featured, now) {
  const monthName = now.toLocaleString("en-GB", { month: "long" });
  const common = `${BRAND}

${VOICE}

Today is ${now.toISOString().slice(0, 10)} (${monthName}). Readers are mostly in Europe, reading on their phones. Write for what they need right now.`;

  const rules = `How to write it:
- Answer the search question directly in the first paragraph (2-3 sentences) so the post could be quoted as a search snippet. No warm-up.
- Then go deeper: 3-5 "heading" sections, each phrased like a follow-up question or the exact thing someone would search next.
- Use "list" blocks where a reader would scan: steps, options at different budgets, what to pair with what. 1-3 lists total.
- 1000-1500 words of body text. Every section must add real, specific help — concrete details, sizes, lengths, pairings, occasions. If a section would be generic, cut it.
- Title: under 65 characters, contains the search phrase (or a natural close variant), no clickbait.
- Work the long-tail keywords (listed below, or ones you choose) into headings, list items and sentences where they read naturally — each once or twice at most. Never stuff keywords or repeat a phrase awkwardly; readability comes first.
- Link products with <a href="/shop/ID">Name</a> inside paragraph or list text, only from the products given below, 2-4 links total, where they truly fit. You may link a category as <a href="/shop?category=Necklaces">necklaces</a>. No other HTML.
- FAQ: 3 distinct questions people also search around this topic, each answer self-contained in 1-3 sentences, plain text.
- Tags: 5 lowercase search terms.`;

  if (subject.kind === "product") {
    const p = subject.product;
    return `${common}

We just added a new piece to the shop:
${describeProduct(p, true)}

Other pieces you may link to:
${featured.filter((f) => f.id !== p.id).map((f) => describeProduct(f)).join("\n") || "(none)"}

Write a blog post that ranks for what people search about THIS TYPE of piece — not the product name (nobody searches that). Choose the single most useful search question for it (e.g. "how to wear a toggle necklace", "what does a cross bracelet mean", "how to layer a choker"), fitting the season where it makes sense. Put that question in "targetQuery". Also pick 3-5 long-tail variations people search around it (materials, occasions, pairings, gifting, sizing) and work them in. The new piece should be featured naturally as a strong example, using only the facts given above — do not invent measurements or materials.

${rules}`;
  }

  const e = subject.entry;
  return `${common}

Search question to answer: "${e.query}"${e.why ? `\nWhy it's timely: ${e.why}` : ""}${e.keywords?.length ? `\nLong-tail keywords to work in: ${e.keywords.map((k) => `"${k}"`).join(", ")}` : ""}

Products you may link to${e.productIds?.length ? " (the first ones were matched to this search — feature them)" : ""}:
${featured.map((f, i) => describeProduct(f, i < (e.productIds?.length ?? 0))).join("\n") || "(none — link to /shop instead)"}

Write a blog post that is the best answer on the web for that search. Put the search question in "targetQuery".

${rules}`;
}

const POST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["targetQuery", "title", "excerpt", "category", "content", "faq", "tags"],
  properties: {
    targetQuery: { type: "string" },
    title:       { type: "string" },
    excerpt:     { type: "string", description: "Meta description: under 155 characters, answers the question and makes someone click." },
    category:    { type: "string", enum: BLOG_CATEGORIES },
    content: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "text", "items"],
        properties: {
          type:  { type: "string", enum: ["paragraph", "heading", "list"] },
          text:  { type: "string", description: "Paragraph or heading text. For a list, an optional short lead-in (or empty string)." },
          items: { type: "array", items: { type: "string" }, description: "List items for type=list; empty array otherwise." },
        },
      },
    },
    faq: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "answer"],
        properties: { question: { type: "string" }, answer: { type: "string" } },
      },
    },
    tags: { type: "array", items: { type: "string" } },
  },
};

// ─── Generation + quality gate ──────────────────────────────────────────────

async function callModel(client, prompt) {
  const response = await client.beta.messages
    .stream({
      model: MODEL,
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: { type: "json_schema", schema: POST_SCHEMA } },
      messages: [{ role: "user", content: prompt }],
    })
    .finalMessage();

  if (response.stop_reason === "refusal") throw new Error("Model declined the request.");
  if (response.stop_reason === "max_tokens") throw new Error("Response hit max_tokens.");
  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("No text in response.");
  return JSON.parse(text);
}

// Only allow links the site can serve: known product ids and category pages.
// Anything else (a hallucinated product slug, an external URL) is unwrapped to
// plain text instead of shipping a broken link.
function sanitizeLinks(html, productIds) {
  return html.replace(/<a\s+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, (whole, href, label) => {
    const productMatch = href.match(/^\/shop\/([^/?#]+)$/);
    if (productMatch && productIds.has(productMatch[1])) return `<a href="${href}">${label}</a>`;
    if (/^\/shop(\?category=[^"'<>]+)?$/.test(href) || href === "/gifts" || href === "/plus-size") return `<a href="${href}">${label}</a>`;
    return label;
  });
}

function normalizeBlocks(blocks, productIds) {
  return blocks
    .map((b) => {
      if (b.type === "list") {
        const items = b.items.map((i) => sanitizeLinks(i, productIds)).filter((i) => i.trim());
        return items.length ? { type: "list", ...(b.text.trim() ? { text: sanitizeLinks(b.text, productIds) } : {}), items } : null;
      }
      if (!b.text.trim()) return null;
      return { type: b.type, text: b.type === "heading" ? b.text.replace(/<[^>]+>/g, "") : sanitizeLinks(b.text, productIds) };
    })
    .filter(Boolean);
}

// Plain text for FAQ fields: no HTML, and no stray brackets left dangling at the end.
const plainText = (s) => s.replace(/<[^>]+>/g, "").replace(/[\s\[\]{}]+$/, "").trim();

function countWords(blocks) {
  return blocks
    .flatMap((b) => [b.text ?? "", ...(b.items ?? [])])
    .join(" ")
    .replace(/<[^>]+>/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
}

function qualityProblems(parsed, blocks, posts) {
  const problems = [];
  const words = countWords(blocks);
  if (words < MIN_WORDS) problems.push(`only ${words} words (min ${MIN_WORDS})`);
  if (parsed.title.length > 70) problems.push(`title is ${parsed.title.length} chars`);
  if (!blocks.some((b) => b.type === "heading")) problems.push("no section headings");
  const allText = JSON.stringify([parsed.title, parsed.excerpt, blocks, parsed.faq]).toLowerCase();
  const banned = BANNED_WORDS.filter((w) => allText.includes(w));
  if (banned.length) problems.push(`banned words: ${banned.join(", ")}`);
  if (posts.some((p) => p.slug === slugify(parsed.title))) problems.push("slug already exists");
  const similar = findSimilarTitle(parsed.title, posts);
  if (similar) problems.push(`too similar to existing post "${similar}"`);
  return problems;
}

async function generate(client, subject, posts, products, now) {
  const featured = subject.kind === "product"
    ? [subject.product, ...relatedProducts(subject.product, products)]
    : productsForEntry(subject.entry, products);
  const productIds = new Set(products.filter(isLive).map((p) => p.id));
  const basePrompt = buildPrompt(subject, featured, now);

  let prompt = basePrompt;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const parsed = await callModel(client, prompt);
    const blocks = normalizeBlocks(parsed.content, productIds);
    const problems = qualityProblems(parsed, blocks, posts);
    if (problems.length === 0) {
      const today = now.toISOString().slice(0, 10);
      return {
        slug:     slugify(parsed.title),
        title:    parsed.title,
        excerpt:  parsed.excerpt,
        content:  blocks,
        faq:      parsed.faq.map((f) => ({ question: plainText(f.question), answer: plainText(f.answer) })),
        date:     today,
        category: subject.entry ? subject.entry.category : parsed.category,
        topic:    subject.entry ? subject.entry.query : parsed.targetQuery,
        source:   subject.kind,
        ...(subject.kind === "product" ? { sourceProductId: subject.product.id } : {}),
        tags:     parsed.tags.map((t) => t.toLowerCase()),
        readTime: `${Math.max(3, Math.ceil(countWords(blocks) / 200))} min read`,
        featuredProducts: featured.slice(0, 4).map((p) => ({
          id: p.id, name: p.name, price: `€${p.price}`, image: p.images?.[0] ?? null, url: `/shop/${p.id}`,
        })),
      };
    }
    console.log(`Attempt ${attempt} failed quality check: ${problems.join("; ")}`);
    prompt = `${basePrompt}\n\nA previous draft was rejected for: ${problems.join("; ")}. Fix these.`;
  }
  return null;
}

// ─── Similarity helpers ─────────────────────────────────────────────────────

// Jaccard word-overlap after stripping template words that make genuinely
// different topics look alike (see the Sep 2026 cleanup of 57 near-duplicates).
const TITLE_SIMILARITY_STOPWORDS = new Set([
  "that", "with", "your", "from", "this", "have", "what", "actually", "feel",
  "gifts", "gift", "jewelry", "wear", "wearing", "every", "day", "she", "shell",
  "the", "for", "and", "best", "real", "style", "styling", "guide", "body",
  "chain", "chains", "how", "ideas",
]);

function titleWords(title) {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !TITLE_SIMILARITY_STOPWORDS.has(w))
  );
}

function findSimilarTitle(candidateTitle, existingPosts, threshold = 0.55) {
  const candidate = titleWords(candidateTitle);
  if (candidate.size === 0) return null;
  for (const post of existingPosts) {
    const other = titleWords(post.title);
    if (other.size === 0) continue;
    const intersection = [...candidate].filter((w) => other.has(w)).length;
    if (intersection < 2) continue;
    const union = new Set([...candidate, ...other]).size;
    if (intersection / union >= threshold) return post.title;
  }
  return null;
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const now      = new Date();
  const posts    = JSON.parse(readFileSync(BLOG_FILE, "utf-8"));
  const products = JSON.parse(readFileSync(PRODUCTS_FILE, "utf-8"));
  const queue    = JSON.parse(readFileSync(QUEUE_FILE, "utf-8"));

  const today = now.toISOString().slice(0, 10);
  const postedToday = posts.filter((p) => p.date === today).length;
  if (postedToday >= MAX_POSTS_PER_DAY && process.env.FORCE !== "1") {
    console.log(`Already ${postedToday} post(s) today (max ${MAX_POSTS_PER_DAY}). Skipping.`);
    return;
  }

  const subject = pickSubject(posts, products, queue, now);
  if (process.env.DRY_RUN === "1") {
    console.log("Would write:", subject ? `[${subject.kind}] ${subject.product?.id ?? subject.entry.query}` : "nothing");
    return;
  }
  if (!subject) {
    console.log("Nothing to write: no uncovered new products and no in-season queue entries. Add queries to data/blog-queue.json.");
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not set — skipping blog generation.");
    return;
  }

  console.log(subject.kind === "product"
    ? `Writing a new-product post for "${subject.product.name}"`
    : `Writing a ${subject.kind} post for search query "${subject.entry.query}"`);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const newPost = await generate(client, subject, posts, products, now);
  if (!newPost) {
    console.log("No post passed the quality check — skipping this run.");
    return;
  }

  posts.unshift(newPost);
  writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2));
  console.log(`Done! Added: "${newPost.title}" (${newPost.readTime})`);
}

main().catch((e) => {
  if (e?.status === 401 || e?.status === 403) {
    console.error("Anthropic API key invalid or expired — skipping blog generation. Update ANTHROPIC_API_KEY in GitHub secrets.");
    process.exit(0);
  }
  console.error(e);
  process.exit(1);
});
