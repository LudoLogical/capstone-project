import { useNavigate } from "react-router-dom";
import { STORIES } from "@/data/seed";
import { useAppStore } from "@/store/useAppStore";

const ENTRY_CARDS = [
  {
    icon: "🔎",
    title: "Find your grant",
    body: "Search a trusted library, or let the AI rank grants by how well they fit your initiative.",
    cta: "Search grants →",
    to: "/search",
  },
  {
    icon: "📊",
    title: "Tell your data's story",
    body: "The AI turns neighborhood numbers into plain-language, grant-ready framing — every figure traceable to its source.",
    cta: "Go to my dashboard →",
    to: "/dashboard",
  },
  {
    icon: "🤝",
    title: "Connect with partners",
    body: "See suggested collaborators, then ask New Sun Rising for a warm introduction — no cold automated emails.",
    cta: "See how it works →",
    to: "/dashboard",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const signIn = useAppStore((s) => s.signIn);

  const enterPortal = () => {
    signIn();
    navigate("/dashboard");
  };

  const enterTo = (to: string) => {
    signIn();
    navigate(to);
  };

  return (
    <div className="page page-enter">
      <section style={{ padding: "80px 0 56px", textAlign: "center" }}>
        <div
          className="pill pill-accent"
          style={{ display: "inline-flex", marginBottom: 28, background: "#fff", border: "1px solid var(--color-border)" }}
        >
          For New Sun Rising client organizations
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 56,
            lineHeight: 1.05,
            letterSpacing: "-.02em",
            maxWidth: 760,
            margin: "0 auto 20px",
          }}
        >
          Find grants. <span style={{ color: "var(--color-accent)" }}>Prove your impact</span>. Win funding.
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.55, color: "var(--color-text-muted)", maxWidth: 600, margin: "0 auto 34px" }}>
          Search for grants that fit your work, turn the data you already have into a case funders can act on, and
          keep drafts and reports in one place.
        </p>
        <button onClick={enterPortal} className="btn btn-primary" style={{ fontSize: 16, padding: "14px 26px" }}>
          Sign in to your portal →
        </button>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, paddingBottom: 48 }}>
        {ENTRY_CARDS.map((c) => (
          <button key={c.title} onClick={() => enterTo(c.to)} className="card card-hover">
            <div style={{ fontSize: 24, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 7 }}>{c.title}</div>
            <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--color-text-muted)", marginBottom: 12 }}>{c.body}</p>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)" }}>{c.cta}</div>
          </button>
        ))}
      </section>

      <section style={{ paddingBottom: 80 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          Success stories from our leaders
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {STORIES.map((st) => (
            <button
              key={st.id}
              onClick={() => navigate(`/stories/${st.id}`)}
              className="card card-hover"
              style={{ padding: 0, overflow: "hidden", background: "var(--color-surface-alt)" }}
            >
              <div style={{ padding: "20px 22px 22px" }}>
                <div className="pill pill-accent" style={{ marginBottom: 12 }}>
                  {st.tag}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 12 }}>
                  <strong>{st.who}</strong> {st.what}
                </p>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)" }}>Read their story →</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
