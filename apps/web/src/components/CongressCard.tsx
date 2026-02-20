"use client";

import { useState } from "react";
import { type CongressRow } from "@medicalmap/shared";

interface Props {
  congress: CongressRow;
  onDetails: (congress: CongressRow) => void;
}

const TIER_COLORS: Record<number, string> = {
  1: "var(--teal)",
  2: "var(--accent)",
  3: "var(--purple)",
};

function formatDate(start: string | null, end: string | null): string {
  if (!start) return "—";
  const s = new Date(start);
  const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  if (!end) return `${s.getDate()}. ${months[s.getMonth()]}`;
  const e = new Date(end);
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}.–${e.getDate()}. ${months[s.getMonth()]}`;
  }
  return `${s.getDate()}. ${months[s.getMonth()]} – ${e.getDate()}. ${months[e.getMonth()]}`;
}

function formatYear(start: string | null): string {
  if (!start) return "";
  return String(new Date(start).getFullYear());
}

const GRID = "2fr 1fr 1fr 120px";

export function CongressCardHeader() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: GRID,
        padding: "0 18px",
        marginBottom: "6px",
        animation: "fadeUp 0.4s 0.15s ease both",
        animationFillMode: "forwards",
        opacity: 0,
      }}
    >
      {["Kongress", "Ort", "Datum", "Aktion"].map((th, i) => (
        <div
          key={th}
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--text-muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "7px 0",
            textAlign: i === 3 ? "right" : "left",
          }}
        >
          {th}
        </div>
      ))}
    </div>
  );
}

export function CongressCard({ congress, onDetails }: Props) {
  const [starred, setStarred] = useState(false);
  const tierColor = TIER_COLORS[congress.tier] ?? "var(--text-muted)";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "11px",
        padding: "17px 18px",
        display: "grid",
        gridTemplateColumns: GRID,
        gap: 0,
        alignItems: "center",
        transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s",
        cursor: "pointer",
        position: "relative",
      }}
      className="congress-card"
      onClick={() => onDetails(congress)}
    >
      {/* Tier bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "8px",
          bottom: "8px",
          width: "3px",
          borderRadius: "0 2px 2px 0",
          background: tierColor,
        }}
      />

      {/* Name cell */}
      <div style={{ paddingRight: "16px" }}>
        <div
          style={{
            fontSize: "13.5px",
            fontWeight: 500,
            color: "var(--text)",
            lineHeight: 1.35,
            marginBottom: congress.tags && congress.tags.length > 0 ? "6px" : 0,
            letterSpacing: "-0.1px",
          }}
        >
          {congress.name}
        </div>
        {congress.tags && congress.tags.length > 0 && (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {congress.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "10.5px",
                  fontWeight: 500,
                  padding: "2px 7px",
                  borderRadius: "4px",
                  background: "var(--surface-2)",
                  color: "var(--text-dim)",
                  border: "1px solid var(--border)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Location cell */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <div style={{ fontSize: "13px", color: "var(--text)" }}>{congress.city || "—"}</div>
        <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{congress.country || congress.region}</div>
      </div>

      {/* Date cell */}
      <div>
        <div style={{ fontSize: "13px", color: "var(--text)" }}>
          {formatDate(congress.start_date, congress.end_date)}
        </div>
        {congress.start_date && (
          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
            {formatYear(congress.start_date)}
          </div>
        )}
      </div>

      {/* Action cell */}
      <div
        style={{ display: "flex", justifyContent: "flex-end", gap: "6px", alignItems: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setStarred((s) => !s); }}
          style={{
            background: starred ? "var(--amber-soft)" : "var(--surface-2)",
            border: `1px solid ${starred ? "#ECDBB0" : "var(--border)"}`,
            color: starred ? "var(--amber)" : "var(--text-muted)",
            borderRadius: "7px",
            padding: "6px 9px",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "inherit",
            lineHeight: 1,
          }}
        >
          {starred ? "★" : "☆"}
        </button>
        <a
          href={congress.website_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-mid)",
            color: "var(--accent-text)",
            borderRadius: "7px",
            padding: "6px 11px",
            fontSize: "12.5px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Details →
        </a>
      </div>
    </div>
  );
}
