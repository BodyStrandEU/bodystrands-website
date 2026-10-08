// Site-wide media shared across product pages.

// General "how we make it" process video (15 s, silent, captions burned in), shown in every product gallery (Oct 7, 2026,
// user request): right after the product's own model video, or as the product's video
// when it has none of its own. Product pages only — not the shop grid cards, where an
// extra video per card would slow the shop page down on phones.
// Hosted on Cloudflare Stream like the product videos. Empty string = feature off.
export const PROCESS_VIDEO = "https://customer-1wo257ph6r7pq9d6.cloudflarestream.com/57bc6cd8307a9a5056dbc58f464ec5cc/downloads/default.mp4";

// Packaging photos added to the END of every product gallery (Oct 8, 2026, user request):
// signature boxes, unboxing with the thank-you card (plain chain — fits any product), gift wrap.
// Product pages only, like the process video.
export const PACKAGING_IMAGES = [
  "/images/site/packaging-boxes.jpg",
  "/images/site/packaging-unboxing.jpg",
  "/images/site/packaging-gift-wrap.jpg",
];
