import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  ["/admin", "/api/admin/", "/success"],
      },
    ],
    sitemap: "https://www.bodystrands.com/sitemap.xml",
  };
}
