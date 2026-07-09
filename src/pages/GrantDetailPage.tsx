import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView, isSavedStage } from "@/store/derived";
import { GrantLifecycleStage } from "@types-domain/grantRecord";
import { formatCurrencyFull, formatDate } from "@/utils/format";
import JargonTerm from "@/components/JargonTerm";

export default function GrantDetailPage() {
  const { grantId = "" } = useParams();
  const navigate = useNavigate();
  const view = useGrantView(grantId);
  const setStage = useAppStore((s) => s.setStage);
  const addToast = useAppStore((s) => s.addToast);
  const discoverable = useAppStore((s) => s.discoverable[grantId]);
  const toggleDiscoverable = useAppStore((s) => s.toggleDiscoverable);

  if (!view) {
    return (
      <div className="page-enter" style={{ padding: 40 }}>
        <p>Grant not found.</p>
      </div>
    );
  }

  const { grant, stage } = view;
  const saved = isSavedStage(stage);

  const toggleSave = () => {
    if (saved) {
      setStage(grant.id, GrantLifecycleStage.Unsaved);
      addToast("Removed from saved grants.");
    } else {
      setStage(grant.id, GrantLifecycleStage.Saved);
      addToast("Saved to your dashboard.");
    }
  };

  const shareGrant = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    addToast("Link copied.");
  };

  return (
    <div className="page-narrow page-enter">
      <button onClick={() => navigate("/search")} className="back-link">
        ← Back to search
      </button>

      <div className="card" style={{ padding: 32, marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, marginBottom: 8 }}>
          {grant.purpose.split(".")[0]}
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16 }}>
          {grant.grantor} · {grant.targetRegions.map((r) => r.name).join(", ")}
        </div>
        <div style={{ fontWeight: 700, fontSize: 20, color: "var(--color-accent-ink-2)", marginBottom: 16 }}>
          {formatCurrencyFull(grant.award.totalAmount)} total
        </div>
        <div className="tag-row" style={{ marginBottom: 20 }}>
          {grant.issues.map((tag) => (
            <span key={tag} className="pill pill-neutral">
              {tag}
            </span>
          ))}
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-text-body)", marginBottom: 24 }}>
          {grant.purpose}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          <div style={{ border: "1px solid var(--color-divider-2)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>Applications open</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{formatDate(grant.timeline.applicationWindowStart)}</div>
          </div>
          <div style={{ border: "1px solid var(--color-divider-2)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>Applications close</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{formatDate(grant.timeline.applicationWindowEnd)}</div>
          </div>
          <div style={{ border: "1px solid var(--color-divider-2)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>Decision by</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{formatDate(grant.timeline.notificationDate)}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={toggleSave} className="btn btn-secondary btn-sm">
            {saved ? "★ Saved" : "☆ Save"}
          </button>
          <button onClick={() => navigate(`/grants/${grant.id}/collaborate`)} className="btn btn-secondary btn-sm">
            🤝 Find Collaborators for this Grant
          </button>
          <button onClick={shareGrant} className="btn btn-secondary btn-sm">
            Share link
          </button>
          <button disabled title="Coming soon" className="btn btn-secondary btn-sm">
            View grant on website ↗
          </button>
        </div>

        {saved && (
          <div
            style={{
              marginTop: 22,
              paddingTop: 20,
              borderTop: "1px solid var(--color-divider-2)",
            }}
          >
            <CheckboxLine
              checked={!!discoverable}
              onToggle={() => {
                toggleDiscoverable(grant.id);
                addToast(discoverable ? "No longer discoverable to other applicants." : "You're now discoverable to other applicants.");
              }}
            />
          </div>
        )}
      </div>

      <div className="tag-row" style={{ flexDirection: "column", display: "flex", gap: 14 }}>
        <div className="card-ai">
          <div className="pill pill-ai" style={{ marginBottom: 10 }}>
            ✦ AI-ASSISTED
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
            <JargonTerm termKey="fit">See how well this fits you</JargonTerm>
          </div>
          <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", marginBottom: 14 }}>
            An estimated fit score based on your profile and past funded applications, with clear reasoning you can
            check.
          </p>
          <button onClick={() => navigate(`/grants/${grant.id}/fit`)} className="btn btn-primary btn-sm">
            See fit analysis →
          </button>
        </div>
        <div className="card-ai">
          <div className="pill pill-ai" style={{ marginBottom: 10 }}>
            ✦ AI-ASSISTED
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Start collecting your data</div>
          <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", marginBottom: 14 }}>
            Turn what you already have into grant-ready, cited evidence.
          </p>
          <button onClick={() => navigate(`/grants/${grant.id}/collect`)} className="btn btn-primary btn-sm">
            ✦ Start collecting supporting data
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckboxLine({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} role="checkbox" tabIndex={0} aria-checked={checked} className="checkbox-row">
      <div className={`checkbox-box ${checked ? "checkbox-box-checked" : ""}`}>{checked ? "✓" : ""}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
        Let other organizations applying to this grant find you as a potential collaborator.{" "}
        <JargonTerm termKey="discoverable">What does discoverable mean?</JargonTerm>
      </div>
    </div>
  );
}
