import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ACCOUNT_ORG_NAME, ACCOUNT_READINESS, ACCOUNT_LOWEST_SECTION, ACCOUNT_LOWEST_HINT } from "@/data/seed";
import { useAppStore } from "@/store/useAppStore";
import { useAccountSectionsView } from "@/store/derived";

function pctPillStyle(pct: number): React.CSSProperties {
  if (pct >= 90) return { background: "var(--color-success-bg)", color: "var(--color-success-ink)" };
  if (pct >= 75) return { background: "var(--color-warning-bg)", color: "var(--color-warning-ink)" };
  return { background: "var(--color-accent-tint)", color: "var(--color-accent-ink)" };
}

function segmentColor(pct: number): string {
  if (pct >= 90) return "var(--color-success-ink-2)";
  if (pct >= 75) return "#d4a017";
  return "var(--color-accent-ink)";
}

export default function AccountProfilePage() {
  const navigate = useNavigate();
  const sections = useAccountSectionsView();
  const accountExpanded = useAppStore((s) => s.accountExpanded);
  const toggleAccountSection = useAppStore((s) => s.toggleAccountSection);
  const setAccountEdit = useAppStore((s) => s.setAccountEdit);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const startEdit = (factId: string, body: string) => {
    setEditingId(factId);
    setDraft(body);
  };

  const save = (factId: string) => {
    setAccountEdit(factId, draft);
    setEditingId(null);
  };

  return (
    <div className="page-wide page-enter" style={{ maxWidth: 920 }}>
      <button onClick={() => navigate("/dashboard")} className="back-link">
        ← Back to dashboard
      </button>
      <h1 className="h1-serif" style={{ fontSize: 32 }}>
        {ACCOUNT_ORG_NAME}
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--color-text-muted)", maxWidth: 720, marginBottom: 28 }}>
        Your facts, grouped by the questions every funder asks — not by what kind of record they are. This is what
        gets pulled into Write and Report.
      </p>

      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", marginBottom: 18 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: `conic-gradient(var(--color-accent) ${ACCOUNT_READINESS * 3.6}deg, var(--color-divider-2) 0deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: "700 20px var(--font-ui)",
              }}
            >
              {ACCOUNT_READINESS}%
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Grant-ready across 5 categories</div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--color-text-muted)" }}>
              Lowest section: '{ACCOUNT_LOWEST_SECTION}' — {ACCOUNT_LOWEST_HINT}.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, height: 8, borderRadius: 999, overflow: "hidden" }}>
          {sections.map((sec) => (
            <div key={sec.id} style={{ flex: 1, background: segmentColor(sec.pct), borderRadius: 999 }} />
          ))}
        </div>
      </div>

      {sections.map((sec) => (
        <div key={sec.id} className="card" style={{ padding: 0, marginBottom: 12, overflow: "hidden" }}>
          <button
            onClick={() => toggleAccountSection(sec.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "18px 20px",
              border: "none",
              background: "#fff",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--color-info-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flex: "0 0 auto",
              }}
            >
              {sec.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{sec.title}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{sec.subtitle}</div>
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
              {sec.facts.length} facts
            </div>
            <div className="pill" style={pctPillStyle(sec.pct)}>
              {sec.pct}%
            </div>
            <div style={{ fontSize: 14, color: "var(--color-text-muted)", width: 18, textAlign: "center" }}>
              {accountExpanded[sec.id] ? "▲" : "▼"}
            </div>
          </button>

          {accountExpanded[sec.id] && (
            <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--color-divider)" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 14,
                  marginTop: 16,
                }}
              >
                {sec.factsResolved.map((fact) =>
                  editingId === fact.id ? (
                    <div key={fact.id} style={{ border: "2px solid var(--color-info-ink)", borderRadius: 14, padding: 16, background: "#fff" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{fact.title}</div>
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        aria-label="Edit fact text"
                        className="textarea"
                        style={{ marginBottom: 12 }}
                      />
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => save(fact.id)} className="btn btn-sm" style={{ background: "var(--color-info-ink)", color: "#fff" }}>
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn btn-secondary btn-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={fact.id}
                      style={{
                        border: "1px solid var(--color-border-soft)",
                        borderRadius: 14,
                        padding: 16,
                        background: "var(--color-surface-alt-2)",
                        position: "relative",
                      }}
                    >
                      <button
                        onClick={() => startEdit(fact.id, fact.body)}
                        aria-label="Edit fact"
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          border: "none",
                          background: "var(--color-divider)",
                          color: "var(--color-text-muted)",
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        ✎
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingRight: 36 }}>
                        <span style={{ fontSize: 16 }}>{fact.icon}</span>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{fact.title}</div>
                      </div>
                      <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-text-body)", marginBottom: 14 }}>
                        {fact.body}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {fact.tags.map((tag) => (
                            <span
                              key={tag}
                              className="pill"
                              style={tag === "Write" ? { background: "var(--color-accent-tint-2)", color: "var(--color-accent-ink-2)" } : { background: "var(--color-info-bg)", color: "var(--color-info-ink)" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: "var(--color-text-faint)" }}>Updated {fact.updated}</span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
