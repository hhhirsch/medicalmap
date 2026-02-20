"use client";

interface Props {
  totalCount?: number;
  onExport: () => void;
}

const PREVIEW_ITEMS = [
  { name: "ASCO Annual Meeting", date: "Abstract · 13. Feb 2025", score: 96 },
  { name: "EHA Congress", date: "Abstract · Feb 2025", score: 77 },
  { name: "AACR Annual Meeting", date: "Late-Breaking · Mär 2025", score: 84 },
  { name: "ESMO Congress", date: "Abstract · Apr 2025", score: 93 },
];

export function Hero({ totalCount, onExport }: Props) {
  return (
    <div
      style={{
        padding: "60px 2.5rem 48px",
        maxWidth: "1300px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: "48px",
        alignItems: "center",
        animation: "fadeUp 0.5s ease both",
      }}
    >
      {/* Left */}
      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--teal)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "var(--teal)",
              animation: "breathe 2.4s ease-in-out infinite",
              display: "inline-block",
            }}
          />
          Wöchentlich aktualisiert
        </div>

        <h1
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(32px, 4vw, 46px)",
            fontWeight: 400,
            letterSpacing: "-0.5px",
            lineHeight: 1.15,
            color: "var(--text)",
            marginBottom: "16px",
          }}
        >
          Die richtigen Kongresse.
          <br />
          <em style={{ fontStyle: "italic", color: "var(--accent)" }}>Keine Deadline verpassen.</em>
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "var(--text-dim)",
            lineHeight: 1.7,
            fontWeight: 300,
            maxWidth: "480px",
            marginBottom: "28px",
          }}
        >
          Kuratiertes Congress-Directory für Medical Affairs Teams – mit Scoring, Deadline-Ampel und direktem Export für deine Kongress-Planung.
        </p>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            background: "var(--surface)",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
            width: "fit-content",
          }}
        >
          {[
            { num: totalCount != null ? String(totalCount) : "…", label: "Kongresse" },
            { num: "6", label: "Indikationen" },
            { num: "2025–26", label: "Zeitraum" },
            { num: "EU + US", label: "Region" },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              style={{
                padding: "14px 22px",
                textAlign: "center",
                borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: "19px",
                  fontWeight: 600,
                  color: "var(--text)",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {stat.num}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right – preview card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "var(--shadow-lg)",
        }}
        className="hero-preview-card"
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--text-muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          Nächste Deadlines · Onkologie
        </div>

        {PREVIEW_ITEMS.map((item) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>
                {item.name}
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                {item.date}
              </div>
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--accent)",
                background: "var(--accent-soft)",
                border: "1px solid var(--accent-mid)",
                borderRadius: "6px",
                padding: "3px 8px",
              }}
            >
              {item.score}
            </div>
          </div>
        ))}

        <button
          onClick={onExport}
          style={{
            marginTop: "14px",
            width: "100%",
            background: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "9px",
            padding: "10px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            letterSpacing: "-0.1px",
            transition: "background 0.18s",
          }}
          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "#1D4E79"; }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "var(--accent)"; }}
        >
          Congress-Pack exportieren →
        </button>
      </div>
    </div>
  );
}
