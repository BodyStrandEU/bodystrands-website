import { NextRequest, NextResponse } from "next/server";
import { getFile, putFile } from "@/lib/github";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

const FILE_PATH = "data/category-hero-positions.json";

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return isValidToken(token);
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await getFile(FILE_PATH);
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { category, x, y } = (await request.json()) as { category?: string; x?: number; y?: number };
    if (!category || typeof x !== "number" || typeof y !== "number") {
      return NextResponse.json({ error: "category, x and y are required" }, { status: 400 });
    }

    const { content, sha } = await getFile(FILE_PATH);
    const positions = JSON.parse(content) as Record<string, { x: number; y: number }>;
    positions[category] = { x: Math.round(x), y: Math.round(y) };

    await putFile(
      FILE_PATH,
      JSON.stringify(positions, null, 2) + "\n",
      sha,
      `Update category hero position: ${category}`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
