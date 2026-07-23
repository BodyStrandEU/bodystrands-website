#!/usr/bin/env node
// Scans the full upcoming Postiz queue (all scheduled dates, not just the next few days) for
// same-product-in-a-row violations on Instagram/Facebook, and same-image-repeat violations on
// Pinterest. Exits non-zero if anything is found, so it can gate CI or trigger an alert.
//
// Usage: POSTIZ_API_KEY=... node scripts/check-social-duplicates.mjs

import { readFileSync } from "fs";

const API_KEY = process.env.POSTIZ_API_KEY;
if (!API_KEY) {
  console.error("POSTIZ_API_KEY is required");
  process.exit(2);
}

async function postiz(path) {
  const res = await fetch(`https://api.postiz.com/public/v1${path}`, {
    headers: { Authorization: API_KEY },
  });
  if (!res.ok) throw new Error(`Postiz API ${res.status}: ${await res.text()}`);
  return res.json();
}

function loadProductNames() {
  const products = JSON.parse(readFileSync(new URL("../data/products.json", import.meta.url)));
  return products.map((p) => p.name).sort((a, b) => b.length - a.length);
}

function matchProduct(content, names) {
  const lower = content.toLowerCase();
  return names.find((name) => lower.includes(name.toLowerCase())) ?? null;
}

async function main() {
  const names = loadProductNames();

  // Full known-ahead schedule window: from today through 60 days out. Always scan the FULL
  // range, not just "from today" — a partial window can look clean while a backlog sits just
  // outside it (this is exactly how the Jul 12/13 recurrence happened).
  const start = new Date();
  const end = new Date(start.getTime() + 60 * 86400000);
  const fmt = (d) => d.toISOString().slice(0, 10);

  const resp = await postiz(`/posts?startDate=${fmt(start)}&endDate=${fmt(end)}`);
  const posts = resp.posts ?? [];

  const byPlatform = { "instagram-standalone": [], facebook: [], pinterest: [] };
  for (const p of posts) {
    const platform = p.integration?.providerIdentifier;
    if (platform in byPlatform) byPlatform[platform].push(p);
  }

  let violations = [];

  // IG/FB: no two chronologically-adjacent posts on the same platform may feature the same product.
  for (const platform of ["instagram-standalone", "facebook"]) {
    const list = byPlatform[platform].slice().sort((a, b) => a.publishDate.localeCompare(b.publishDate));
    let prevProduct = null, prevDate = null, prevId = null;
    for (const p of list) {
      const product = matchProduct(p.content, names);
      if (product && product === prevProduct) {
        violations.push({
          platform, product,
          firstDate: prevDate, firstId: prevId,
          repeatDate: p.publishDate, repeatId: p.id, repeatState: p.state,
        });
      }
      prevProduct = product; prevDate = p.publishDate; prevId = p.id;
    }
  }

  // Pinterest: no two posts anywhere in the window may share the exact same content (proxy for
  // same image/campaign reuse, per the "never repeat images in the same campaign" rule).
  const seenContent = new Map();
  const pinterestSorted = byPlatform.pinterest.slice().sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  for (const p of pinterestSorted) {
    if (seenContent.has(p.content)) {
      violations.push({
        platform: "pinterest", product: "(exact content match)",
        firstDate: seenContent.get(p.content).date, firstId: seenContent.get(p.content).id,
        repeatDate: p.publishDate, repeatId: p.id, repeatState: p.state,
      });
    } else {
      seenContent.set(p.content, { date: p.publishDate, id: p.id });
    }
  }

  if (violations.length === 0) {
    console.log(`✅ No duplicate/consecutive-repeat violations found across ${posts.length} scheduled posts (${fmt(start)} to ${fmt(end)}).`);
    process.exit(0);
  }

  console.log(`❌ Found ${violations.length} violation(s):\n`);
  for (const v of violations) {
    console.log(`[${v.platform}] "${v.product}" — first at ${v.firstDate} (${v.firstId}), repeats at ${v.repeatDate} (${v.repeatId}, state=${v.repeatState})`);
  }
  console.log(JSON.stringify(violations));
  process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(2); });
