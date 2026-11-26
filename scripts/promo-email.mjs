// One-time storewide-sale email (Black Friday weekend 2026).
//   node scripts/promo-email.mjs test <address>     send a [TEST] copy through Resend
//   node scripts/promo-email.mjs preview            write the HTML to the scratch path given by PREVIEW_OUT
// Reads RESEND_API_KEY from .env.local. The live broadcast is created separately, only after approval.
import fs from "node:fs";

export const SUBJECT = "25% off everything this weekend";
export const PREHEADER = "Black Friday at Bodystrands: the whole store, until Sunday midnight.";
const LINK = "https://www.bodystrands.com/sales?utm_source=email&utm_medium=email&utm_campaign=black-friday-2026";
const LOGO = "https://www.bodystrands.com/images/logo.png";
const ICON_IG = "https://www.bodystrands.com/images/email/icon-instagram.png";
const ICON_FB = "https://www.bodystrands.com/images/email/icon-facebook.png";
const IG = "https://www.instagram.com/bodystrands/";
const FB = "https://www.facebook.com/profile.php?id=61595265520885";
const HERO = "https://www.bodystrands.com/images/hero-shoulder-chain.jpg";

// unsubscribeUrl: Resend broadcasts fill {{{RESEND_UNSUBSCRIBE_URL}}} per contact.
export function buildHtml(unsubscribeUrl = "{{{RESEND_UNSUBSCRIBE_URL}}}", variant = "text") {
  const top = variant === "logo"
    ? `<tr><td align="center" style="padding:34px 24px 26px;"><a href="https://www.bodystrands.com"><img src="${LOGO}" width="230" alt="Bodystrands" style="display:block;width:230px;max-width:70%;height:auto;border:0;"></a></td></tr>`
    : `<tr><td align="center" style="padding:34px 24px 26px;font-family:Georgia,'Times New Roman',serif;font-size:15px;letter-spacing:0.38em;text-transform:uppercase;color:#2C2220;">Bodystrands</td></tr>`;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${SUBJECT}</title>
<style>
  @media (max-width:520px){ .pad{padding-left:24px!important;padding-right:24px!important} .h1{font-size:30px!important} }
</style></head>
<body style="margin:0;padding:0;background:#FDF9F7;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#FDF9F7;">${PREHEADER}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDF9F7;">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
    ${top}
    <tr><td><a href="${LINK}"><img src="${HERO}" width="600" alt="A shoulder chain worn with a white dress" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a></td></tr>
    <tr><td class="pad" align="center" style="padding:48px 56px 12px;font-family:Georgia,'Times New Roman',serif;color:#2C2220;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#A0622A;margin:0 0 18px;">Black Friday weekend</div>
      <h1 class="h1" style="margin:0 0 20px;font-weight:300;font-size:38px;line-height:1.15;letter-spacing:0.02em;color:#2C2220;">25% off everything</h1>
      <p style="margin:0 0 14px;font-size:16px;line-height:1.8;color:#6f5f54;">For this weekend only, the whole store is 25% off. Every piece, every size.</p>
      <p style="margin:0;font-size:16px;line-height:1.8;color:#6f5f54;">No code needed. The new price is already on the site and in your cart. It ends Sunday at midnight.</p>
    </td></tr>
    <tr><td align="center" style="padding:30px 24px 52px;">
      <a href="${LINK}" style="display:inline-block;background:#2C2220;color:#FDF9F7;padding:16px 46px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.26em;text-transform:uppercase;text-decoration:none;">Shop now</a>
    </td></tr>
    <tr><td class="pad" align="center" style="padding:0 56px 44px;font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.8;color:#8C7B6E;border-top:1px solid #efe3dd;">
      <p style="margin:34px 0 0;">Handmade in Portugal by El &amp; Gio.<br>Ships in 1&ndash;2 days.</p>
    </td></tr>
    <tr><td align="center" style="padding:0 24px 26px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#8C7B6E;">
      <div style="margin:0 0 10px;">Follow along</div>
      <a href="${IG}" style="text-decoration:none;color:#A0622A;"><img src="${ICON_IG}" width="22" height="22" alt="" style="display:inline-block;vertical-align:middle;border:0;width:22px;height:22px;"><span style="display:inline-block;vertical-align:middle;margin-left:8px;letter-spacing:0.14em;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Instagram</span></a>
      <span style="color:#d9c9bf;">&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <a href="${FB}" style="text-decoration:none;color:#A0622A;"><img src="${ICON_FB}" width="22" height="22" alt="" style="display:inline-block;vertical-align:middle;border:0;width:22px;height:22px;"><span style="display:inline-block;vertical-align:middle;margin-left:8px;letter-spacing:0.14em;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Facebook</span></a>
    </td></tr>
    <tr><td class="pad" align="center" style="padding:0 40px 40px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:#a39489;">
      You are receiving this because you subscribed or ordered at bodystrands.com.<br>
      <a href="${unsubscribeUrl}" style="color:#a39489;text-decoration:underline;">Unsubscribe</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

function env() {
  const m = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8").match(/^RESEND_API_KEY=(.*)$/m);
  if (!m) throw new Error("RESEND_API_KEY missing in .env.local");
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "preview") {
  fs.writeFileSync(process.env.PREVIEW_OUT || "promo-preview.html", buildHtml("#"));
  console.log("wrote preview");
} else if (cmd === "test") {
  if (!arg) throw new Error("usage: test <address>");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Bodystrands <info@bodystrands.com>", to: arg, subject: `[TEST] ${SUBJECT}`, html: buildHtml("#") }),
  });
  console.log(res.status, await res.text());
}
