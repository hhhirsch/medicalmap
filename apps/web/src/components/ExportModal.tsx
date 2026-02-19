"use client";

import { useState } from "react";
import { requestExport } from "@/lib/api";

interface Props {
  filters: {
    q: string | null;
    ind: string[];
    tier: string[];
    region: string[];
    country: string[];
    month: string[];
    sort: string;
    dir: string;
  };
  onClose: () => void;
}

export function ExportModal({ filters, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [exportType, setExportType] = useState<"csv" | "xlsx">("csv");
  const [consentExport, setConsentExport] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentExport) return;

    setStatus("loading");
    try {
      await requestExport({
        email,
        filters: {
          q: filters.q || null,
          ind: filters.ind,
          tier: filters.tier,
          region: filters.region,
          country: filters.country,
          month: filters.month,
          sort: filters.sort,
          dir: filters.dir,
        },
        exportType,
        consentExport: true,
        consentMarketing,
      });
      setStatus("success");
    } catch (err) {
      setErrorMsg((err as Error).message || "Export failed");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "success" ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">✉️</div>
            <h2 className="text-lg font-semibold mb-2">Export Requested!</h2>
            <p className="text-gray-600 text-sm">
              Your export will be delivered to your email shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold mb-4">Export Congress Data</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={exportType === "csv"}
                    onChange={() => setExportType("csv")}
                  />
                  CSV
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={exportType === "xlsx"}
                    onChange={() => setExportType("xlsx")}
                  />
                  XLSX
                </label>
              </div>
            </div>

            {/* Honeypot - hidden from users */}
            <div className="hidden" aria-hidden="true">
              <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="space-y-2 mb-4">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={consentExport}
                  onChange={(e) => setConsentExport(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300"
                  required
                />
                <span>I want to receive the export by email <span className="text-red-500">*</span></span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300"
                />
                <span className="text-gray-600">
                  I&apos;d like to receive updates about new congresses and features
                </span>
              </label>
            </div>

            {status === "error" && (
              <p className="text-red-600 text-sm mb-3">{errorMsg}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "loading" || !consentExport}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Sending…" : "Send Export"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
