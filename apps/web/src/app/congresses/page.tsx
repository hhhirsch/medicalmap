"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { type CongressesResponse, type CongressRow, parseQueryParams } from "@medicalmap/shared";
import { Toolbar } from "@/components/Toolbar";
import { CongressList } from "@/components/CongressList";
import { ExportModal } from "@/components/ExportModal";
import { CongressDrawer } from "@/components/CongressDrawer";
import { Pagination } from "@/components/Pagination";
import { Hero } from "@/components/Hero";
import { GateSection } from "@/components/GateSection";
import { fetchCongresses } from "@/lib/api";

function deriveActiveChip(params: Record<string, string>): string {
  if (params.tier === "1" && !params.ind && !params.country) return "tier:1";
  if (params.ind === "Oncology" && !params.tier && !params.country) return "ind:Oncology";
  if (params.ind === "Hematology" && !params.tier && !params.country) return "ind:Hematology";
  if (params.country === "DE,AT,CH" && !params.ind && !params.tier) return "country:DE,AT,CH";
  if (!params.ind && !params.tier && !params.country && !params.q) return "all";
  return "";
}

function CongressesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<CongressesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [drawerCongress, setDrawerCongress] = useState<CongressRow | null>(null);

  const params = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((val, key) => { obj[key] = val; });
    return obj;
  }, [searchParams]);

  const currentFilters = useMemo(() => parseQueryParams(params), [params]);

  const setParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = true) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val === undefined || val === "" || val === null) sp.delete(key);
        else sp.set(key, val);
      }
      if (resetPage && !("page" in updates)) sp.delete("page");
      router.push(`/congresses?${sp.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCongresses(params)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { console.error("Fetch error:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params]);

  const activeChip = deriveActiveChip(params);

  const handleChipClick = useCallback(
    (key: string, value: string | null) => {
      if (key === "all" || value === null) {
        setParams({ ind: undefined, tier: undefined, country: undefined, region: undefined, q: undefined });
      } else if (key === "ind") {
        setParams({ ind: value, tier: undefined, country: undefined });
      } else if (key === "country") {
        setParams({ country: value, ind: undefined, tier: undefined });
      } else if (key === "tier") {
        setParams({ tier: value, ind: undefined, country: undefined });
      }
    },
    [setParams]
  );

  // Debounced search
  const [searchLocal, setSearchLocal] = useState(params.q || "");
  useEffect(() => { setSearchLocal(params.q || ""); }, [params.q]);
  useEffect(() => {
    const t = setTimeout(() => {
      setParams({ q: searchLocal || undefined });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchLocal]);

  return (
    <>
      <Hero totalCount={data?.total} onExport={() => setExportOpen(true)} />

      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 2.5rem 80px" }}>
        <Toolbar
          searchValue={searchLocal}
          onSearchChange={setSearchLocal}
          activeChip={activeChip}
          onChipClick={handleChipClick}
          onExport={() => setExportOpen(true)}
        />

        {/* Results meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
            padding: "0 2px",
            animation: "fadeUp 0.4s 0.15s ease both",
            animationFillMode: "forwards",
            opacity: 0,
          }}
        >
          <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
            {loading && !data ? (
              "Lade…"
            ) : data ? (
              <>
                <strong style={{ color: "var(--text-dim)", fontWeight: 500 }}>{data.total}</strong> Kongresse gefunden
                {data.total > currentFilters.pageSize && (
                  <> · {Math.min(data.items.length, currentFilters.pageSize)} angezeigt</>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* List */}
        {loading && !data ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            Lade Kongresse…
          </div>
        ) : data ? (
          <>
            <CongressList
              items={data.items}
              loading={loading}
              onDetails={setDrawerCongress}
            />
            <Pagination
              page={currentFilters.page}
              pageSize={currentFilters.pageSize}
              total={data.total}
              onPageChange={(p) => setParams({ page: String(p) }, false)}
            />
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            Keine Daten
          </div>
        )}

        <GateSection onExport={() => setExportOpen(true)} />
      </div>

      {exportOpen && (
        <ExportModal filters={currentFilters} onClose={() => setExportOpen(false)} />
      )}

      {drawerCongress && (
        <CongressDrawer congress={drawerCongress} onClose={() => setDrawerCongress(null)} />
      )}
    </>
  );
}

export default function CongressesPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>Lade…</div>}>
      <CongressesContent />
    </Suspense>
  );
}
