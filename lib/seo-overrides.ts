// Google titles + meta descriptions rewritten from real Search Console data for pages that
// rank on page 1-2 but get few clicks (scripts/seo-ctr-rewrite.mjs). Only what Google shows
// changes; visible headlines and product names stay as they are.
import overrides from "@/data/seo-overrides.json";

type Override = { title: string; description: string };
const byKey = new Map<string, Override>();
for (const [path, o] of Object.entries(overrides as Record<string, Override>)) {
  const u = new URL(path, "https://www.bodystrands.com");
  const cat = u.searchParams.get("category");
  byKey.set(cat ? `category:${cat}` : u.pathname, o);
}

export const blogSeo = (slug: string) => byKey.get(`/blog/${slug}`);
export const productSeo = (id: string) => byKey.get(`/shop/${id}`);
export const categorySeo = (category: string) => byKey.get(`category:${category}`);
