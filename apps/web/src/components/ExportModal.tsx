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
  const [exportType, setExportType] = useState<"csv" | "xlsx">("xlsx");
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28, 26, 24, 0.45)",
        backdropFilter: "blur(5px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "18px",
          padding: "36px",
          maxWidth: "460px",
          width: "90%",
          position: "relative",
          boxShadow: "var(--shadow-lg)",
          animation: "modalIn 0.22s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            borderRadius: "7px",
            width: "28px",
            height: "28px",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
        >
          ✕
        </button>

        {status === "success" ? (
          <>
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "var(--accent-soft)",
                border: "1px solid var(--accent-mid)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                marginBottom: "18px",
              }}
            >
              ✅
            </div>
            <h2
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "22px",
                fontWeight: 400,
                letterSpacing: "-0.3px",
                marginBottom: "6px",
                color: "var(--text)",
              }}
            >
              Pack wird versendet
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.6, fontWeight: 300, marginBottom: "20px" }}>
              Dein Congress-Pack wird gerade generiert und in den nächsten Minuten zugestellt.
            </p>
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "14px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "9px",
              }}
            >
              {[
                { icon: "📄", text: "PDF Briefing · Onkologie + Hämatologie" },
                { icon: "📅", text: "ICS Kalender · Events inkl. Deadlines" },
                { icon: "📊", text: `${exportType.toUpperCase()} · vollständige Kongress-Tabelle` },
              ].map((row) => (
                <div key={row.text} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--text-dim)" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "7px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    {row.icon}
                  </div>
                  {row.text}
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
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
              }}
            >
              Schließen
            </button>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55, textAlign: "center", marginTop: "10px" }}>
              Fragen? Melde dich gerne unter{" "}
              <a href="mailto:contact@medicalmap.io" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>contact@medicalmap.io</a>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "var(--accent-soft)",
                border: "1px solid var(--accent-mid)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                marginBottom: "18px",
              }}
            >
              📤
            </div>
            <h2
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "22px",
                fontWeight: 400,
                letterSpacing: "-0.3px",
                marginBottom: "6px",
                color: "var(--text)",
              }}
            >
              Congress-Pack exportieren
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.6, fontWeight: 300, marginBottom: "20px" }}>
              Du erhältst dein Pack per E-Mail – auf Basis deiner aktuellen Filterauswahl.
            </p>

            {/* Email */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-dim)", marginBottom: "5px", letterSpacing: "0.01em" }}>
                E-Mail-Adresse *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@unternehmen.de"
                style={{
                  width: "100%",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "9px",
                  padding: "10px 13px",
                  color: "var(--text)",
                  fontFamily: "inherit",
                  fontSize: "13.5px",
                  outline: "none",
                  fontWeight: 400,
                }}
              />
            </div>

            {/* Format */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-dim)", marginBottom: "5px", letterSpacing: "0.01em" }}>
                Format
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px" }}>
                {(["csv", "xlsx"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportType(fmt)}
                    style={{
                      background: exportType === fmt ? "var(--accent-soft)" : "var(--surface)",
                      border: `1px solid ${exportType === fmt ? "var(--accent-mid)" : "var(--border)"}`,
                      color: exportType === fmt ? "var(--accent-text)" : "var(--text-dim)",
                      borderRadius: "9px",
                      padding: "10px 13px",
                      fontFamily: "inherit",
                      fontSize: "13.5px",
                      fontWeight: exportType === fmt ? 500 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Honeypot */}
            <div style={{ display: "none" }} aria-hidden="true">
              <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
            </div>

            {/* Consents */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "var(--text-dim)", cursor: "pointer", marginBottom: "8px" }}>
                <input
                  type="checkbox"
                  checked={consentExport}
                  onChange={(e) => setConsentExport(e.target.checked)}
                  required
                  style={{ marginTop: "1px" }}
                />
                Ich möchte den Export per E-Mail erhalten *
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "var(--text-muted)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  style={{ marginTop: "1px" }}
                />
                Updates über neue Kongresse und Features erhalten
              </label>
            </div>

            {status === "error" && (
              <p style={{ color: "var(--red)", fontSize: "12px", marginBottom: "10px" }}>{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading" || !consentExport}
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
                cursor: status === "loading" || !consentExport ? "not-allowed" : "pointer",
                opacity: status === "loading" || !consentExport ? 0.5 : 1,
                transition: "background 0.18s, box-shadow 0.18s",
                letterSpacing: "-0.1px",
                marginBottom: "10px",
              }}
            >
              {status === "loading" ? "Wird gesendet…" : "Congress-Pack per E-Mail senden →"}
            </button>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55, textAlign: "center" }}>
              Transaktionale E-Mail – kein Newsletter.{" "}
              <a href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Datenschutz</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
