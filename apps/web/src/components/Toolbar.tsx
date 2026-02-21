"use client";

import type { FacetCount } from "@medicalmap/shared";

interface Chip {
  label: string;
  key: string;
  value: string | null;
  color?: string;
}

/** German display labels for known indication values returned by the API. */
const IND_LABELS: Record<string, string> = {
  Oncology: "Onkologie",
  Hematology: "Hämatologie",
  Cardiology: "Kardiologie",
  Neurology: "Neurologie",
  Immunology: "Immunologie",
  Rheumatology: "Rheumatologie",
  Gastroenterology: "Gastroenterologie",
  Pulmonology: "Pulmonologie",
  Endocrinology: "Endokrinologie",
  Nephrology: "Nephrologie",
  Dermatology: "Dermatologie",
  Ophthalmology: "Ophthalmologie",
  Urology: "Urologie",
  Infectiology: "Infektiologie",
  Pediatrics: "Pädiatrie",
};

/** Rotating palette for indication chip dots (one colour per chip in order). */
const IND_COLORS = ["var(--teal)", "var(--accent)", "var(--amber)", "var(--purple)", "var(--red)"];

/** Static chips that don't depend on facet data. */
const STATIC_CHIPS: Chip[] = [
  { label: "Alle", key: "all", value: null },
  { label: "DACH", key: "country", value: "DE,AT,CH", color: "var(--amber)" },
  { label: "Tier 1", key: "tier", value: "1" },
];

interface Props {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeChip: string;
  onChipClick: (key: string, value: string | null) => void;
  onExport: () => void;
  /** Indication facets from the API – used to build dynamic filter chips. */
  indFacets?: FacetCount[];
}

export function Toolbar({ searchValue, onSearchChange, activeChip, onChipClick, onExport, indFacets }: Props) {
  /** Build indication chips from live facets, falling back to common defaults. */
  const indChips: Chip[] = (
    indFacets && indFacets.length > 0
      ? indFacets.map((f, i) => ({
          key: "ind",
          value: f.value,
          label: IND_LABELS[f.value] ?? f.value,
          color: IND_COLORS[i % IND_COLORS.length],
        }))
      : [
          { key: "ind", value: "Oncology", label: "Onkologie", color: IND_COLORS[0] },
          { key: "ind", value: "Hematology", label: "Hämatologie", color: IND_COLORS[1] },
        ]
  );

  const chips: Chip[] = [...STATIC_CHIPS, ...indChips];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        marginBottom: "16px",
        flexWrap: "wrap",
        animation: "fadeUp 0.4s 0.1s ease both",
        animationFillMode: "forwards",
        opacity: 0,
      }}
    >
      {/* Search */}
      <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
        <svg
          viewBox="0 0 16 16"
          style={{
            position: "absolute",
            left: "13px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "15px",
            height: "15px",
            stroke: "var(--text-muted)",
            fill: "none",
            strokeWidth: 2,
            strokeLinecap: "round",
          }}
        >
          <circle cx="6.5" cy="6.5" r="4.5" />
          <line x1="10" y1="10" x2="14" y2="14" />
        </svg>
        <input
          type="text"
          placeholder="Kongress suchen…"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "9px",
            padding: "9px 14px 9px 38px",
            color: "var(--text)",
            fontFamily: "inherit",
            fontSize: "13.5px",
            fontWeight: 400,
            outline: "none",
            boxShadow: "var(--shadow-sm)",
          }}
        />
      </div>

      {/* Chips – scrollable on narrow mobile so none get clipped */}
      <div
        style={{ display: "flex", gap: "5px", flexWrap: "wrap", flex: "1 1 0", minWidth: 0 }}
        className="toolbar-chips"
      >
        {chips.map((chip) => {
          const chipId = chip.key === "all" ? "all" : `${chip.key}:${chip.value}`;
          const isActive = activeChip === chipId;
          return (
            <button
              key={chipId}
              onClick={() => onChipClick(chip.key, chip.value)}
              style={{
                background: isActive ? "var(--accent-soft)" : "var(--surface)",
                border: `1px solid ${isActive ? "var(--accent-mid)" : "var(--border)"}`,
                color: isActive ? "var(--accent-text)" : "var(--text-dim)",
                fontSize: "13px",
                fontWeight: isActive ? 500 : 400,
                padding: "7px 13px",
                minHeight: "36px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
                boxShadow: "var(--shadow-sm)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {chip.color && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: chip.color,
                    flexShrink: 0,
                  }}
                />
              )}
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Export button */}
      <button
        onClick={onExport}
        className="toolbar-export-btn"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: "9px",
          padding: "9px 16px",
          minHeight: "36px",
          fontFamily: "inherit",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.18s",
          whiteSpace: "nowrap",
          boxShadow: "var(--shadow-sm)",
          letterSpacing: "-0.1px",
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget;
          btn.style.background = "#1D4E79";
          btn.style.boxShadow = "var(--shadow-md)";
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget;
          btn.style.background = "var(--accent)";
          btn.style.boxShadow = "var(--shadow-sm)";
        }}
      >
        ↓ Congress-Pack
      </button>
    </div>
  );
}
