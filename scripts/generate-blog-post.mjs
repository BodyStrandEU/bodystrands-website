import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_FILE     = join(__dirname, "../data/blog-posts.json");
const PRODUCTS_FILE = join(__dirname, "../data/products.json");

const TOPIC_POOLS = [
  { category: "Style Guide", keywords: ["shoulder chain", "back chain", "belly chain", "body chain", "anklet", "head chain", "hand chain", "eyeglasses chain", "bikini", "bracelet", "necklace"], topics: [
    "how to style a shoulder chain for summer",
    "how to layer body jewelry without overdoing it",
    "best jewelry for a beach wedding guest",
    "how to wear a belly chain with every outfit",
    "the effortless way to style an anklet",
    "how to wear body chains to a festival",
    "jewelry styling tips for backless dresses",
    "how to mix gold and silver jewelry confidently",
    "styling head chains for weddings and special occasions",
    "how to wear hand chains for everyday looks",
    "the minimalist guide to body jewelry",
    "how to style eyeglasses chains as a fashion statement",
    "how to wear a back chain to the beach",
    "the best shoulder chain outfits for summer",
    "how to stack bracelets without it looking too busy",
    "the best anklet and bracelet combinations for summer",
    "how to wear a dainty necklace every single day",
    "the right way to layer necklaces at different lengths",
    "how to style a hand chain with any outfit",
    "bikini jewelry the pieces that actually stay on",
    "how to wear an eyeglasses chain and make it look intentional",
    "belly chain styling tips for every body type",
    "the best jewelry for a backless wedding dress",
    "how to choose between gold and silver jewelry",
    "how to wear a head chain without it looking costume-y",
    "how to layer a body chain over a dress for fall",
    "the best jewelry to layer over sweaters and knitwear",
    "how to style shoulder chains for autumn outfits",
    "layering jewelry over long sleeves without it disappearing",
    "transitional jewelry styling from summer into fall",
    "how to make body jewelry work with jackets and layers",
  ]},
  { category: "Personalized Jewelry", keywords: ["personalised", "personalized", "customized", "birthstone", "birth flower", "zodiac", "initial", "charm", "custom"], topics: [
    "personalised bracelet gift ideas for every occasion",
    "what is a birthstone bracelet and which one should you choose",
    "birth flower jewelry the meaningful gift everyone actually wants",
    "why personalised jewelry makes the best gift",
    "zodiac charm bracelet the gift that matches their personality",
    "initial bracelet who to buy it for and why",
    "customized jewelry vs off the shelf why personal always wins",
    "the best personalized jewelry gifts for her under 50 euros",
    "how to choose the right birthstone for a gift",
    "birth flower bracelet meaning and symbolism for all 12 months",
    "why customized bracelets and necklaces are the most searched gifts right now",
    "the most meaningful personalized jewelry for bridesmaids",
    "personalised bracelet ideas that dont look cheap",
    "zodiac jewelry which sign wears which style best",
    "birthstone jewelry a complete guide to every month",
    "how to personalise jewelry as a gift without overthinking it",
    "charm bracelet meaning why every charm tells a story",
    "the difference between birthstone and birth flower jewelry",
  ]},
  { category: "Gift Guide", keywords: ["gift", "birthday", "anniversary", "bridesmaid", "christmas", "mother", "valentine", "graduation", "friend"], topics: [
    "best jewelry gifts for her under 50 euros",
    "jewelry gift ideas for a birthday she will actually wear",
    "what to buy a woman who has everything",
    "the best handmade jewelry gifts from Europe",
    "jewelry gift ideas for bridesmaids she will keep forever",
    "anniversary jewelry gift ideas she will actually love",
    "christmas jewelry gifts that feel personal not generic",
    "mothers day jewelry gift ideas that arent boring",
    "valentines day jewelry gifts beyond the usual",
    "the best gift for a friend who loves jewelry",
    "graduation gift ideas jewelry she will wear for years",
    "jewelry gifts for the woman who has everything",
    "affordable luxury jewelry gifts under 35 euros",
    "the best jewelry gifts for a new girlfriend",
    "handmade jewelry gifts that feel more personal than store bought",
    "best friend jewelry gifts that arent cheesy",
    "jewelry gift guide for every type of woman",
    "what jewelry to buy someone who already has a lot",
    "last minute jewelry gift ideas that still feel thoughtful",
    "jewelry gifts for teenagers and young women",
    "the best jewelry gifts for a sister",
    "confirmation and communion bracelet gifts under 30 euros",
    "meaningful baptism bracelet gifts for a goddaughter",
    "catholic bracelet gifts for first communion and confirmation",
    "baptism gift ideas under 30 euros she will actually wear",
    "honeymoon gift ideas jewelry she will wear every day",
  ]},
  { category: "Care & Quality", keywords: ["stainless steel", "waterproof", "jewelry care", "tarnish"], topics: [
    "how to clean your stainless steel jewelry at home",
    "why 316L stainless steel is the best material for everyday jewelry",
    "how to store jewelry so it lasts longer",
    "the truth about tarnish-resistant jewelry",
    "can you really shower with your jewelry on",
    "what makes handmade jewelry different from mass produced",
    "how to tell if your jewelry is truly waterproof",
    "why stainless steel jewelry is better than gold plated",
    "how long does stainless steel jewelry last",
    "the real difference between gold plated and gold tone jewelry",
  ]},
  { category: "Inspiration", keywords: ["summer", "wedding", "beach", "holiday", "bride", "bridal", "festival", "travel"], topics: [
    "the best jewelry trends for summer 2026",
    "wedding jewelry ideas that arent the usual necklace and earrings",
    "body jewelry for brides and bridesmaids",
    "why body jewelry is having a major moment right now",
    "jewelry ideas for your honeymoon packing list",
    "the most wearable jewelry for summer holidays",
    "how to build a jewelry wardrobe that works year round",
    "jewelry styling inspiration from the Mediterranean",
    "the best jewelry for a beach vacation",
    "festival jewelry what to wear and how to style it",
    "bridal jewelry beyond the veil and earrings",
    "what jewelry to pack for a holiday in the sun",
    "the jewelry pieces worth investing in this year",
    "why handmade jewelry from small brands just hits different",
    "jewelry trends that are actually wearable not just runway",
    "the best jewelry for a winter sun getaway",
    "packing jewelry for a tropical winter escape",
  ]},
  { category: "Plus Size", keywords: ["plus size", "curvy", "curvaceous"], topics: [
    "plus size body jewelry that actually fits",
    "how to size a plus size belly chain",
    "why plus size body jewelry is so hard to find",
    "the truth about adjustable jewelry and plus size bodies",
    "plus size jewelry gift ideas for curvy women",
    "how to measure yourself for a plus size body chain",
    "plus size beach jewelry that stays comfortable all day",
    "curvy body positive jewelry styling tips",
    "why we built body jewelry for real plus size measurements",
    "plus size jewelry brands that actually deliver on sizing",
  ]},
];

