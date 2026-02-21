function getApiUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";

  if (!url.startsWith("http")) {
    throw new Error(
      `Invalid NEXT_PUBLIC_API_BASE_URL: "${url}". Must be an absolute https://... URL`
    );
  }
  return url.replace(/\/$/, "");
}

export async function fetchCongresses(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) if (val) sp.set(key, val);
  if (!sp.get("page")) sp.set("page", "1");
  if (!sp.get("pageSize")) sp.set("pageSize", "25");

  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/v1/congresses?${sp.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status} ${await res.text().catch(() => "")}`);
  return res.json();
}

export async function requestExport(body: any) {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/v1/exports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => "Export failed"));
  return res.json();
}