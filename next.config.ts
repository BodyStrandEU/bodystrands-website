import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
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
