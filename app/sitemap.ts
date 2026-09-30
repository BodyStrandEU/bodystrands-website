import { MetadataRoute } from "next";
import { products, CATEGORIES } from "@/lib/products";
import blogPosts from "@/data/blog-posts.json";

const BASE = "https://www.bodystrands.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Deploy-time timestamp — every save (admin edit, new product, new blog post)
  // triggers a rebuild, so this reflects real "last verified" freshness for Google.
  const buildTime = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                         priority: 1.0, changeFrequency: "weekly",  lastModified: buildTime },
    { url: `${BASE}/shop`,               priority: 0.9, changeFrequency: "daily",   lastModified: buildTime },
    { url: `${BASE}/gifts`,              priority: 0.8, changeFrequency: "weekly",  lastModified: buildTime },
    { url: `${BASE}/plus-size`,          priority: 0.8, changeFrequency: "weekly",  lastModified: buildTime },
    { url: `${BASE}/christmas`,          priority: 0.8, changeFrequency: "weekly",  lastModified: buildTime },
    { url: `${BASE}/about`,              priority: 0.7, changeFrequency: "monthly", lastModified: buildTime },
    { url: `${BASE}/size-guide`,         priority: 0.6, changeFrequency: "monthly", lastModified: buildTime },
    { url: `${BASE}/faq`,                priority: 0.5, changeFrequency: "monthly", lastModified: buildTime },
    { url: `${BASE}/contact`,            priority: 0.6, changeFrequency: "monthly", lastModified: buildTime },
    { url: `${BASE}/track`,              priority: 0.5, changeFrequency: "monthly", lastModified: buildTime },
    { url: `${BASE}/shipping`,           priority: 0.5, changeFrequency: "monthly", lastModified: buildTime },
    { url: `${BASE}/care`,               priority: 0.5, changeFrequency: "monthly", lastModified: buildTime },
    { url: `${BASE}/return-policy`,      priority: 0.4, changeFrequency: "monthly", lastModified: buildTime },
    { url: `${BASE}/privacy-policy`,     priority: 0.3, changeFrequency: "yearly",  lastModified: buildTime },
    { url: `${BASE}/terms`,              priority: 0.3, changeFrequency: "yearly",  lastModified: buildTime },
  ];

  // Category pages have their own titles, canonicals and buying guides (see
  // lib/category-content.ts) — they weren't listed before Sep 30, 2026.
  const activeCategories = new Set(products.filter((p) => p.active !== false).map((p) => p.category));
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES
    .filter((c) => activeCategories.has(c))
    .map((c) => ({
      url:             `${BASE}/shop?category=${encodeURIComponent(c)}`,
      priority:        0.85,
      changeFrequency: "weekly" as const,
      lastModified:    buildTime,
    }));

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.active !== false)
    .map((p) => ({
      url:             `${BASE}/shop/${p.id}`,
      priority:        0.8,
      changeFrequency: "weekly" as const,
      lastModified:    buildTime,
    }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url:             `${BASE}/blog/${p.slug}`,
    priority:        0.7,
    changeFrequency: "monthly" as const,
    lastModified:    new Date(p.date),
  }));

  return [...staticPages, ...categoryPages, ...productPages, blogPages[0] ? { url: `${BASE}/blog`, priority: 0.8, changeFrequency: "daily" as const } : null, ...blogPages].filter(Boolean) as MetadataRoute.Sitemap;
}
