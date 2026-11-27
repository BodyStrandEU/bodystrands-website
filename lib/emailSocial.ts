// "Follow along" row for customer emails: Instagram + Facebook with the small gold icons.
// Icons are hosted at /images/email/ (PNG: email apps don't render SVG reliably).
const IG = "https://www.instagram.com/bodystrands/";
const FB = "https://www.facebook.com/profile.php?id=61595265520885";
const ICON = "https://www.bodystrands.com/images/email";

const link = (url: string, icon: string, label: string) =>
  `<a href="${url}" style="text-decoration:none;color:#A0622A;"><img src="${ICON}/${icon}" width="22" height="22" alt="" style="display:inline-block;vertical-align:middle;border:0;width:22px;height:22px;"><span style="display:inline-block;vertical-align:middle;margin-left:8px;letter-spacing:0.14em;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;font-size:11px;">${label}</span></a>`;

export function socialRowHtml(): string {
  return `<div style="text-align:center;margin:0 0 28px;font-family:Georgia,serif;font-size:13px;color:#8C7B6E;">
    <div style="margin:0 0 10px;">Follow along</div>
    ${link(IG, "icon-instagram.png", "Instagram")}<span style="color:#d9c9bf;">&nbsp;&nbsp;&nbsp;&nbsp;</span>${link(FB, "icon-facebook.png", "Facebook")}
  </div>`;
}
