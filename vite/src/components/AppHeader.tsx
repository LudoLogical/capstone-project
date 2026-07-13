import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { SESSION_USER } from "@/data/seed";

export default function AppHeader() {
  const navigate = useNavigate();
  const signedIn = useAppStore((s) => s.signedIn);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "14px 32px",
        background: "var(--color-header-bg)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--color-border-soft)",
      }}
    >
      <div
        onClick={() => navigate("/")}
        role="button"
        tabIndex={0}
        title="Back to start"
        style={{ display: "flex", alignItems: "center", gap: 11, cursor: "pointer" }}
      >
        <div className="avatar-dot" style={{ width: 30, height: 30, boxShadow: "0 0 0 4px #fbefe3" }} />
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ font: "700 15px/1 var(--font-ui)", letterSpacing: "-.01em" }}>New Sun Rising</div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", letterSpacing: ".02em" }}>
            Vibrancy Portal
          </div>
        </div>
      </div>

      {signedIn && (
        <nav style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          <Link to="/dashboard" className="btn-ghost" style={{ fontWeight: 500, fontSize: 14, padding: "8px 12px", borderRadius: 8 }}>
            Dashboard
          </Link>
          <Link to="/search" className="btn-ghost" style={{ fontWeight: 500, fontSize: 14, padding: "8px 12px", borderRadius: 8 }}>
            Find Grants
          </Link>
        </nav>
      )}

      <div style={{ flex: 1 }} />

      {signedIn ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            to="/account"
            aria-label="Your profile"
            title="Your profile"
            className="avatar-dot"
            style={{
              width: 34,
              height: 34,
              border: "1px solid var(--color-border-strong)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              font: "700 13px var(--font-ui)",
              boxShadow: "0 0 0 3px #fbefe3",
              textDecoration: "none",
            }}
          >
            {SESSION_USER.initials}
          </Link>
        </div>
      ) : (
        <button onClick={() => navigate("/")} className="btn-ghost" style={{ fontWeight: 500, fontSize: 14 }}>
          Sign in
        </button>
      )}
    </header>
  );
}
