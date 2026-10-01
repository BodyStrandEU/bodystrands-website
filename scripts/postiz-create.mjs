#!/usr/bin/env node
// Guarded `postiz posts:create`. ALWAYS schedule social posts through this script, never
// the raw CLI: it refuses Facebook posts without settings.url and Pinterest pins without
// settings.link + settings.board, then passes everything through to Postiz unchanged.
//
// Why: Postiz accepts link-less posts and still reports them PUBLISHED. A batch scheduled
// without settings went out Sep 21 – Oct 10, 2026 and took Facebook referral traffic
// (nearly all social visits) from ~25/week to zero.
//
// Usage: same flags as `postiz posts:create`, e.g.
//   node scripts/postiz-create.mjs -c "caption" -m "<media url>" -s 2026-10-12T10:00:00Z \
//     -i cmqmpm92f01uzmm0ysb6fbid0 --settings '{"post_type":"post","url":"https://www.bodystrands.com/shop/<id>"}'
import { spawnSync } from "child_process";

const FACEBOOK  = "cmqmpm92f01uzmm0ysb6fbid0";
const PINTEREST = "cmqlao2zv0efwmm0y5cq6miuu";
const SHOP_URL  = /^https:\/\/www\.bodystrands\.com\/shop\/[a-z0-9-]+$/;

const args = process.argv.slice(2);
const valueOf = (...flags) => {
  const i = args.findIndex((a) => flags.includes(a));
  return i >= 0 ? args[i + 1] : undefined;
};

const fail = (msg) => { console.error(`✋ Refusing to schedule: ${msg}`); process.exit(1); };

const integrations = (valueOf("-i", "--integrations") ?? "").split(",").filter(Boolean);
if (integrations.length === 0) fail("no integration (-i) given.");

let settings = {};
const rawSettings = valueOf("--settings");
if (rawSettings) {
  try { settings = JSON.parse(rawSettings); } catch { fail("--settings is not valid JSON."); }
}

// Settings are per-platform, so mixing Facebook/Pinterest in one call would share one settings object.
if (integrations.length > 1 && integrations.some((i) => i === FACEBOOK || i === PINTEREST)) {
  fail("schedule Facebook and Pinterest in separate calls — each needs its own settings.");
}
if (integrations.includes(FACEBOOK)) {
  if (!SHOP_URL.test(settings.url ?? "")) fail(`Facebook post needs settings.url = https://www.bodystrands.com/shop/<product-id> (got ${JSON.stringify(settings.url)}).`);
  if (settings.board) fail("Facebook settings contain a Pinterest board — wrong settings object.");
}
if (integrations.includes(PINTEREST)) {
  if (!SHOP_URL.test(settings.link ?? "")) fail(`Pinterest pin needs settings.link = https://www.bodystrands.com/shop/<product-id> (got ${JSON.stringify(settings.link)}).`);
  if (!/^\d+$/.test(String(settings.board ?? ""))) fail("Pinterest pin needs a numeric settings.board id.");
  if (!settings.title) fail("Pinterest pin needs settings.title.");
}
const caption = valueOf("-c", "--content") ?? "";
if (/etsy/i.test(caption + JSON.stringify(settings))) fail("post mentions Etsy — the shop links to bodystrands.com only.");

const result = spawnSync("postiz", ["posts:create", ...args], { stdio: "inherit" });
process.exit(result.status ?? 1);
