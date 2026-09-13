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
      {
        source: "/blog/how-to-transition-your-jewelry-from-summer-to-fall",
        destination: "/blog/how-to-style-body-jewelry-from-summer-into-fall",
        permanent: true,
      },
      {
        source: "/blog/valentines-day-jewelry-gifts-beyond-the-red-box",
        destination: "/blog/valentines-day-jewelry-gifts-beyond-the-box",
        permanent: true,
      },
      {
        source: "/blog/luxury-body-jewelry-gifts-under-35-handmade-real",
        destination: "/blog/luxury-body-jewelry-gifts-under-35-all-handmade",
        permanent: true,
      },
      {
        source: "/blog/how-to-wear-body-chains-to-a-festival-without-looking-overdone",
        destination: "/blog/how-to-wear-body-chains-to-a-festival-without-looking-uncomfortable",
        permanent: true,
      },
      {
        source: "/blog/body-jewelry-for-curves-real-styling-tips-that-work",
        destination: "/blog/body-chain-styling-for-curves-real-tips-that-work",
        permanent: true,
      },
      {
        source: "/blog/how-to-wear-an-eyeglasses-chain-and-actually-look-intentional",
        destination: "/blog/how-to-wear-an-eyeglasses-chain-and-actually-look-cool",
        permanent: true,
      },
      {
        source: "/blog/why-high-quality-stainless-steel-is-best-for-everyday-jewelry",
        destination: "/blog/why-high-quality-stainless-steel-is-the-only-choice-for-everyday-jewelry",
        permanent: true,
      },
      {
        source: "/blog/why-stainless-steel-is-your-best-choice-for-everyday-jewelry",
        destination: "/blog/why-high-quality-stainless-steel-is-the-only-choice-for-everyday-jewelry",
        permanent: true,
      },
      {
        source: "/blog/birth-flower-bracelet-meanings-for-all-12-months",
        destination: "/blog/birth-flower-bracelet-meaning-for-all-12-months",
        permanent: true,
      },
      {
        source: "/blog/jewelry-trends-that-actually-work-for-real-life",
        destination: "/blog/jewelry-trends-that-actually-work-in-real-life",
        permanent: true,
      },
      {
        source: "/blog/why-handmade-jewelry-from-small-brands-just-hits-different",
        destination: "/blog/why-handmade-jewelry-from-small-brands-hits-different",
        permanent: true,
      },
      {
        source: "/blog/jewelry-gifts-for-teens-young-women-that-actually-work",
        destination: "/blog/body-jewelry-gifts-that-actually-hit-for-teens-young-women",
        permanent: true,
      },
      {
        source: "/blog/sun-holiday-packing-jewelry-that-actually-works",
        destination: "/blog/sun-holiday-jewelry-what-actually-works-and-what-doesnt",
        permanent: true,
      },
      {
        source: "/blog/custom-jewelry-vs-off-the-shelf-why-personal-always-wins",
        destination: "/blog/customized-jewelry-vs-off-the-shelf-why-personal-always-wins",
        permanent: true,
      },
      {
        source: "/blog/best-anklet-and-bracelet-combos-for-summer",
        destination: "/blog/the-best-anklet-bracelet-combos-for-summer",
        permanent: true,
      },
      {
        source: "/blog/the-best-jewelry-gifts-for-a-new-girlfriend",
        destination: "/blog/the-best-body-jewelry-gifts-for-a-new-girlfriend",
        permanent: true,
      },
      {
        source: "/blog/gift-guide-what-to-buy-a-woman-who-has-everything",
        destination: "/blog/jewelry-gifts-for-the-woman-who-has-everything",
        permanent: true,
      },
      {
        source: "/blog/gift-guide-jewelry-for-people-who-already-have-everything",
        destination: "/blog/jewelry-gifts-for-the-woman-who-has-everything",
        permanent: true,
      },
      {
        source: "/blog/gift-guide-jewelry-for-people-who-already-own-everything",
        destination: "/blog/jewelry-gifts-for-the-woman-who-has-everything",
        permanent: true,
      },
      {
        source: "/blog/jewelry-for-people-who-already-have-everything",
        destination: "/blog/jewelry-gifts-for-the-woman-who-has-everything",
        permanent: true,
      },
      {
        source: "/blog/birthstone-vs-birth-flower-jewelry-which-one-fits-you",
        destination: "/blog/birthstone-vs-birth-flower-jewelry-which-one-is-you",
        permanent: true,
      },
      {
        source: "/blog/birthstone-vs-birth-flower-jewelry-which-fits-you",
        destination: "/blog/birthstone-vs-birth-flower-jewelry-which-one-is-you",
        permanent: true,
      },
      {
        source: "/blog/best-shoulder-chain-outfits-for-summer",
        destination: "/blog/the-best-shoulder-chain-outfits-for-summer",
        permanent: true,
      },
      {
        source: "/blog/can-you-really-shower-with-body-jewelry-on",
        destination: "/blog/can-you-shower-with-body-jewelry-on-the-real-answer",
        permanent: true,
      },
      {
        source: "/blog/can-you-shower-with-body-jewelry-on-heres-the-real-answer",
        destination: "/blog/can-you-shower-with-body-jewelry-on-the-real-answer",
        permanent: true,
      },
      {
        source: "/blog/which-zodiac-sign-wears-which-jewelry-style-best",
        destination: "/blog/which-zodiac-sign-wears-what-style-best",
        permanent: true,
      },
      {
        source: "/blog/build-a-body-jewelry-wardrobe-that-works-year-round",
        destination: "/blog/build-a-year-round-jewelry-wardrobe-that-actually-works",
        permanent: true,
      },
      {
        source: "/blog/build-a-jewelry-wardrobe-that-works-every-season",
        destination: "/blog/build-a-year-round-jewelry-wardrobe-that-actually-works",
        permanent: true,
      },
      {
        source: "/blog/christmas-jewelry-gifts-that-feel-personal-not-generic",
        destination: "/blog/christmas-gifts-that-actually-feel-personal-not-generic",
        permanent: true,
      },
      {
        source: "/blog/how-to-clean-your-stainless-steel-jewelry",
        destination: "/blog/how-to-clean-your-stainless-steel-jewelry-at-home",
        permanent: true,
      },
      {
        source: "/blog/how-to-clean-stainless-steel-jewelry-at-home",
        destination: "/blog/how-to-clean-your-stainless-steel-jewelry-at-home",
        permanent: true,
      },
      {
        source: "/blog/how-long-does-high-quality-stainless-steel-jewelry-actually-last",
        destination: "/blog/how-long-does-stainless-steel-jewelry-last",
        permanent: true,
      },
      {
        source: "/blog/how-long-does-stainless-steel-jewelry-actually-last",
        destination: "/blog/how-long-does-stainless-steel-jewelry-last",
        permanent: true,
      },
      {
        source: "/blog/charm-bracelet-meaning-why-every-charm-tells-your-story",
        destination: "/blog/charm-bracelet-meaning-why-every-charm-tells-a-story",
        permanent: true,
      },
      {
        source: "/blog/best-jewelry-gifts-for-her-under-50",
        destination: "/blog/the-best-personalized-jewelry-gifts-for-her-under-50",
        permanent: true,
      },
      {
        source: "/blog/best-personalized-jewelry-gifts-for-her-under-50",
        destination: "/blog/the-best-personalized-jewelry-gifts-for-her-under-50",
        permanent: true,
      },
      {
        source: "/blog/best-handmade-jewelry-gifts-from-europe",
        destination: "/blog/the-best-handmade-jewelry-gifts-from-europe",
        permanent: true,
      },
      {
        source: "/blog/layer-body-jewelry-without-overdoing-it",
        destination: "/blog/how-to-layer-body-jewelry-without-overdoing-it",
        permanent: true,
      },
      {
        source: "/blog/personalized-bracelet-gift-ideas-for-every-occasion",
        destination: "/blog/personalised-bracelet-gift-ideas-for-every-occasion",
        permanent: true,
      },
      {
        source: "/blog/the-body-jewelry-pieces-worth-your-money-this-year",
        destination: "/blog/jewelry-worth-your-money-this-year",
        permanent: true,
      },
      {
        source: "/blog/summer-2026-jewelry-trends-whats-actually-worth-wearing",
        destination: "/blog/the-best-jewelry-trends-for-summer-2026",
        permanent: true,
      },
      {
        source: "/blog/the-best-body-jewelry-for-a-beach-wedding-guest",
        destination: "/blog/best-body-jewelry-for-a-beach-wedding-guest",
        permanent: true,
      },
      {
        source: "/blog/best-jewelry-for-a-beach-wedding-guest",
        destination: "/blog/best-body-jewelry-for-a-beach-wedding-guest",
        permanent: true,
      },
      {
        source: "/blog/valentines-day-jewelry-beyond-red-roses-diamonds",
        destination: "/blog/valentines-jewelry-beyond-red-roses-diamond-rings",
        permanent: true,
      },
      {
        source: "/blog/why-high-quality-stainless-steel-beats-gold-plated-every-time",
        destination: "/blog/why-stainless-steel-jewelry-outlasts-gold-plated",
        permanent: true,
      },
      {
        source: "/blog/why-stainless-steel-beats-gold-plated-jewelry",
        destination: "/blog/why-stainless-steel-jewelry-outlasts-gold-plated",
        permanent: true,
      },
      {
        source: "/blog/head-chains-for-weddings-how-to-style-them-right",
        destination: "/blog/head-chains-for-weddings-how-to-wear-them-right",
        permanent: true,
      },
      {
        source: "/blog/jewelry-for-your-honeymoon-what-actually-works",
        destination: "/blog/body-jewelry-for-your-honeymoon-what-actually-works",
        permanent: true,
      },
      {
        source: "/blog/festival-jewelry-what-to-wear-and-how-to-style-it",
        destination: "/blog/how-to-wear-body-chains-to-a-festival",
        permanent: true,
      },
      {
        source: "/blog/how-to-style-jewelry-with-backless-dresses",
        destination: "/blog/how-to-style-body-chains-with-backless-dresses",
        permanent: true,
      },
      {
        source: "/blog/mothers-day-jewelry-that-actually-says-something",
        destination: "/blog/mothers-day-gifts-that-actually-say-something",
        permanent: true,
      },
      {
        source: "/blog/anniversary-jewelry-gifts-shell-actually-wear-every-day",
        destination: "/blog/anniversary-jewelry-gifts-shell-actually-want-to-wear",
        permanent: true,
      },
      {
        source: "/blog/anniversary-jewelry-gifts-shell-wear-every-day",
        destination: "/blog/anniversary-jewelry-gifts-shell-actually-want-to-wear",
        permanent: true,
      },
      {
        source: "/blog/graduation-gift-jewelry-shell-actually-wear-every-day",
        destination: "/blog/graduation-gift-ideas-jewelry-shell-actually-wear",
        permanent: true,
      },
      {
        source: "/blog/honeymoon-gift-ideas-jewelry-shell-actually-wear-every-day",
        destination: "/blog/honeymoon-jewelry-gifts-shell-actually-wear-every-day",
        permanent: true,
      },
      {
        source: "/blog/body-jewelry-for-brides-bridesmaids-beyond-the-dress",
        destination: "/blog/body-jewelry-for-brides-and-bridesmaids",
        permanent: true,
      },
      {
        source: "/blog/gift-guide-body-jewelry-for-every-type-of-woman",
        destination: "/blog/the-body-jewelry-gift-guide-for-every-woman",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
