@AGENTS.md

# Bodystrands — Project Rules & Context

## Brand
- Site: bodystrands.com — handmade body jewelry, made in Portugal by El & Gio
- Brand name is ONE word: **Bodystrands** (never "Body Strands")
- Fonts: Cormorant Garamond (headings) + Josefin Sans (body) — **Inter is FORBIDDEN**
- Colors: blush `#E8B4A8`, gold `#A0622A`, warm dark `#2C2220`, cream `#FDF9F7`, warm gray `#8C7B6E`

## Hard Rules
- **NO Etsy links anywhere on the site** — customers would find cheaper prices. The Buy on Etsy button was intentionally removed and must never come back.
- No Amazon links either.
- No `etsy_url` or `amazon_url` fields on Product type.

## Product Folder Structure
Products are organized on the drive at:
`/Volumes/jordan 2tb/Bodystrands/Bodystrands/Elvan Baby/[Category]/[Product Name]/`

Each product folder contains:
```
Product Name/
├── Gold/                       ← Gold variant photos + gold video (if exists)
├── Silver/                     ← Silver variant photos + silver video (if exists)
├── Apply to Both Variations/   ← Lifestyle + infographic photos shown for BOTH variants
├── Main Category Photo/        ← Single hero image for the shop grid card thumbnail
└── video.mp4 (optional root)   ← If only one video, place at root, applies to both variants
```

## Image Display Logic
- Customer selects **Gold** → Gold/ photos first + Apply to Both Variations/ photos after
- Customer selects **Silver** → Silver/ photos first + Apply to Both Variations/ photos after
- Shop grid card thumbnail → the single photo from Main Category Photo/
- Hover-to-play video → gold video if Gold selected, silver video if Silver selected

## Video Rules
- Gold/ has video AND Silver/ has video → use `variantVideos: { "Gold Tone": "...", "Silver Tone": "..." }`
- Only one video found → apply it to both variants
- Accepted formats: .mp4 or .mov

## Product Readiness Signal
- A product folder is **READY TO LOAD** when it contains a screenshot of the Etsy listing (PNG/JPG showing the listing title and price)
- Read the screenshot to extract: product name + EUR price
- Generate description from Etsy title keywords (2–3 sentences, human tone, mention 316L stainless steel + adjustability)

## Categories Rule
- **Only show categories that have photos/products ready**
- Remove empty categories from: CATEGORIES array in lib/products.ts, Navbar dropdown, Homepage tiles, shop filter
- Add categories back as folders are prepared by the user
- 9 defined categories: Back Chains, Body Chains, Shoulder Chains, Anklets, Eyeglasses Chains, Bracelets, Bikini Clip Chains, Belly Chains, Necklaces

## Key Files
- `lib/products.ts` — product data array + CATEGORIES const + Product type
- `app/shop/[id]/page.tsx` — product detail page
- `components/ProductCard.tsx` — shop grid card (hover video + variant swatch switching)
- `components/ProductGallery.tsx` — detail page gallery with variant selector + thumbnail strip
- `components/Navbar.tsx` — scroll-aware navbar with Shop dropdown
- `app/page.tsx` — homepage with category tiles grid
- `public/images/products/` — all product images served from here

## Tech Stack
- Next.js (App Router) — params and searchParams are Promises, must be awaited
- Tailwind CSS v4 — uses `@import "tailwindcss"` and `@theme inline {}` syntax
- TypeScript strict
- Deployed on Vercel via GitHub (BodyStrandEU/bodystrands-website)
- Stripe checkout in `/api/checkout` — secret key in `.env.local` only, never commit
