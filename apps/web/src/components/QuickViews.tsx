"use client";

interface Props {
  setParams: (updates: Record<string, string | undefined>, resetPage?: boolean) => void;
}

const QUICK_VIEWS = [
  {
    label: "Oncology Tier 1",
    params: { ind: "Oncology", tier: "1", region: undefined, country: undefined, month: undefined, q: undefined },
  },
  {
    label: "DACH National",
    params: { region: "EU", country: "Germany,Austria,Switzerland", ind: undefined, tier: undefined, month: undefined, q: undefined },
  },
  {
    label: "Hematology",
    params: { ind: "Hematology", tier: undefined, region: undefined, country: undefined, month: undefined, q: undefined },
  },
  {
    label: "All",
    params: { ind: undefined, tier: undefined, region: undefined, country: undefined, month: undefined, q: undefined, sort: undefined, dir: undefined },
  },
];

export function QuickViews({ setParams }: Props) {
  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      {QUICK_VIEWS.map((qv) => (
        <button
          key={qv.label}
          onClick={() => setParams(qv.params)}
          className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          {qv.label}
        </button>
      ))}
    </div>
  );
}
