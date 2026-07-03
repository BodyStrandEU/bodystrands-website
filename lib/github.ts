const GITHUB_API = "https://api.github.com";
const REPO = process.env.GITHUB_REPO ?? "BodyStrandEU/bodystrands-website";
const BRANCH = "main";

function getHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN env var is not set");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export interface GitHubFileResult {
  content: string;
  sha: string;
}

export async function getFile(path: string): Promise<GitHubFileResult> {
  const url = `${GITHUB_API}/repos/${REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub getFile(${path}) failed ${res.status}: ${text}`);
  }
  const data = (await res.json()) as { content: string; sha: string };
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

function committer() {
  return {
    name: process.env.GITHUB_COMMITTER_NAME ?? "Bodystrands Admin",
    email: process.env.GITHUB_COMMITTER_EMAIL ?? "storenavaria@gmail.com",
  };
}

export async function putFile(
  path: string,
  content: string,
  sha: string | undefined,
  message: string
): Promise<void> {
  const url = `${GITHUB_API}/repos/${REPO}/contents/${path}`;
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
    branch: BRANCH,
    committer: committer(),
    author: committer(),
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub putFile(${path}) failed ${res.status}: ${text}`);
  }
}

export async function deleteFile(
  path: string,
  sha: string,
  message: string
): Promise<void> {
  const url = `${GITHUB_API}/repos/${REPO}/contents/${path}`;
  const body = { message, sha, branch: BRANCH, committer: committer(), author: committer() };
  const res = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub deleteFile(${path}) failed ${res.status}: ${text}`);
  }
}

export async function uploadImage(
  filename: string,
  base64Content: string
): Promise<string> {
  const path = `public/images/products/${filename}`;
  let sha: string | undefined;
  try {
    const existing = await getFile(path);
    sha = existing.sha;
  } catch {
    // File doesn't exist — that's fine, we'll create it
  }

  const url = `${GITHUB_API}/repos/${REPO}/contents/${path}`;
  const body: Record<string, unknown> = {
    message: `Upload product image: ${filename}`,
    content: base64Content,
    branch: BRANCH,
    committer: committer(),
    author: committer(),
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub uploadImage(${filename}) failed ${res.status}: ${text}`);
  }

  return `/images/products/${filename}`;
}
