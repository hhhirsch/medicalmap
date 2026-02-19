export function parseCommaList(val: string | string[] | undefined | null): string[] {
  if (!val) return [];
  const raw = Array.isArray(val) ? val.join(",") : val;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parsePageParam(val: string | undefined | null, fallback: number): number {
  if (!val) return fallback;
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function parseQueryParams(params: Record<string, string | string[] | undefined>) {
  return {
    q: (typeof params.q === "string" ? params.q.trim() : "") || null,
    ind: parseCommaList(params.ind),
    tier: parseCommaList(params.tier),
    region: parseCommaList(params.region),
    country: parseCommaList(params.country),
    month: parseCommaList(params.month),
    sort: (typeof params.sort === "string" ? params.sort : "name") as string,
    dir: (typeof params.dir === "string" ? params.dir : "asc") as string,
    page: parsePageParam(typeof params.page === "string" ? params.page : undefined, 1),
    pageSize: parsePageParam(typeof params.pageSize === "string" ? params.pageSize : undefined, 25),
  };
}
