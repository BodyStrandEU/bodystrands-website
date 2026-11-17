import { products, activeCategories } from "@/lib/products";
import blogPosts from "@/data/blog-posts.json";

// /llms.txt — a plain-text map of the shop for AI assistants (ChatGPT, Perplexity, Claude…).
// Generated from the same data as the site, so prices and pages never go stale.
// Facts here must match the site; link to the policy pages instead of restating them.
export const dynamic = "force-static";

const BASE = "https://www.bodystrands.com";

export function GET() {
  const live = products.filter((p) => p.active !== false);
  const lines: string[] = [];

  lines.push("# Bodystrands");
  lines.push("");
  lines.push(
    "> Bodystrands is a small jewelry brand making handmade body jewelry in Portugal (belly chains, back chains, shoulder chains, body chains, anklets, head chains, hand chains, eyeglasses chains, necklaces and bracelets). Pieces are stainless steel, waterproof and sweat-proof. Worldwide shipping. Prices are in EUR.",
  );
  lines.push("");
  lines.push("## Key pages");
  lines.push(`- [Shop all pieces](${BASE}/shop): the full catalog, filterable by category, finish and price`);
  lines.push(`- [Bridal jewelry](${BASE}/bridal): wedding head chains, shoulder chains and back chains`);
  lines.push(`- [Gift ideas](${BASE}/gifts): gifts by occasion and recipient`);
  lines.push(`- [Plus-size body chains](${BASE}/plus-size): longer and adjustable sizing`);
  lines.push(`- [Men's pieces](${BASE}/men): the men's line`);
  lines.push(`- [Personalized jewelry](${BASE}/personalized)`);
  lines.push(`- [Size guide](${BASE}/size-guide): how to measure for belly, back, shoulder and body chains`);
  lines.push(`- [Shipping & returns](${BASE}/shipping): rates, delivery times, return policy`);
  lines.push(`- [Care instructions](${BASE}/care)`);
  lines.push(`- [FAQ](${BASE}/faq)`);
  lines.push(`- [About](${BASE}/about): the makers, El & Gio`);
  lines.push(`- [Contact](${BASE}/contact)`);
  lines.push("");

  lines.push("## Categories");
  for (const c of activeCategories) {
    const n = live.filter((p) => p.category === c).length;
    lines.push(`- [${c}](${BASE}/shop?category=${encodeURIComponent(c)}): ${n} piece${n === 1 ? "" : "s"}`);
  }
  lines.push("");

  lines.push("## Products");
  for (const c of activeCategories) {
    const items = live.filter((p) => p.category === c);
    if (!items.length) continue;
    lines.push(`### ${c}`);
    for (const p of items) {
      const blurb = (p.description || "").replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s/)[0]?.slice(0, 160) ?? "";
      lines.push(`- [${p.name}](${BASE}/shop/${p.id}): ${p.price} EUR${blurb ? `. ${blurb}` : ""}`);
    }
    lines.push("");
  }

  lines.push("## Guides and articles");
  const posts = [...(blogPosts as { slug: string; title: string; date?: string }[])].sort((a, b) =>
    String(b.date ?? "").localeCompare(String(a.date ?? "")),
  );
  for (const post of posts) lines.push(`- [${post.title}](${BASE}/blog/${post.slug})`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
