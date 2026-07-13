import { useNavigate } from "react-router-dom";
import type Grant from "@/types/grant";
import { formatCurrency, formatDate } from "@/utils/format";
import { useAppStore } from "@/store/useAppStore";
import { GrantLifecycleStage } from "@/types/grantRecord";
import { isSavedStage } from "@/store/derived";

export default function GrantCard({
  grant,
  stage,
}: {
  grant: Grant;
  stage: GrantLifecycleStage;
}) {
  const navigate = useNavigate();
  const setStage = useAppStore((s) => s.setStage);
  const addToast = useAppStore((s) => s.addToast);
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

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div
            onClick={() => navigate(`/grants/${grant.id}`)}
            role="button"
            tabIndex={0}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              marginBottom: 5,
              cursor: "pointer",
            }}
          >
            {grant.purpose.split(".")[0]}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginBottom: 10,
            }}
          >
            {grant.grantor} ·{" "}
            {grant.targetRegions.map((r) => r.name).join(", ")}
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.5,
              color: "var(--color-text-muted)",
              margin: 0,
              marginBottom: 12,
            }}
          >
            {grant.purpose}
          </p>
          <div className="tag-row">
            {grant.issues.map((tag) => (
              <span key={tag} className="pill pill-neutral">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "flex-end",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "var(--color-accent-ink-2)",
              fontSize: 15,
            }}
          >
            {formatCurrency(grant.award.totalAmount)}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-faint)" }}>
            Closes {formatDate(grant.timeline.applicationWindowEnd)}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button
              onClick={toggleSave}
              className="btn btn-secondary btn-sm"
              aria-pressed={saved}
            >
              {saved ? "★ Saved" : "☆ Save"}
            </button>
            <button
              onClick={() => navigate(`/grants/${grant.id}`)}
              className="btn btn-primary btn-sm"
            >
              View grant →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
