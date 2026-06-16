import { MetadataRoute } from "next";
import { products } from "@/lib/products";

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

  return [...staticPages, ...productPages];
}
