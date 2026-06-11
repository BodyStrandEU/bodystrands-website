import { NextRequest, NextResponse } from "next/server";
import { isValidToken, COOKIE_NAME } from "@/lib/auth";

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return isValidToken(token);
}

function githubHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const targetPath = formData.get("targetPath") as string | null;

    if (!file || !targetPath) {
      return NextResponse.json({ error: "file and targetPath required" }, { status: 400 });
    }

    if (!targetPath.startsWith("images/") || targetPath.includes("..")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const REPO = process.env.GITHUB_REPO ?? "BodyStrandEU/bodystrands-website";
    const githubPath = `public/${targetPath}`;

    // Get existing sha to overwrite
    let sha: string | undefined;
    const existing = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${githubPath}?ref=main`,
      { headers: githubHeaders(), cache: "no-store" }
    );
    if (existing.ok) {
      const data = (await existing.json()) as { sha: string };
      sha = data.sha;
    }

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const body: Record<string, string> = {
      message: `Update site image: ${targetPath}`,
      content: base64,
      branch: "main",
    };
    if (sha) body.sha = sha;

    const put = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${githubPath}`,
      { method: "PUT", headers: githubHeaders(), body: JSON.stringify(body) }
    );

    if (!put.ok) throw new Error(`GitHub ${put.status}: ${await put.text()}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
