import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView } from "@/store/derived";
import { INTERESTED_BY_GRANT, ORG_PROFILES } from "@/data/seed";

const COLLAB_CAP = 3;

export default function CollaboratePage() {
  const { grantId = "" } = useParams();
  const navigate = useNavigate();
  const view = useGrantView(grantId);
  const collabPicks = useAppStore((s) => s.collabPicks[grantId]) ?? [];
  const collabSent = useAppStore((s) => s.collabSent[grantId]);
  const collabSorted = useAppStore((s) => s.collabSorted[grantId]);
  const toggleCollabPick = useAppStore((s) => s.toggleCollabPick);
  const toggleCollabSort = useAppStore((s) => s.toggleCollabSort);
  const sendCollabRequest = useAppStore((s) => s.sendCollabRequest);
  const addToast = useAppStore((s) => s.addToast);

  if (!view) return null;
  const { grant } = view;

  const orgIds = INTERESTED_BY_GRANT[grant.id] ?? [];
  let orgs = orgIds.map((id) => ORG_PROFILES[id]).filter(Boolean);
  if (collabSorted) {
    orgs = [...orgs].sort((a, b) => b.signals.length - a.signals.length);
  }

  const toggleSort = () => {
    toggleCollabSort(grant.id);
    addToast("Sorting by overlap. Your judgment still decides who to reach out to.");
  };

  const togglePick = (initiativeId: string) => {
    if (!collabPicks.includes(initiativeId) && collabPicks.length >= COLLAB_CAP) {
      addToast(`You can select up to ${COLLAB_CAP} organizations at a time.`);
      return;
    }
    toggleCollabPick(grant.id, initiativeId, COLLAB_CAP);
  };

  const send = () => {
    sendCollabRequest(grant.id);
  };

  if (collabSent) {
    return (
      <div className="page-narrow page-enter">
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 30, marginBottom: 12 }}>✓</div>
          <h1 className="h2-serif" style={{ fontSize: 22, marginBottom: 10 }}>
            Sent to New Sun Rising
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-text-muted)", marginBottom: 20 }}>
            Your introduction request is reviewed only where it looks like a fit — no automated emails go out.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {collabPicks.map((id) => (
              <div
                key={id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  border: "1px solid var(--color-border-soft)",
                  borderRadius: 10,
                  fontSize: 13.5,
                }}
              >
                <span>{ORG_PROFILES[id]?.name}</span>
                <span className="pill pill-warning">Pending review</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/dashboard")} className="btn btn-primary">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-narrow page-enter" style={{ paddingBottom: 120 }}>
      <button onClick={() => navigate(`/grants/${grant.id}`)} className="back-link">
        ← Back
      </button>

      <div className="pill pill-accent" style={{ marginBottom: 12 }}>
        🤝 Interested in co-applying
      </div>
      <h1 className="h1-serif" style={{ fontSize: 28, marginBottom: 10 }}>
        Collaborators for {grant.purpose.split(".")[0]}
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-text-muted)", marginBottom: 20 }}>
        These are opted-in New Sun Rising clients discoverable for this grant. The list is plain and unranked — you
        decide.
      </p>

      <button onClick={toggleSort} className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
        ✦ Sort by overlap with us
      </button>

      {orgs.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
            No organizations are currently discoverable for this grant.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
          {orgs.map((org) => {
            const picked = collabPicks.includes(org.initiativeId);
            return (
              <div key={org.initiativeId} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{org.name}</div>
                      <span className="pill pill-accent">Portal client</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 10 }}>{org.place}</div>
                    {collabSorted ? (
                      <div className="tag-row">
                        {org.signals.map((sig) => (
                          <span key={sig.label} className="pill pill-info">
                            ◷ {sig.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="tag-row">
                        {org.focus.map((f) => (
                          <span key={f} className="pill pill-neutral">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => navigate(`/grants/${grant.id}/collaborate/${org.initiativeId}`)}
                      className="btn btn-secondary btn-sm"
                    >
                      See profile
                    </button>
                    <button
                      onClick={() => togglePick(org.initiativeId)}
                      className="btn btn-sm"
                      style={
                        picked
                          ? { background: "var(--color-text)", color: "#fff" }
                          : { background: "#fff", border: "1px solid var(--color-border-strong)" }
                      }
                    >
                      {picked ? "✓ Selected" : "Select"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderTop: "1px solid var(--color-border-soft)",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "center",
          gap: 16,
          alignItems: "center",
          boxShadow: "var(--shadow-float)",
        }}
      >
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{collabPicks.length} selected</div>
        <button onClick={send} disabled={collabPicks.length === 0} className="btn btn-primary btn-sm">
          Send introduction requests →
        </button>
      </div>
    </div>
  );
}
