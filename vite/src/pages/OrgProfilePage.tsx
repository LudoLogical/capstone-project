import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { ORG_PROFILES } from "@/data/seed";

const COLLAB_CAP = 3;

export default function OrgProfilePage() {
  const { grantId = "", orgId = "" } = useParams();
  const navigate = useNavigate();
  const profile = ORG_PROFILES[orgId];
  const collabPicks = useAppStore((s) => s.collabPicks[grantId]) ?? [];
  const toggleCollabPick = useAppStore((s) => s.toggleCollabPick);
  const contactRequested = useAppStore((s) => s.contactRequested[orgId]);
  const requestContact = useAppStore((s) => s.requestContact);
  const addToast = useAppStore((s) => s.addToast);

  if (!profile) {
    return (
      <div className="page-narrow page-enter">
        <p>Organization not found.</p>
      </div>
    );
  }

  const picked = collabPicks.includes(orgId);

  const togglePick = () => {
    if (!picked && collabPicks.length >= COLLAB_CAP) {
      addToast(`You can select up to ${COLLAB_CAP} organizations at a time.`);
      return;
    }
    toggleCollabPick(grantId, orgId, COLLAB_CAP);
  };

  const requestIntro = () => {
    requestContact(orgId);
    addToast("Requested — pending approval and consent.");
  };

  return (
    <div className="page-narrow page-enter">
      <button onClick={() => navigate(`/grants/${grantId}/collaborate`)} className="back-link">
        ← Back to collaborators
      </button>
      <div className="card" style={{ padding: 32 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
          <div className="avatar-dot" style={{ width: 64, height: 64 }} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
              <h1 className="h2-serif" style={{ fontSize: 26 }}>
                {profile.name}
              </h1>
              <span className="pill pill-accent">Portal client</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--color-text-muted)" }}>{profile.place}</div>
          </div>
        </div>

        <div style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 18, marginBottom: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Mission
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: "var(--color-text-body)" }}>{profile.mission}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 22 }}>
          <div style={{ border: "1px solid var(--color-divider-2)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>Led by</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.lead}</div>
          </div>
          <div style={{ border: "1px solid var(--color-divider-2)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>Founded</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.founded}</div>
          </div>
          <div style={{ border: "1px solid var(--color-divider-2)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>Team</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.size}</div>
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>About</div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-text-body)", marginBottom: 20 }}>{profile.about}</p>

        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Focus areas</div>
        <div className="tag-row" style={{ marginBottom: 22 }}>
          {profile.focus.map((f) => (
            <span key={f} className="pill pill-neutral">
              {f}
            </span>
          ))}
        </div>

        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Contact</div>
        {profile.contactConsent ? (
          <div style={{ background: "var(--color-success-bg-2)", border: "1px solid var(--color-success-border-2)", borderRadius: 14, padding: 18, marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-success-ink)", marginBottom: 10 }}>
              ✓ SHARED WITH CONSENT
            </div>
            <div style={{ fontSize: 14 }}>
              <strong>{profile.contactName}</strong>
            </div>
            <div style={{ fontSize: 14 }}>📞 {profile.contactPhone}</div>
          </div>
        ) : (
          <div style={{ background: "var(--color-info-bg-2)", border: "1px solid var(--color-info-border-2)", borderRadius: 14, padding: 18, marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-info-ink)", marginBottom: 8 }}>
              🔒 CONTACT KEPT PRIVATE
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.5, marginBottom: 12 }}>
              This organization hasn't made their contact details public. Sharing them takes a few human steps:
              requests are reviewed, consent is obtained, and contact details are shared separately.
            </p>
            {contactRequested ? (
              <div className="pill pill-warning">⏳ Requested — pending approval and consent</div>
            ) : (
              <button onClick={requestIntro} className="btn btn-secondary btn-sm">
                Request introduction
              </button>
            )}
          </div>
        )}

        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Why the AI surfaced this organization</div>
        <div className="tag-row" style={{ marginBottom: 8 }}>
          {profile.signals.map((sig) => (
            <span key={sig.label} className="pill pill-info" title={sig.source}>
              ◷ {sig.label} <sup style={{ fontSize: 9 }}>ⓘ</sup>
            </span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: 24 }}>
          These are observable signals only — shared funders, overlap, and distance. The AI never judges whether
          you'll get along; that's what the warm introduction is for.
        </p>

        <div style={{ paddingTop: 22, borderTop: "1px solid var(--color-divider-2)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={togglePick}
            className="btn btn-sm"
            style={picked ? { background: "var(--color-text)", color: "#fff" } : { background: "#fff", border: "1px solid var(--color-border-strong)" }}
          >
            {picked ? "✓ Selected" : "Select for introduction"}
          </button>
          <button onClick={() => navigate(`/grants/${grantId}/collaborate`)} className="btn btn-secondary btn-sm">
            Back to list
          </button>
        </div>
      </div>
    </div>
  );
}
