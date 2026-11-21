export interface D1QueryResult<T = unknown> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "69c23fecb9e6be7794bfc2e0c4179a34";
const D1_DATABASE_ID = process.env.CLOUDFLARE_D1_ID || "ad5adaac-8ccc-4027-9eb2-e0fd13fa55d0";
const CLOUDFLARE_EMAIL = process.env.CLOUDFLARE_EMAIL || "jeudynikenson2@gmail.com";
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY || "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNativeD1Binding(): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (g.DB && typeof g.DB.prepare === "function") return g.DB;
  if (g.process?.env?.DB && typeof g.process.env.DB.prepare === "function") return g.process.env.DB;
  if (g.__env__?.DB && typeof g.__env__.DB.prepare === "function") return g.__env__.DB;
  const sym = Symbol.for("cloudflare.env");
  if (g[sym]?.DB && typeof g[sym].DB.prepare === "function") return g[sym].DB;
  return null;
}

export async function queryD1<T = unknown>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  const db = getNativeD1Binding();
  if (db) {
    const stmt = db.prepare(sql).bind(...params);
    const { results } = await stmt.all();
    return (results || []) as T[];
  }

  // Fallback to REST API if API Key is set
  if (CLOUDFLARE_API_KEY) {
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Auth-Email": CLOUDFLARE_EMAIL,
        "X-Auth-Key": CLOUDFLARE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.result && json.result[0]) {
        return (json.result[0].results || []) as T[];
      }
    }
  }

  return [];
}
