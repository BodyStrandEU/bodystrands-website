import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { name, email, message } = await request.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "Bodystrands Contact <onboarding@resend.dev>",
    to:   "storenavaria@gmail.com",
    replyTo: email,
    subject: `New message from ${name}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C2220;">
        <h2 style="font-weight:300;letter-spacing:0.05em;border-bottom:1px solid #E8B4A8;padding-bottom:12px;">
          New Contact Message
        </h2>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr>
            <td style="padding:8px 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8C7B6E;width:80px;">Name</td>
            <td style="padding:8px 0;font-size:14px;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8C7B6E;">Email</td>
            <td style="padding:8px 0;font-size:14px;"><a href="mailto:${email}" style="color:#A0622A;">${email}</a></td>
          </tr>
        </table>
        <div style="background:#FDF9F7;padding:20px;margin-top:8px;">
          <p style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8C7B6E;margin:0 0 10px;">Message</p>
          <p style="font-size:14px;line-height:1.8;margin:0;white-space:pre-wrap;">${message}</p>
        </div>
        <p style="font-size:11px;color:#8C7B6E;margin-top:24px;">
          Hit reply to respond directly to ${name}.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
