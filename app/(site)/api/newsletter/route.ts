import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const [welcome, notify] = await Promise.allSettled([
    // Welcome email to subscriber
    resend.emails.send({
      from:    "Bodystrands <hello@bodystrands.com>",
      to:      email,
      subject: "Welcome to Bodystrands ✨",
      html: `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2C2220;background:#FDF9F7;padding:48px 40px;">
          <h1 style="font-weight:300;font-size:28px;letter-spacing:0.05em;margin:0 0 8px;">Welcome to Bodystrands</h1>
          <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#A0622A;margin:0 0 32px;">Handmade in Portugal</p>

          <p style="font-size:14px;line-height:1.9;color:#8C7B6E;margin:0 0 20px;">
            Thank you for joining us. You're now the first to know about new arrivals,
            restocks, behind-the-scenes moments, and exclusive offers — straight from
            our little studio in Portugal.
          </p>

          <p style="font-size:14px;line-height:1.9;color:#8C7B6E;margin:0 0 40px;">
            We put love into every strand, and we're so glad you're here.
          </p>

          <a href="https://www.bodystrands.com/shop"
             style="display:inline-block;border:1px solid #A0622A;color:#A0622A;padding:14px 36px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;">
            Shop Now
          </a>

          <p style="font-size:11px;color:#8C7B6E;margin-top:48px;padding-top:24px;border-top:1px solid #E8B4A8;">
            You received this because you subscribed at bodystrands.com.
            You can unsubscribe at any time by replying to this email.
          </p>
        </div>
      `,
    }),

    // Notification to admin
    resend.emails.send({
      from:    "Bodystrands <hello@bodystrands.com>",
      to:      "storenavaria@gmail.com",
      subject: `New subscriber: ${email}`,
      html: `<p style="font-family:sans-serif;">New newsletter signup: <strong>${email}</strong></p>`,
    }),
  ]);

  if (welcome.status === "rejected") {
    console.error("Resend welcome error:", welcome.reason);
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
