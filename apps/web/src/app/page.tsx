import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 2.5rem",
        maxWidth: "700px",
        margin: "0 auto",
        animation: "fadeUp 0.5s ease both",
      }}
    >
      <h1
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "clamp(36px, 5vw, 52px)",
          fontWeight: 400,
          textAlign: "center",
          letterSpacing: "-0.5px",
          lineHeight: 1.15,
          color: "var(--text)",
          marginBottom: "20px",
        }}
      >
        Congress Intelligence für{" "}
        <em style={{ fontStyle: "italic", color: "var(--accent)" }}>Medical Affairs.</em>
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: "var(--text-dim)",
          textAlign: "center",
          maxWidth: "480px",
          marginBottom: "36px",
          lineHeight: 1.7,
          fontWeight: 300,
        }}
      >
        Entdecke, filtere und exportiere medizinische Kongresse weltweit. Finde die richtigen Events für dein Therapiegebiet, deine Region und deinen Kalender.
      </p>
      <Link
        href="/congresses"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "12px 28px",
          background: "var(--accent)",
          color: "white",
          fontWeight: 500,
          borderRadius: "10px",
          textDecoration: "none",
          fontSize: "15px",
          letterSpacing: "-0.1px",
          transition: "background 0.18s",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        Congress-Directory öffnen →
      </Link>
    </div>
  );
}
