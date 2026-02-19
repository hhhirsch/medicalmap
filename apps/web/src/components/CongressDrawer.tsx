"use client";

import { type CongressRow } from "@medicalmap/shared";
import { MONTH_NAMES_LONG } from "@/lib/utils";

interface Props {
  congress: CongressRow;
  onClose: () => void;
}

export function CongressDrawer({ congress, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white w-full max-w-lg h-full shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold pr-4">{congress.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <InfoRow label="Indication" value={congress.indication} />
            <InfoRow label="Tier" value={`Tier ${congress.tier}`} />
            <InfoRow label="Region" value={congress.region} />
            <InfoRow label="Scope" value={congress.scope} />
            <InfoRow label="Country" value={congress.country || "—"} />
            <InfoRow label="City" value={congress.city || "—"} />
            <InfoRow
              label="Dates"
              value={
                congress.start_date && congress.end_date
                  ? `${congress.start_date} – ${congress.end_date}`
                  : congress.start_date || "—"
              }
            />
            <InfoRow
              label="Typical Month"
              value={
                congress.typical_month
                  ? MONTH_NAMES_LONG[congress.typical_month] || String(congress.typical_month)
                  : "—"
              }
            />
            {congress.tags && congress.tags.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 font-medium uppercase">Tags</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {congress.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <a
            href={congress.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 block w-full text-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Visit Website →
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-500 font-medium uppercase">{label}</span>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  );
}
