// Review-request email HTML, shared by scripts/send-review-requests.mjs (the daily send) and
// any one-off preview. Besides the review button it shows the piece they bought, its "Complete
// the set" partners (same sets as the product page, lib/productSets.ts) and more pieces from the
// same category — all in the metal colour they ordered.
//
// Table layout + inline styles because Outlook and Gmail ignore most modern CSS. Tile photos
// are cropped to the same 4:5 shape here (sharp, centred on the jewelry) and embedded in the
// email, since the site's photos mix square and portrait and email apps can't crop.

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFile } from "fs/promises";
import { createJiti } from "jiti";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });
const { products } = await jiti.import(join(ROOT, "lib/products.ts"));
const { getSetFor, canShowIn, imageIn, defaultTone, toneOfLabel } = await jiti.import(join(ROOT, "lib/productSets.ts"));
const { getSalePrice } = await jiti.import(join(ROOT, "lib/pricing.ts"));

const SITE = "https://www.bodystrands.com";
const UTM = "utm_source=review_email&utm_medium=email&utm_campaign=review_request";
const live = (p) => p && p.active !== false;

// Resized through the site's image optimizer: a 640px photo is ~200 KB instead of the ~2 MB original
function img(src, width) {
  if (!src) return "";
  if (/^https?:/.test(src)) return src;
  return `${SITE}/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}
const productUrl = (p) => `${SITE}/shop/${p.id}?${UTM}`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const euro = (n) => `€${Number.isInteger(n) ? n : n.toFixed(2)}`;

function priceHtml(p) {
  const sale = getSalePrice(p);
  return sale !== null
    ? `<span style="color:#A0622A;">${euro(sale)}</span> <span style="color:#8C7B6E;text-decoration:line-through;">${euro(p.price)}</span>`
    : `<span style="color:#2C2220;">${euro(p.price)}</span>`;
}

// Tile photos waiting to be cropped for the email being built (emails are built one at a time)
let thumbs = [];
function thumb(src) {
  const cid = `tile${thumbs.length}`;
  thumbs.push({ src, cid });
  return `cid:${cid}`;
}

// 2× the 214px tile, 4:5 portrait; "attention" keeps the most detailed part (the jewelry) in frame
async function cropTile(src) {
  const input = /^https?:/.test(src)
    ? Buffer.from(await (await fetch(src)).arrayBuffer())
    : await readFile(join(ROOT, "public", src));
  return sharp(input).resize(428, 535, { fit: "cover", position: "attention" }).jpeg({ quality: 78 }).toBuffer();
}

// One product tile; two of these sit side by side per row
function tile(p, tone, withPrice = true) {
  return `
    <td width="50%" valign="top" style="padding:0 6px 22px;">
      <a href="${productUrl(p)}" style="text-decoration:none;color:#2C2220;">
        <img src="${thumb(imageIn(p, tone))}" width="214" alt="${esc(p.name)}"
             style="display:block;width:100%;max-width:214px;height:auto;border:0;background:#F3ECE8;margin:0 auto 10px;" />
        <span style="display:block;font-size:13px;line-height:1.4;color:#2C2220;text-align:center;">${esc(p.name)}</span>
        ${withPrice ? `<span style="display:block;font-size:12px;line-height:1.6;text-align:center;">${priceHtml(p)}</span>` : ""}
      </a>
    </td>`;
}

// Two tiles per row; each entry is [product, metal colour, show price?]. A lone piece sits centred.
function gridOf(entries) {
  if (entries.length === 1) {
    const [p, tone, withPrice] = entries[0];
    return `<table role="presentation" width="50%" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>${tile(p, tone, withPrice).replace('width="50%"', 'width="100%"')}</tr></table>`;
  }
  const rows = [];
  for (let i = 0; i < entries.length; i += 2) {
    const pair = entries.slice(i, i + 2);
    rows.push(`<tr>${pair.map(([p, tone, withPrice]) => tile(p, tone, withPrice)).join("")}${pair.length === 1 ? '<td width="50%"></td>' : ""}</tr>`);
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.join("")}</table>`;
}
const grid = (list, tone) => gridOf(list.map((p) => [p, tone]));

function sectionTitle(eyebrow, title, note) {
  return `
    <p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#A0622A;text-align:center;margin:40px 0 8px;">${eyebrow}</p>
    <p style="font-size:22px;line-height:1.3;color:#2C2220;text-align:center;margin:0 0 ${note ? "8px" : "22px"};">${title}</p>
    ${note ? `<p style="font-size:13px;line-height:1.7;color:#8C7B6E;text-align:center;margin:0 0 22px;">${note}</p>` : ""}`;
}

// "Shoulder Chains" → "shoulder chain", "Anklets" → "anklet"
const singular = (category) => category.toLowerCase().replace(/s$/, "");

// The order's pieces from the Stripe metadata name: one "Name — Variant", or a cart's
// names joined with ", " (no product name contains a comma)
function parseItems(productName, product) {
  return productName.split(", ").map((label, i) => {
    const [name, variant] = label.split(" — ");
    const p = (i === 0 && product) || products.find((x) => x.name === name) || products.find((x) => label.startsWith(x.name));
    return { product: live(p) ? p : null, tone: toneOfLabel(variant) ?? (p ? defaultTone(p) : "gold") };
  });
}

