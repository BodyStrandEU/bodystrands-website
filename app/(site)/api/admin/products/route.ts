import { NextRequest, NextResponse } from "next/server";
import { getFile, putFile } from "@/lib/github";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";
import type { Product } from "@/lib/products";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, must-revalidate" };

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return isValidToken(token);
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  try {
    const { content } = await getFile("data/products.json");
    const products = JSON.parse(content) as Product[];
    return NextResponse.json(products, { headers: NO_STORE_HEADERS });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await request.json() as Product[];

    // Get current sha
    const { sha } = await getFile("data/products.json");
    const content = JSON.stringify(products, null, 2) + "\n";
    await putFile("data/products.json", content, sha, "Update products via admin panel");

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
