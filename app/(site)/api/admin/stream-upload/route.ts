import { NextRequest, NextResponse } from "next/server";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token    = process.env.CF_STREAM_TOKEN;
  const account  = process.env.CF_ACCOUNT_ID;
  const customer = process.env.CF_CUSTOMER_SUBDOMAIN;

  if (!token || !account || !customer) {
    return NextResponse.json({ error: "Cloudflare Stream not configured" }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const cfForm = new FormData();
  cfForm.append("file", file, file.name);

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/stream`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: cfForm,
    }
  );

  const data = await res.json() as { success: boolean; result?: { uid: string }; errors?: unknown[] };

  if (!data.success || !data.result?.uid) {
    return NextResponse.json({ error: "Cloudflare upload failed", details: data.errors }, { status: 500 });
  }

  const uid = data.result.uid;
  const url = `https://${customer}.cloudflarestream.com/${uid}/downloads/default.mp4`;
  return NextResponse.json({ url });
}
