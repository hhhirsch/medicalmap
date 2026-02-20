import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "20px 2.5rem",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12.5px",
          color: "var(--text-muted)",
        }}
      >
        <p>© {new Date().getFullYear()} MedicalMap. Alle Rechte vorbehalten.</p>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Datenschutz</Link>
          <Link href="/imprint" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Impressum</Link>
        </div>
      </div>
    </footer>
  );
}

