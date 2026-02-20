"use client";

import { type Facets } from "@medicalmap/shared";
import { MONTH_NAMES_SHORT } from "@/lib/utils";

interface Props {
  facets: Facets | null;
  currentFilters: {
    ind: string[];
    tier: string[];
    region: string[];
    country: string[];
    month: string[];
  };
  toggleFilter: (key: string, value: string) => void;
}

function FilterSection({
  title,
  items,
  selected,
  filterKey,
  toggleFilter,
  formatLabel,
}: {
  title: string;
  items: { value: string; count: number }[];
  selected: string[];
  filterKey: string;
  toggleFilter: (key: string, value: string) => void;
  formatLabel?: (value: string) => string;
}) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {items.map((item) => (
          <label
            key={item.value}
            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
          >
            <input
              type="checkbox"
              checked={selected.includes(item.value)}
              onChange={() => toggleFilter(filterKey, item.value)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="flex-1 truncate">
              {formatLabel ? formatLabel(item.value) : item.value}
            </span>
            <span className="text-xs text-gray-400">{item.count}</span>
          </label>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gray-400 px-1">No options</p>
        )}
      </div>
    </div>
  );
}

export function SidebarFilters({ facets, currentFilters, toggleFilter }: Props) {
  if (!facets) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="font-semibold text-sm mb-4">Filters</h2>

      <FilterSection
        title="Indication"
        items={facets.ind}
        selected={currentFilters.ind}
        filterKey="ind"
        toggleFilter={toggleFilter}
      />

      <FilterSection
        title="Tier"
        items={facets.tier}
        selected={currentFilters.tier}
        filterKey="tier"
        toggleFilter={toggleFilter}
        formatLabel={(v) => `Tier ${v}`}
      />

      <FilterSection
        title="Region"
        items={facets.region}
        selected={currentFilters.region}
        filterKey="region"
        toggleFilter={toggleFilter}
      />

      <FilterSection
        title="Country"
        items={facets.country}
        selected={currentFilters.country}
        filterKey="country"
        toggleFilter={toggleFilter}
      />

      <FilterSection
        title="Month"
        items={facets.month}
        selected={currentFilters.month}
        filterKey="month"
        toggleFilter={toggleFilter}
        formatLabel={(v) => MONTH_NAMES_SHORT[parseInt(v, 10)] || v}
      />
    </div>
  );
}
