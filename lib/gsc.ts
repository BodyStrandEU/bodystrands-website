// Google Search Console (Search Analytics) client for the Workers runtime —
// same service account as GA4 (GA4_SERVICE_ACCOUNT_JSON); the account must be
// added as a user on the Search Console property and the Search Console API
// enabled in its Google Cloud project.
import { getAccessToken } from "@/lib/ga4";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const API = "https://searchconsole.googleapis.com/webmasters/v3";

export type GscRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };

export async function gscClient(credJson: string) {
  const token = await getAccessToken(credJson, SCOPE);
  const call = async (path: string, init?: RequestInit) => {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    });
    if (!res.ok) throw new Error(`Search Console ${res.status}: ${await res.text()}`);
    return res.json();
  };

  return {
    /** Properties this account can read, e.g. "sc-domain:bodystrands.com" or "https://www.bodystrands.com/". */
    async sites(): Promise<string[]> {
      const data = (await call("/sites")) as { siteEntry?: { siteUrl: string; permissionLevel: string }[] };
      return (data.siteEntry ?? []).filter((s) => s.permissionLevel !== "siteUnverifiedUser").map((s) => s.siteUrl);
    },
    async query(siteUrl: string, body: Record<string, unknown>): Promise<GscRow[]> {
      const data = (await call(`/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: "POST",
        body: JSON.stringify(body),
      })) as { rows?: GscRow[] };
      return data.rows ?? [];
    },
  };
}

/** Prefer the domain property (covers www + bare + http/https), else the www URL-prefix one. */
export function pickSite(sites: string[]): string | null {
  return sites.find((s) => s.startsWith("sc-domain:"))
    ?? sites.find((s) => s.includes("www.bodystrands.com"))
    ?? sites[0] ?? null;
}
