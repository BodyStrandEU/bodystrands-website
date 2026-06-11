import { createHmac } from "crypto";

const COOKIE_NAME = "admin_token";
const SECRET = process.env.ADMIN_PASSWORD ?? "changeme";

export function computeToken(password: string): string {
  return createHmac("sha256", SECRET).update(password).digest("hex");
}

export function isValidToken(token: string): boolean {
  const expected = computeToken(SECRET);
  // Constant-time comparison
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export { COOKIE_NAME };
