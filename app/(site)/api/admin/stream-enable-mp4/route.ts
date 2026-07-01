import { NextRequest, NextResponse } from "next/server";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return !!token && isValidToken(token);
}

// POST: enables MP4 download for a Cloudflare Stream video after it has been uploaded
// Called by the VideoDropZone immediately after a successful direct upload
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token   = process.env.CF_STREAM_TOKEN;
  const account = process.env.CF_ACCOUNT_ID;
  if (!token || !account) {
    return NextResponse.json({ error: "Cloudflare Stream not configured" }, { status: 500 });
  }

  const { uid } = await request.json() as { uid: string };
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/stream/${uid}/downloads`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await res.json() as { success: boolean; errors?: unknown[] };
  if (!data.success) {
    return NextResponse.json({ error: "Failed to enable MP4", details: data.errors }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
