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
  const pool = allProducts.filter((p) =>
    p.active !== false && (matched.size === 0 || matched.has(p.category))
  );

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

function pickTopic(existingPosts) {
  const existingTitles = existingPosts.map((p) => p.title.toLowerCase());
  const allTopics = TOPIC_POOLS.flatMap((pool) =>
    pool.topics.map((t) => ({ topic: t, category: pool.category }))
  );
  const unused = allTopics.filter(
    ({ topic }) => !existingTitles.some((t) => t.includes(topic.split(" ").slice(0, 3).join(" ")))
  );
  const pool = unused.length > 0 ? unused : allTopics;
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

async function main() {
  const client   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const posts    = JSON.parse(readFileSync(BLOG_FILE, "utf-8"));
  const products = JSON.parse(readFileSync(PRODUCTS_FILE, "utf-8"));

  const { topic, category } = pickTopic(posts);
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

Products: belly chains, back chains, body chains, shoulder chains, anklets, bracelets (including birthstone bracelets, birth flower charm bracelets, zodiac charm bracelets, initial bracelets, pearl bracelets), necklaces, hand chains, head chains, eyeglasses chains, bikini clip chains. All made from 316L stainless steel — waterproof, tarnish-resistant, built for everyday wear. Prices range from €17.50 to €55. Many pieces are personalised — customers choose their birthstone, birth flower month, zodiac sign, or initial at checkout.
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
    "paragraph 1 text",
    "paragraph 2 text",
    "paragraph 3 text",
    "paragraph 4 text",
    "paragraph 5 text",
    "paragraph 6 text",
    "paragraph 7 text",
    "paragraph 8 text"
  ],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Rules:
- 8 paragraphs, each 2-4 sentences
- Paragraphs may contain HTML anchor tags — use them naturally to link to 1-2 real products AND 1-2 category pages where they fit in context. Don't force it. Example: "The <a href="/shop/goddess-shoulder-chain">Goddess Shoulder Chain</a> is one of our most-worn pieces for exactly this reason." or "Browse our full <a href="/shop?category=Shoulder%20Chains">shoulder chains collection</a> to find your fit."
- No other HTML or markdown — only <a href="..."> tags are allowed
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
    console.log("Slug already exists, skipping.");
    return;
  }

  const newPost = {
    slug,
    title:    parsed.title,
    excerpt:  parsed.excerpt,
    content:  parsed.content,
    date:     today,
    category,
    tags:     parsed.tags,
    readTime: `${Math.max(2, Math.ceil(parsed.content.join(" ").split(" ").length / 200))} min read`,
    featuredProducts: relevantProducts.map((p) => ({
      id:    p.id,
      name:  p.name,
      price: p.price,
      image: p.image,
      url:   p.url,
    })),
  };

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
