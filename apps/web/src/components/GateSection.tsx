"use client";

interface Props {
  onExport: () => void;
}

const GATE_ITEMS = [
  { icon: "📄", title: "PDF Briefing", desc: "Kongress-Übersicht, Deadlines + Score-Begründungen" },
  { icon: "📅", title: "ICS Kalender-Datei", desc: "Alle Kongresse + Deadlines als Kalender-Import" },
  { icon: "📊", title: "CSV / XLSX", desc: "Strukturierte Tabelle für Medical Plan + Team-Sharing" },
];

export function GateSection({ onExport }: Props) {
  return (
    <div
      style={{
        marginTop: "32px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1px",
        background: "var(--border)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
        animation: "fadeUp 0.4s 0.3s ease both",
        animationFillMode: "forwards",
        opacity: 0,
      }}
      className="gate-section"
    >
      {/* Left */}
      <div style={{ background: "var(--surface)", padding: "36px 40px" }} className="gate-section-left">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            fontSize: "11.5px",
            fontWeight: 500,
            color: "var(--teal)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round">
            <path d="M13 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1z" />
            <line x1="8" y1="6" x2="8" y2="10" />
            <line x1="6" y1="8" x2="10" y2="8" />
          </svg>
          Congress-Pack · Kostenfrei
        </div>

        <div
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "26px",
            fontWeight: 400,
            lineHeight: 1.25,
            letterSpacing: "-0.3px",
            color: "var(--text)",
            marginBottom: "10px",
          }}
        >
          Alle Infos direkt<br />
          in deinen{" "}
          <em style={{ fontStyle: "italic", color: "var(--accent)" }}>Workflow.</em>
        </div>

        <p
          style={{
            fontSize: "13.5px",
            color: "var(--text-dim)",
            lineHeight: 1.65,
            fontWeight: 300,
            marginBottom: "24px",
            maxWidth: "360px",
          }}
        >
          Exportiere deine aktuelle Filterauswahl als vollständiges Congress-Pack – strukturiert für dein Team und direkt kalenderbereit.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {GATE_ITEMS.map((item) => (
            <div key={item.title} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13.5px", color: "var(--text-dim)" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <strong style={{ color: "var(--text)", fontWeight: 500, display: "block", fontSize: "13px" }}>
                  {item.title}
                </strong>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={{ background: "var(--surface-2)", padding: "36px 40px" }} className="gate-section-right">
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: "4px",
            letterSpacing: "-0.2px",
          }}
        >
          Congress-Pack anfordern
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.55 }}>
          Du erhältst dein Pack per E-Mail – auf Basis deiner aktuellen Filterauswahl.
        </p>

        <button
          onClick={onExport}
          style={{
            width: "100%",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "9px",
            padding: "12px",
            fontFamily: "inherit",
            fontSize: "13.5px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.18s, box-shadow 0.18s",
            letterSpacing: "-0.1px",
            marginBottom: "10px",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#1D4E79"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          Congress-Pack per E-Mail senden →
        </button>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55, textAlign: "center" }}>
          Transaktionale E-Mail – kein Newsletter. Opt-in für Deadline-Reminders separat möglich.{" "}
          <a href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Datenschutz</a>
        </div>
      </div>
    </div>
  );
}
