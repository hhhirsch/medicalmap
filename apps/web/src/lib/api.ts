const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchCongresses(
  params: Record<string, string | undefined>
): Promise<import("@medicalmap/shared").CongressesResponse> {
  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val) sp.set(key, val);
  }
  const res = await fetch(`${API_URL}/v1/congresses?${sp.toString()}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function requestExport(body: {
  email: string;
  filters: Record<string, unknown>;
  exportType: "csv" | "xlsx";
  consentExport: true;
  consentMarketing?: boolean;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/v1/exports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Export failed" }));
    throw new Error(err.error || "Export failed");
  }
  return res.json();
}