// Map topic text to product categories
const CATEGORY_KEYWORDS = {
  "Shoulder Chains":    ["shoulder chain"],
  "Back Chains":        ["back chain", "backless dress"],
  "Belly Chains":       ["belly chain", "belly", "waist chain"],
  "Body Chains":        ["body chain", "festival"],
  "Anklets":            ["anklet", "ankle bracelet"],
  "Head Chains":        ["head chain", "hair chain", "headpiece", "bridal headpiece", "wedding headpiece"],
  "Hand Chains":        ["hand chain"],
  "Necklaces":          ["necklace", "choker", "lariat", "pendant necklace"],
  "Bracelets":          ["bracelet", "birthstone", "birth flower", "zodiac", "initial", "personalised", "personalized", "customized", "charm bracelet", "layered bracelet", "stacking bracelet"],
  "Eyeglasses Chains":  ["eyeglasses", "glasses chain", "sunglasses chain"],
  "Leg Chains":         ["leg chain", "thigh chain"],
  "Bikini Clip Chains": ["bikini"],
};

function getRelevantProducts(topic, allProducts) {
  const topicLower = topic.toLowerCase();
  const matched = new Set();

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => topicLower.includes(kw))) {
      matched.add(cat);
    }
  }

  // If no specific category matched, use all
  let pool = allProducts.filter((p) =>
    p.active !== false && (matched.size === 0 || matched.has(p.category))
  );

  // Plus-size topics should link to the actual plus-size products, not just
  // any random item from the matched category (e.g. Belly Chains) — falls
  // back to the general pool if there aren't enough plus-size products yet.
  if (topicLower.includes("plus size") || topicLower.includes("curvy") || topicLower.includes("curvaceous")) {
    const plusSizePool = pool.filter((p) => p.plusSize);
    if (plusSizePool.length > 0) pool = plusSizePool;
  }

  // Shuffle and pick up to 4 products
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 4);
  return shuffled.map((p) => ({
    name: p.name,
    id: p.id,
    url: `/shop/${p.id}`,
    price: `€${p.price}`,
    category: p.category,
    image: p.images?.[0] ?? null,
  }));
}

