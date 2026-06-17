import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_FILE = join(__dirname, "../data/blog-posts.json");

const TOPIC_POOLS = [
  { category: "Style Guide", topics: [
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
  ]},
  { category: "Care & Quality", topics: [
    "how to clean your stainless steel jewelry at home",
    "why 316L stainless steel is the best material for everyday jewelry",
    "how to store jewelry so it lasts longer",
    "the truth about tarnish-resistant jewelry",
    "can you really shower with your jewelry on",
    "what makes handmade jewelry different from mass produced",
    "how to tell if your jewelry is truly waterproof",
  ]},
  { category: "Inspiration", topics: [
    "the best jewelry trends for summer 2026",
    "wedding jewelry ideas that aren't the usual necklace and earrings",
    "body jewelry for brides and bridesmaids",
    "why body jewelry is having a major moment right now",
    "jewelry ideas for your honeymoon packing list",
    "the most wearable jewelry for summer holidays",
    "how to build a jewelry wardrobe that works year round",
    "jewelry styling inspiration from the Mediterranean",
    "bikini jewelry: how to accessorize at the beach",
  ]},
  { category: "Gift Guide", topics: [
    "best jewelry gifts for her under €50",
    "jewelry gift ideas for a birthday",
    "what to buy a woman who has everything",
    "the best handmade jewelry gifts from Europe",
    "jewelry gift ideas for bridesmaids",
    "anniversary jewelry gift ideas she will actually wear",
  ]},
];

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
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const posts = JSON.parse(readFileSync(BLOG_FILE, "utf-8"));
  const { topic, category } = pickTopic(posts);

  console.log(`Generating post about: "${topic}" (${category})`);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `You are writing a blog post for Bodystrands, a handmade body jewelry brand based in Portugal.

Brand voice: warm, confident, editorial — like a knowledgeable friend who happens to have great taste. Not salesy. Not generic. Feels personal and real.

Brand details:
- Jewelry is handmade from 316L stainless steel (waterproof, tarnish-resistant)
- Categories: belly chains, back chains, body chains, shoulder chains, anklets, bracelets, necklaces, hand chains, head chains, eyeglasses chains, bikini clip chains
- Made by El & Gio in Portugal
- Ships across Europe

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
- No markdown in content (no bold, no bullet points, no headers)
- Don't start with "I" or the brand name
- Don't be salesy — inform and inspire first
- Naturally mention Bodystrands products where relevant but don't force it
- Tags should be lowercase, relevant search terms`,
    }],
  });

  const raw = message.content[0].text.trim();
  const parsed = JSON.parse(raw);

  const today = new Date().toISOString().split("T")[0];
  const slug = slugify(parsed.title);

  if (posts.find((p) => p.slug === slug)) {
    console.log("Slug already exists, skipping.");
    return;
  }

  const newPost = {
    slug,
    title: parsed.title,
    excerpt: parsed.excerpt,
    content: parsed.content,
    date: today,
    category,
    tags: parsed.tags,
    readTime: `${Math.max(2, Math.ceil(parsed.content.join(" ").split(" ").length / 200))} min read`,
  };

  posts.unshift(newPost);
  writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2));
  console.log(`Done! Added: "${newPost.title}"`);
}

main().catch((e) => { console.error(e); process.exit(1); });
