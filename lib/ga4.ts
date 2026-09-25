// Minimal GA4 Data API client for the Cloudflare Workers runtime.
//
// @google-analytics/data talks gRPC (via @grpc/grpc-js), which needs Node's
// net/http2 sockets — unavailable on Workers, so it failed silently after the
// Sep 2026 move off Vercel. This uses the REST endpoint over fetch instead, and
// signs the service-account JWT with Web Crypto, both native to Workers.

type ServiceAccount = { client_email: string; private_key: string };

export type ReportRow = {
  dimensionValues?: { value?: string }[];
  metricValues?: { value?: string }[];
};
export type Report = { rows?: ReportRow[] };

const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

const base64url = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const encodeJson = (obj: unknown) => base64url(new TextEncoder().encode(JSON.stringify(obj)));

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const der = Uint8Array.from(
    atob(pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "").replace(/\s+/g, "")),
    (c) => c.charCodeAt(0),
  );
  return crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encodeJson({ alg: "RS256", typ: "JWT" })}.${encodeJson({
    iss: sa.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600,
  })}`;
  const key = await importPrivateKey(sa.private_key);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${base64url(signature)}`,
    }),
  });
  if (!res.ok) throw new Error(`GA4 token exchange failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Returns a runReport function bound to one property and one access token. */
export async function ga4Client(propertyId: string, credJson: string) {
  const token = await getAccessToken(JSON.parse(credJson) as ServiceAccount);
  return async function runReport(body: Record<string, unknown>): Promise<Report> {
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`GA4 runReport failed: ${res.status} ${await res.text()}`);
    return (await res.json()) as Report;
  };
}
