export interface D1QueryResult<T = unknown> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const D1_DATABASE_ID = process.env.CLOUDFLARE_D1_ID || "";
const CLOUDFLARE_EMAIL = process.env.CLOUDFLARE_EMAIL || "";
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY || "";

export async function queryD1<T = unknown>(sql: string, params: (string | number | boolean | null)[] = []): Promise<T[]> {
  // If running in Cloudflare Pages/Worker environment with binding
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalEnv = (globalThis as any).process?.env || (globalThis as any);
  if (globalEnv.DB && typeof globalEnv.DB.prepare === "function") {
    const stmt = globalEnv.DB.prepare(sql).bind(...params);
    const { results } = await stmt.all();
    return (results || []) as T[];
  }

  // Otherwise fallback to Cloudflare D1 REST API
  // Replace positional params with escaped values if needed or use params payload
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

  if (!res.ok) {
    const errText = await res.text();
    console.error("Cloudflare D1 Query Failed:", res.status, errText);
    throw new Error(`D1 Query Error: ${res.statusText}`);
  }

  const json = await res.json();
  if (!json.success || !json.result || !json.result[0]) {
    throw new Error(json.errors?.[0]?.message || "Cloudflare D1 execution failed");
  }

  return (json.result[0].results || []) as T[];
}
