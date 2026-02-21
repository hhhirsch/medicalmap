"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Congress = {
  id: string;
  name: string;
  pillar?: string;
  indication?: string;
  tier: number;
  region?: string;
  scope?: string;
  country?: string | null;
  city?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  typical_month?: number | null;
  website_url: string;
  tags?: string[] | null;
  score?: number | null;
};

type ApiResponse = {
  items: Congress[];
  total: number;
  page: number;
  pageSize: number;
  facets?: any;
};

function buildQuery(params: URLSearchParams) {
  // pass through supported params
  const allowed = ["q","ind","tier","region","country","month","sort","dir","page","pageSize"];
  const out = new URLSearchParams();
  for (const k of allowed) {
    const v = params.get(k);
    if (v) out.set(k, v);
  }
  if (!out.get("page")) out.set("page", "1");
  if (!out.get("pageSize")) out.set("pageSize", "50");
  return out.toString();
}

export default function CongressDirectoryClient() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const queryString = useMemo(() => buildQuery(searchParams), [searchParams]);

  useEffect(() => {
    if (!apiBase) {
      setError("Missing NEXT_PUBLIC_API_BASE_URL");
      return;
    }
    const url = `${apiBase.replace(/\/$/, "")}/v1/congresses?${queryString}`;

    let cancelled = false;
    (async () => {
      setError(null);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text || res.statusText}`);
      }
      const json = (await res.json()) as ApiResponse;
      if (!cancelled) setData(json);
    })().catch((e: any) => {
      if (!cancelled) setError(e?.message ?? "Fetch failed");
    });

    return () => { cancelled = true; };
  }, [apiBase, queryString]);

  if (error) return <div style={{ padding: 24 }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 24 }}>Loading…</div>;

  // TODO: replace this simple render with your existing styled components/cards
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <strong>{data.total}</strong> results
      </div>
      <ul>
        {data.items.map((c) => (
          <li key={c.id}>
            <a href={c.website_url} target="_blank" rel="noreferrer">
              {c.name}
            </a>{" "}
            (Tier {c.tier})
          </li>
        ))}
      </ul>
    </div>
  );
}
