"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { type CongressesResponse, type CongressRow, parseCommaList, parseQueryParams } from "@medicalmap/shared";
import { CongressTable } from "@/components/CongressTable";
import { SidebarFilters } from "@/components/SidebarFilters";
import { SearchInput } from "@/components/SearchInput";
import { QuickViews } from "@/components/QuickViews";
import { ExportModal } from "@/components/ExportModal";
import { CongressDrawer } from "@/components/CongressDrawer";
import { Pagination } from "@/components/Pagination";
import { fetchCongresses } from "@/lib/api";

function CongressesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<CongressesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [drawerCongress, setDrawerCongress] = useState<CongressRow | null>(null);

  const params = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      obj[key] = val;
    });
    return obj;
  }, [searchParams]);

  const currentFilters = useMemo(() => parseQueryParams(params), [params]);

  const setParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = true) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val === undefined || val === "" || val === null) {
          sp.delete(key);
        } else {
          sp.set(key, val);
        }
      }
      if (resetPage && !("page" in updates)) {
        sp.delete("page");
      }
      router.push(`/congresses?${sp.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCongresses(params)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const toggleFilter = useCallback(
    (key: string, value: string) => {
      const current = parseCommaList(params[key]);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setParams({ [key]: next.length > 0 ? next.join(",") : undefined });
    },
    [params, setParams]
  );

  const handleSort = useCallback(
    (col: string) => {
      const currentSort = params.sort || "name";
      const currentDir = params.dir || "asc";
      if (currentSort === col) {
        setParams({ dir: currentDir === "asc" ? "desc" : "asc" }, false);
      } else {
        setParams({ sort: col, dir: "asc" }, false);
      }
    },
    [params, setParams]
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Congress Directory</h1>
        <button
          onClick={() => setExportOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Export CSV / XLSX
        </button>
      </div>

      <SearchInput
        value={params.q || ""}
        onChange={(q) => setParams({ q: q || undefined })}
      />

      <QuickViews setParams={setParams} />

      <div className="flex gap-6 mt-4">
        <aside className="w-64 shrink-0 hidden lg:block">
          <SidebarFilters
            facets={data?.facets ?? null}
            currentFilters={currentFilters}
            toggleFilter={toggleFilter}
          />
        </aside>

        <div className="flex-1 min-w-0">
          {loading && !data ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              Loading…
            </div>
          ) : data ? (
            <>
              <div className="text-sm text-gray-500 mb-2">
                {data.total} congress{data.total !== 1 ? "es" : ""} found
              </div>
              <CongressTable
                items={data.items}
                sort={currentFilters.sort}
                dir={currentFilters.dir}
                onSort={handleSort}
                onRowClick={setDrawerCongress}
                loading={loading}
              />
              <Pagination
                page={currentFilters.page}
                pageSize={currentFilters.pageSize}
                total={data.total}
                onPageChange={(p) => setParams({ page: String(p) }, false)}
              />
            </>
          ) : (
            <div className="text-center py-20 text-gray-400">No data</div>
          )}
        </div>
      </div>

      {exportOpen && (
        <ExportModal
          filters={currentFilters}
          onClose={() => setExportOpen(false)}
        />
      )}

      {drawerCongress && (
        <CongressDrawer
          congress={drawerCongress}
          onClose={() => setDrawerCongress(null)}
        />
      )}
    </div>
  );
}

export default function CongressesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-gray-400">Loading…</div>}>
      <CongressesContent />
    </Suspense>
  );
}