function getRelevantCategories(topic) {
  const topicLower = topic.toLowerCase();
  const matched = [];

  if (topicLower.includes("plus size") || topicLower.includes("curvy") || topicLower.includes("curvaceous")) {
    matched.push({ name: "Plus Size", url: "/plus-size" });
  }

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => topicLower.includes(kw))) {
      const encoded = encodeURIComponent(cat);
      matched.push({ name: cat, url: `/shop?category=${encoded}` });
    }
  }

  // Always include the main shop as a fallback
  if (matched.length === 0) {
    matched.push({ name: "Body Jewelry", url: "/shop" });
  }

  return matched.slice(0, 3);
}

// Topics that read as summer/beach/warm-vacation specific — these should sit out
// during autumn (Sep-Nov) so the blog doesn't tell people to go to the beach
// while everyone's buying sweaters. They're allowed again Dec-Aug.
const SUMMER_ONLY_TOPICS = new Set([
  "how to style a shoulder chain for summer",
  "best jewelry for a beach wedding guest",
  "how to wear a back chain to the beach",
  "the best shoulder chain outfits for summer",
  "the best anklet and bracelet combinations for summer",
  "bikini jewelry the pieces that actually stay on",
  "the best jewelry trends for summer 2026",
  "jewelry ideas for your honeymoon packing list",
  "the most wearable jewelry for summer holidays",
  "jewelry styling inspiration from the Mediterranean",
  "the best jewelry for a beach vacation",
  "what jewelry to pack for a holiday in the sun",
  "plus size beach jewelry that stays comfortable all day",
]);

// The reverse: winter-getaway framing (tropical escape, winter sun) — only
// makes sense once it's actually cold at home, so restrict to Dec-Feb rather
// than letting it get picked in the middle of summer.
const WINTER_GETAWAY_TOPICS = new Set([
  "the best jewelry for a winter sun getaway",
  "packing jewelry for a tropical winter escape",
]);

function seasonallyAppropriate(topic, month) {
  // month is 1-12. Summer-worded topics only make sense Mar-Aug; the rest of
  // the year (autumn + winter) the vacation/beach need is covered by the
  // dedicated winter-getaway topics instead, restricted to Dec-Feb.
  const isSpringSummer = month >= 3 && month <= 8;
  const isWinter = month === 12 || month <= 2;
  if (SUMMER_ONLY_TOPICS.has(topic) && !isSpringSummer) return false;
  if (WINTER_GETAWAY_TOPICS.has(topic) && !isWinter) return false;
  return true;
}

