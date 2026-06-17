import { MetadataRoute } from "next";
import { products } from "@/lib/products";
import blogPosts from "@/data/blog-posts.json";

const BASE = "https://www.bodystrands.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                         priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE}/shop`,               priority: 0.9, changeFrequency: "daily"  },
    { url: `${BASE}/about`,              priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/contact`,            priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/track`,              priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/shipping`,           priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/privacy-policy`,     priority: 0.3, changeFrequency: "yearly"  },
    { url: `${BASE}/terms`,              priority: 0.3, changeFrequency: "yearly"  },
  ];

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.active !== false)
    .map((p) => ({
      url:             `${BASE}/shop/${p.id}`,
      priority:        0.8,
      changeFrequency: "weekly" as const,
    }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url:             `${BASE}/blog/${p.slug}`,
    priority:        0.7,
    changeFrequency: "monthly" as const,
    lastModified:    new Date(p.date),
  }));

  return [...staticPages, ...productPages, blogPages[0] ? { url: `${BASE}/blog`, priority: 0.8, changeFrequency: "daily" as const } : null, ...blogPages].filter(Boolean) as MetadataRoute.Sitemap;
}
