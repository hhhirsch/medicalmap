import Link from "next/link";

export function NavBar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(244, 242, 239, 0.92)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 2.5rem",
        height: "58px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 600, fontSize: "15.5px", color: "var(--text)", textDecoration: "none", letterSpacing: "-0.2px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            background: "var(--accent)",
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <circle cx="8" cy="8" r="5" />
            <line x1="8" y1="1" x2="8" y2="4" />
            <line x1="8" y1="12" x2="8" y2="15" />
            <line x1="1" y1="8" x2="4" y2="8" />
            <line x1="12" y1="8" x2="15" y2="8" />
          </svg>
        </div>
        MedicalMap
      </Link>

      <div style={{ display: "flex", gap: "4px" }}>
        <NavLink href="/congresses">Directory</NavLink>
        <NavLink href="/#about">About</NavLink>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent-text)",
            fontSize: "12px",
            fontWeight: 500,
            padding: "4px 11px",
            borderRadius: "100px",
            border: "1px solid var(--accent-mid)",
            letterSpacing: "0.01em",
          }}
        >
          Medical Affairs
        </span>
        <NavLink href="/imprint">Imprint</NavLink>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        color: "var(--text-dim)",
        textDecoration: "none",
        fontSize: "13.5px",
        fontWeight: 400,
        padding: "5px 12px",
        borderRadius: "7px",
        transition: "all 0.15s",
      }}
      className="nav-link-item"
    >
      {children}
    </Link>
  );
}