function pickTopic(existingPosts, exclude = new Set(), now = new Date()) {
  const currentMonth = now.getMonth() + 1;
  const allTopics = TOPIC_POOLS.flatMap((pool) =>
    pool.topics.map((t) => ({ topic: t, category: pool.category }))
  ).filter(({ topic }) => !exclude.has(topic) && seasonallyAppropriate(topic, currentMonth));

  // Exact-match against the literal topic string used to generate each past post
  // (not the LLM-rewritten title, which rarely shares wording with the topic).
  // Note: ~68 legacy posts predate topic-tracking and have no `topic` field, so
  // this can still hand out a topic that collides on slug — the caller retries.
  const usedTopics = new Set(existingPosts.map((p) => p.topic).filter(Boolean));
  const neverUsed = allTopics.filter(({ topic }) => !usedTopics.has(topic));

  if (neverUsed.length > 0) {
    return neverUsed[Math.floor(Math.random() * neverUsed.length)];
  }

  // Full pool has cycled at least once — still avoid anything used in the last
  // 180 days. At ~104 topics and 3 posts/day the pool cycles in ~5 weeks, so a
  // short cooldown (the old value was 21 days) let the same topic reappear
  // almost immediately after first exhaustion — that's how Valentine's Day
  // ended up published 4 times in under 3 months. 180 days makes real repeats rare.
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 180);
  const recentTopics = new Set(
    existingPosts
      .filter((p) => p.topic && new Date(p.date) >= cutoff)
      .map((p) => p.topic)
  );
  const cooledDown = allTopics.filter(({ topic }) => !recentTopics.has(topic));
  const pool = cooledDown.length > 0 ? cooledDown : allTopics;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function generateAttempt(client, topic, category, posts, products) {
  const relevantProducts    = getRelevantProducts(topic, products);
  const relevantCategories  = getRelevantCategories(topic);

  console.log(`Generating post about: "${topic}" (${category})`);
  console.log(`Linking products: ${relevantProducts.map((p) => p.name).join(", ")}`);
  console.log(`Linking categories: ${relevantCategories.map((c) => c.name).join(", ")}`);

  const productContext = relevantProducts.length > 0
    ? `\nReal products from the Bodystrands shop you can link to naturally in the content:\n${relevantProducts.map((p) => `- "${p.name}" (${p.price}) → <a href="${p.url}">${p.name}</a>`).join("\n")}\n`
    : "";

  const categoryContext = relevantCategories.length > 0
    ? `\nCategory pages you can link to when mentioning a collection broadly (use 1-2 times max):\n${relevantCategories.map((c) => `- ${c.name} collection → <a href="${c.url}">shop all ${c.name.toLowerCase()}</a>`).join("\n")}\n`
    : "";

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1800,
    messages: [{
      role: "user",
      content: `You are writing a blog post for Bodystrands EU — a small, couple-run handmade body jewelry brand based in Portugal, run by El & Gio.

The brand story: El and Gio are a couple who fell in love with the original Canadian Bodystrands brand and brought it to Europe. Every single piece is handmade by the two of them in their Portuguese studio — no factories, no middlemen. They pour their care into every strand.

Products: belly chains, back chains, body chains, shoulder chains, anklets, bracelets (including birthstone bracelets, birth flower charm bracelets, zodiac charm bracelets, initial bracelets, pearl bracelets), necklaces, hand chains, head chains, eyeglasses chains, bikini clip chains. All made from high-quality stainless steel — waterproof, tarnish-resistant, built for everyday wear. Never claim a specific technical grade (no "316L", "marine-grade", "medical-grade", or "surgical-grade" — these have not been verified for our material and must never appear). Prices range from €17.50 to €55. Many pieces are personalised — customers choose their birthstone, birth flower month, zodiac sign, or initial at checkout.
${productContext}${categoryContext}
Brand voice:
- Warm, real, and direct — like a close friend who genuinely knows jewelry
- Speaks TO the reader, not at them — always "you", never preaching
- Confident but never arrogant
- Human first — this is a real couple making things by hand, not a corporation
- Short sentences. No fluff. No filler.

Write a blog post about: "${topic}"
Category: ${category}

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "title": "catchy, specific title under 70 characters",
  "excerpt": "one sentence that makes someone want to read more, under 150 characters",
  "content": [
    { "type": "paragraph", "text": "intro paragraph, 2-4 sentences" },
    { "type": "paragraph", "text": "second paragraph" },
    { "type": "heading", "text": "a specific, scannable subheading — often phrased as a mini-question or the exact thing someone would search" },
    { "type": "paragraph", "text": "paragraph under that heading" },
    { "type": "paragraph", "text": "paragraph under that heading" },
    { "type": "heading", "text": "second subheading" },
    { "type": "paragraph", "text": "paragraph under that heading" },
    { "type": "paragraph", "text": "paragraph under that heading" },
    { "type": "heading", "text": "third subheading" },
    { "type": "paragraph", "text": "closing paragraph" }
  ],
  "faq": [
    { "question": "a real question someone would type into Google about this exact topic", "answer": "a direct, complete answer in 1-3 sentences — self-contained, doesn't require reading the rest of the post to make sense" },
    { "question": "second question", "answer": "second answer" },
    { "question": "third question", "answer": "third answer" }
  ],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Rules:
- 2-3 "heading" blocks total, each a short scannable phrase (not a full sentence, not clickbait) — these break the post into sections a reader (or an AI summarizer) can jump straight to
- 2-4 "paragraph" blocks under each heading, each 2-4 sentences, plus the intro paragraph(s) before the first heading
- Paragraph text may contain HTML anchor tags — use them naturally to link to 1-2 real products AND 1-2 category pages where they fit in context. Don't force it. Example: "The <a href="/shop/goddess-shoulder-chain">Goddess Shoulder Chain</a> is one of our most-worn pieces for exactly this reason." or "Browse our full <a href="/shop?category=Shoulder%20Chains">shoulder chains collection</a> to find your fit."
- No HTML in heading text or in the faq question/answer text — plain text only there
- No other HTML or markdown anywhere — only <a href="..."> tags inside paragraph text are allowed
- The 3 FAQ questions must be genuinely distinct real questions a reader would search (not just the topic reworded three times) and each answer must stand alone — someone should get the full answer just from reading the FAQ, without needing the article above it
- Never use AI jargon or corporate language (no "elevate", "curated", "testament to", "journey", "delve", "game-changer", "transformative")
- Don't start with "I" or the brand name
- Focus on the reader and what's useful or real to them — not on selling
- Write like a human, not a content machine
- Tags should be lowercase, relevant search terms`,
    }],
  });

  let raw = message.content[0].text.trim()
    .replace(/^```json\s*/i, "").replace(/^```\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  // Fix unescaped " inside href="..." attributes (common Claude JSON mistake)
  raw = raw.replace(/href="([^"]*)"/g, (_, url) => `href='${url}'`);
  // Fix trailing commas before } or ]
  const cleaned = raw.replace(/,(\s*[}\]])/g, "$1");

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    // Last resort: extract outermost {} and retry
    const start = cleaned.indexOf("{");
    const end   = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    } else {
      throw e;
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const slug  = slugify(parsed.title);

  if (posts.find((p) => p.slug === slug)) {
    console.log(`Slug "${slug}" already exists — will retry with a different topic.`);
    return null;
  }

  const wordCount = parsed.content.map((b) => b.text).join(" ").split(" ").length
    + (parsed.faq ?? []).map((f) => `${f.question} ${f.answer}`).join(" ").split(" ").length;

  return {
    slug,
    title:    parsed.title,
    excerpt:  parsed.excerpt,
    content:  parsed.content,
    faq:      parsed.faq ?? [],
    date:     today,
    category,
    topic,
    tags:     parsed.tags,
    readTime: `${Math.max(2, Math.ceil(wordCount / 200))} min read`,
    featuredProducts: relevantProducts.map((p) => ({
      id:    p.id,
      name:  p.name,
      price: p.price,
      image: p.image,
      url:   p.url,
    })),
  };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not set — skipping blog generation.");
    return;
  }
  const client   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const posts    = JSON.parse(readFileSync(BLOG_FILE, "utf-8"));
  const products = JSON.parse(readFileSync(PRODUCTS_FILE, "utf-8"));

  const MAX_ATTEMPTS = 5;
  const tried = new Set();
  let newPost = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const picked = pickTopic(posts, tried);
    if (!picked) {
      console.log("No untried topics left in the pool — stopping.");
      break;
    }
    const { topic, category } = picked;
    tried.add(topic);

    newPost = await generateAttempt(client, topic, category, posts, products);
    if (newPost) break;
    console.log(`Attempt ${attempt}/${MAX_ATTEMPTS} collided, trying another topic...`);
  }

  if (!newPost) {
    console.log(`No unique post generated after ${MAX_ATTEMPTS} attempts — skipping this run.`);
    return;
  }

  posts.unshift(newPost);
  writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2));
  console.log(`Done! Added: "${newPost.title}"`);
}

main().catch((e) => {
  if (e?.status === 401 || e?.status === 403) {
    console.error("Anthropic API key invalid or expired — skipping blog generation. Update ANTHROPIC_API_KEY in GitHub secrets.");
    process.exit(0);
  }
  console.error(e);
  process.exit(1);
});
