"use client";

import { type CongressRow } from "@medicalmap/shared";
import { CongressCard, CongressCardHeader } from "./CongressCard";

interface Props {
  items: CongressRow[];
  loading: boolean;
  onDetails: (congress: CongressRow) => void;
}

export function CongressList({ items, loading, onDetails }: Props) {
  return (
    <div style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
      <CongressCardHeader />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          animation: "fadeUp 0.4s 0.2s ease both",
          animationFillMode: "forwards",
          opacity: 0,
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "11px",
              padding: "48px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "14px",
            }}
          >
            Keine Kongresse gefunden.
          </div>
        ) : (
          items.map((congress) => (
            <CongressCard key={congress.id} congress={congress} onDetails={onDetails} />
          ))
        )}
      </div>
    </div>
  );
}
