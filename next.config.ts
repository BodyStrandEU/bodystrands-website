import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Caps static-generation worker parallelism — this dev machine is heavily loaded
  // (VS Code, browser, other background processes), and full parallelism was causing
  // page renders to exceed Next's 60s per-page timeout and corrupt the Turbopack cache.
  experimental: {
    cpus: 2,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.etsystatic.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/blog/head-chains-for-weddings-the-styling-guide",
        destination: "/blog/head-chains-for-weddings-your-guide-to-getting-it-right",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
