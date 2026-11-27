import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Resend -> us: tells the owner when someone unsubscribes (so we know if emails annoy people).
// Resend fires `contact.updated` with data.unsubscribed = true. Signed with Svix:
// HMAC-SHA256 over "<svix-id>.<svix-timestamp>.<raw body>", key = base64 part of the whsec_ secret.
// Needs the Worker secret RESEND_WEBHOOK_SECRET (re-add it after a deploy wipes secrets, see CLAUDE.md).
const resend = new Resend(process.env.RESEND_API_KEY);

const b64 = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)));

async function validSignature(body: string, req: NextRequest, secret: string): Promise<boolean> {
  const id = req.headers.get("svix-id");
  const ts = req.headers.get("svix-timestamp");
  const sigHeader = req.headers.get("svix-signature");
  if (!id || !ts || !sigHeader) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 5 * 60) return false; // replay guard
  const keyBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, "")), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = b64(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`)));
  return sigHeader.split(" ").some((s) => {
    const v = s.startsWith("v1,") ? s.slice(3) : "";
    return v.length === expected.length && v.split("").reduce((d, ch, i) => d | (ch.charCodeAt(0) ^ expected.charCodeAt(i)), 0) === 0;
  });
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(req: NextRequest) {
  const body = await req.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  if (!(await validSignature(body, req, secret))) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  let event: { type?: string; data?: { email?: string; unsubscribed?: boolean } };
  try { event = JSON.parse(body); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }

  if (event.type === "contact.updated" && event.data?.unsubscribed === true && event.data.email) {
    const email = escapeHtml(event.data.email);
    const { error } = await resend.emails.send({
      from: "Bodystrands <info@bodystrands.com>",
      to: "info@bodystrands.com",
      subject: `Unsubscribed: ${event.data.email}`,
      html: `<p style="font-family:sans-serif;"><strong>${email}</strong> just unsubscribed from Bodystrands emails.</p>`,
    });
    if (error) { console.error("Unsubscribe alert email failed:", error); return NextResponse.json({ error: "send failed" }, { status: 500 }); }
  }
  return NextResponse.json({ ok: true });
}