// Five tappable stars — each opens the review page with that rating already picked
function starRow(reviewUrl) {
  const join = reviewUrl.includes("?") ? "&" : "?";
  const stars = [1, 2, 3, 4, 5].map((n) =>
    `<a href="${reviewUrl}${join}rating=${n}" aria-label="${n} star${n > 1 ? "s" : ""}" style="text-decoration:none;color:#A0622A;font-size:34px;line-height:1;padding:0 5px;">&#9733;</a>`
  ).join("");
  return `
    <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8C7B6E;text-align:center;margin:0 0 10px;">Tap a star to rate it</p>
    <p style="text-align:center;margin:0 0 28px;">${stars}</p>`;
}

/**
 * @param {{ firstName: string, productName: string, product?: object, reviewUrl: string }} o
 * productName is the Stripe metadata name, e.g. "Shoulder Drape Necklace — Gold Tone" (or several
 * joined with ", " for a cart order); the part after the dash picks the metal colour of the photos.
 * @returns {Promise<{ html: string, attachments: object[] }>} pass both to resend.emails.send
 */
export async function buildReviewEmail(o) {
  thumbs = [];
  let html = emailHtml(o);
  const attachments = [];
  for (const { src, cid } of thumbs) {
    try {
      attachments.push({ filename: `${cid}.jpg`, content: await cropTile(src), contentId: cid });
    } catch (e) {
      // Uncropped photo from the site rather than a broken image
      console.warn(`Could not crop ${src}: ${e.message}`);
      html = html.replace(`cid:${cid}"`, `${img(src, 384)}"`);
    }
  }
  return { html, attachments };
}

function emailHtml({ firstName, productName, product, reviewUrl }) {
  const items = parseItems(productName, product);
  const found = items.filter((i) => i.product);
  const multi = items.length > 1;
  const bought = found[0]?.product ?? null;
  const tone = found[0]?.tone ?? "gold";
  const boughtIds = new Set(found.map((i) => i.product.id));

  // Complete the set: the other pieces of its set, only those that come in the same metal
  const set = bought ? getSetFor(bought.id) : undefined;
  const setPieces = (set?.productIds ?? [])
    .filter((id) => !boughtIds.has(id))
    .map((id) => products.find((p) => p.id === id))
    .filter((p) => live(p) && canShowIn(p, tone));

  // More from the same category, skipping what's already shown; featured pieces first
  const shown = new Set([...boughtIds, ...setPieces.map((p) => p.id)]);
  const more = bought
    ? products
        .filter((p) => live(p) && p.category === bought.category && !shown.has(p.id) && canShowIn(p, tone))
        .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
        .slice(0, 4)
    : [];

  // One piece: a big photo. Several: a grid of everything they bought, each in its own metal.
  const hero = found.length > 1
    ? `<div style="margin:0 0 6px;">${gridOf(found.slice(0, 4).map((it) => [it.product, it.tone, false]))}</div>`
    : bought
    ? `<a href="${productUrl(bought)}" style="display:block;text-decoration:none;margin:0 0 28px;">
         <img src="${img(imageIn(bought, tone), 640)}" width="440" alt="${esc(bought.name)}"
              style="display:block;width:100%;max-width:440px;height:auto;border:0;background:#F3ECE8;margin:0 auto;" />
       </a>`
    : "";

  const setBlock = setPieces.length
    ? sectionTitle("Complete the set", set.id.startsWith("pair-") ? "Made to wear together" : esc(set.name), esc(set.why) + ".") + grid(setPieces, tone)
    : "";

  const moreBlock = more.length
    ? sectionTitle("You might also love", `More ${esc(bought.category.toLowerCase())}`) + grid(more, tone)
      + `<p style="text-align:center;margin:4px 0 0;"><a href="${SITE}/shop?category=${encodeURIComponent(bought.category)}&${UTM}" style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#A0622A;">See them all</a></p>`
    : "";

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;">
    <tr><td align="center" style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#FDF9F7;">
        <tr><td style="padding:48px 28px 40px;font-family:Georgia,serif;color:#2C2220;">
          <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#A0622A;text-align:center;margin:0 0 32px;">Bodystrands</p>
          <h1 style="font-weight:300;font-size:28px;margin:0 0 24px;line-height:1.3;text-align:center;">How's it looking, ${esc(firstName)}?</h1>
          ${hero}
          <p style="font-size:14px;color:#8C7B6E;margin:0 0 32px;line-height:1.9;text-align:center;">
            ${multi
              ? "We'd love to know what you think of your new Bodystrands pieces. Got a photo wearing them? Even better — it helps other shoppers picture them in real life."
              : `We'd love to know what you think of your new ${bought ? esc(singular(bought.category)) : "piece"}. Got a photo wearing it? Even better — it helps other shoppers picture it in real life.`}
          </p>
          ${starRow(reviewUrl)}
          <a href="${reviewUrl}"
             style="display:block;background:#2C2220;color:#FDF9F7;text-align:center;padding:16px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;">
            Write Your Review
          </a>
          ${setBlock}
          ${moreBlock}
          <p style="font-size:11px;color:#8C7B6E;margin:40px 0 0;padding-top:24px;border-top:1px solid #E8B4A8;line-height:1.8;text-align:center;">
            Handmade by El &amp; Gio · Questions? Reach us at <a href="mailto:info@bodystrands.com" style="color:#A0622A;">info@bodystrands.com</a>
          </p>
          <!-- Unique per email: Gmail folds content it has seen in an earlier email behind "•••" -->
          <span style="display:none;font-size:0;line-height:0;max-height:0;overflow:hidden;color:transparent;">${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}</span>
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}
