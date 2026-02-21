function getApiUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  if (!url) {
    // Make failure explicit (helps debugging)
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Set it in Vercel (Production) and redeploy."
    );
  }
  return url.replace(/\/$/, "");
}

export async function fetchCongresses(
  params: Record<string, string | undefined>
): Promise<import("@medicalmap/shared").CongressesResponse> {
  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val) sp.set(key, val);
  }

  // defaults to avoid empty queries
  if (!sp.get("page")) sp.set("page", "1");
  if (!sp.get("pageSize")) sp.set("pageSize", "25");

  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/v1/congresses?${sp.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export async function requestExport(body: {
  email: string;
  filters: Record<string, unknown>;
  exportType: "csv" | "xlsx";
  consentExport: true;
  consentMarketing?: boolean;
}): Promise<{ success: boolean; message: string }> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/v1/exports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Export failed");
  }
  return res.json();
}
