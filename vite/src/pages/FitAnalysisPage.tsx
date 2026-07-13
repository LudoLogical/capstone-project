import { useNavigate, useParams } from "react-router-dom";
import { useGrantView } from "@/store/derived";
import { ACCOUNT_ORG_NAME } from "@/data/seed";
import CiteButton from "@/components/CiteButton";
import JargonTerm from "@/components/JargonTerm";

const PROS = [
  "You work in the exact neighborhoods this funder targets.",
  "Your requested range sits comfortably within the award size.",
  "Your issue tags line up directly with this grant's focus areas.",
];

const CONS = [
  "This funder has historically favored applicants with an existing relationship — consider requesting a warm introduction.",
  "Your reporting history for a grant of this size is still thin — pair your application with strong baseline data.",
];

export default function FitAnalysisPage() {
  const { grantId = "" } = useParams();
  const navigate = useNavigate();
  const view = useGrantView(grantId);

  if (!view) return null;
  const { grant } = view;

  return (
    <div className="page-narrow page-enter">
      <button onClick={() => navigate(`/grants/${grant.id}`)} className="back-link">
        ← Back
      </button>

      <div className="pill pill-ai" style={{ marginBottom: 12 }}>
        ✦ AI-ASSISTED
      </div>
      <h1 className="h1-serif" style={{ fontSize: 30, marginBottom: 14 }}>
        How {grant.purpose.split(".")[0]} fits {ACCOUNT_ORG_NAME}
      </h1>

      <div
        style={{
          background: "var(--color-info-bg-2)",
          border: "1px solid var(--color-info-border-2)",
          borderRadius: "var(--radius-lg)",
          padding: 16,
          marginBottom: 22,
          fontSize: 13.5,
          lineHeight: 1.5,
          color: "var(--color-text-body)",
        }}
      >
        This estimate is based on 18 past funded applications with a similar profile. <CiteButton provenanceKey="fit" label="See sources" />
        <div style={{ marginTop: 8, color: "var(--color-text-muted)" }}>
          AI can make mistakes. This is not a judgment about whether you'll be awarded the grant.
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          <JargonTerm termKey="fit">Estimated fit</JargonTerm>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span className="pill pill-success">Strong</span>
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>82% estimated fit</span>
        </div>
        <div className="progress-track" style={{ marginBottom: 12 }}>
          <div className="progress-fill" style={{ width: "82%" }} />
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--color-text-muted)" }}>
          Your service area, focus, and requested funding range all line up closely with what this funder has
          historically supported.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "var(--color-success-bg-2)", border: "1px solid var(--color-success-border-2)", borderRadius: "var(--radius-lg)", padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "var(--color-success-ink)" }}>
            ✓ Why it's a good fit
          </div>
          <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {PROS.map((p) => (
              <li key={p} style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ background: "var(--color-warning-bg-2)", border: "1px solid var(--color-warning-border-2)", borderRadius: "var(--radius-lg)", padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "var(--color-warning-ink)" }}>
            ! Worth considering
          </div>
          <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {CONS.map((c) => (
              <li key={c} style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate(`/grants/${grant.id}/collect`)} className="btn btn-primary">
          ✦ Start collecting supporting data
        </button>
        <button onClick={() => navigate(`/grants/${grant.id}/collaborate`)} className="btn btn-secondary">
          🤝 Find a partner
        </button>
      </div>
    </div>
  );
}
