import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ISSUES } from "@/types/constants";
import { SESSION_USER } from "@/data/seed";
import { useAppStore } from "@/store/useAppStore";
import { useDashboardGroups, type GrantView } from "@/store/derived";
import { formatCurrency } from "@/utils/format";
import EmptyState from "@/components/EmptyState";
import HowAIModal from "@/components/HowAIModal";
import { GrantLifecycleStage } from "@/types/grantRecord";

type Tab = "progress" | "awarded" | "saved";

function TabCard({
  view,
  primaryLabel,
  primaryTo,
}: {
  view: GrantView;
  primaryLabel: string;
  primaryTo: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="card">
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          marginBottom: 8,
        }}
      >
        {view.grant.purpose.split(".")[0]}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "var(--color-text-muted)",
          marginBottom: 10,
        }}
      >
        {view.grant.grantor} · {formatCurrency(view.grant.award.totalAmount)}
      </div>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: "var(--color-text-muted)",
          maxWidth: 620,
          marginBottom: 18,
        }}
      >
        {view.alignmentAnalysis ?? view.grant.purpose}
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => navigate(primaryTo)}
          className="btn btn-primary btn-sm"
        >
          {primaryLabel}
        </button>
        <button
          onClick={() => navigate(`/grants/${view.grant.id}`)}
          className="btn btn-secondary btn-sm"
        >
          View grant
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("progress");
  const [query, setQuery] = useState("");
  const { inProgress, awarded, saved } = useDashboardGroups();
  const setDraftFilters = useAppStore((s) => s.setDraftFilters);
  const applyFilters = useAppStore((s) => s.applyFilters);
  const setRelevanceMode = useAppStore((s) => s.setRelevanceMode);
  const setStage = useAppStore((s) => s.setStage);

  const goSearch = () => {
    setDraftFilters({ query });
    applyFilters();
    navigate("/search");
  };

  const findRelevant = () => {
    setRelevanceMode(true);
    setDraftFilters({});
    applyFilters();
    navigate("/search");
  };

  const dashPick = (issue: (typeof ISSUES)[number]) => {
    setDraftFilters({ issues: [issue] });
    applyFilters();
    navigate("/search");
  };

  return (
    <div className="page page-enter">
      <h1 className="h1-serif" style={{ fontSize: 34, marginBottom: 18 }}>
        Hello, {SESSION_USER.firstName}.
      </h1>

      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
          Find the perfect grant opportunity
        </div>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--color-text-muted)",
            marginBottom: 14,
          }}
        >
          Type what you're looking for and hit <strong>Search</strong>, pick an
          issue tag below, or let AI rank grants by how well they fit your work.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goSearch()}
            aria-label="Search for grants by keyword"
            placeholder="e.g. health programs in Pittsburgh"
            className="input"
            style={{ flex: 1, minWidth: 280 }}
          />
          <button onClick={goSearch} className="btn btn-secondary">
            Search
          </button>
          <button onClick={findRelevant} className="btn btn-primary">
            ✦ Find grants relevant to me
          </button>
        </div>
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Or filter by issue tag
          </div>
          <div className="tag-row">
            {ISSUES.map((issue) => (
              <button
                key={issue}
                onClick={() => dashPick(issue)}
                className="pill pill-neutral"
                style={{ cursor: "pointer" }}
              >
                {issue}
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            marginTop: 16,
          }}
        >
          Your data remains private and is not used to train our AI.{" "}
          <HowAIModal />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--color-border-soft)",
          marginBottom: 24,
        }}
      >
        {(
          [
            ["progress", `In progress (${inProgress.length})`],
            ["awarded", `Awarded (${awarded.length})`],
            ["saved", `Saved (${saved.length})`],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              border: "none",
              background: "none",
              font: "600 15px var(--font-ui)",
              padding: "12px 16px",
              cursor: "pointer",
              color: "var(--color-text)",
              borderBottom:
                tab === key
                  ? "2.5px solid var(--color-accent)"
                  : "2.5px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "progress" &&
        (inProgress.length === 0 ? (
          <EmptyState
            icon="✦"
            title="Nothing in progress"
            body="Save a grant and start collecting data to see it here."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {inProgress.map((v) => (
              <TabCard
                key={v.grant.id}
                view={v}
                primaryLabel="✦ Continue collecting data"
                primaryTo={`/grants/${v.grant.id}/collect`}
              />
            ))}
          </div>
        ))}

      {tab === "awarded" &&
        (awarded.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="No awarded grants yet"
            body="Once you're awarded a grant, your reporting workspace will appear here."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {awarded.map((v) => (
              <TabCard
                key={v.grant.id}
                view={v}
                primaryLabel="🔒 Open Grant Outcome Report"
                primaryTo={`/grants/${v.grant.id}/report`}
              />
            ))}
          </div>
        ))}

      {tab === "saved" &&
        (saved.length === 0 ? (
          <EmptyState
            icon="☆"
            title="No saved grants yet"
            body="Tap ☆ Save on any grant to keep it here for later."
            action={
              <button
                onClick={() => navigate("/search")}
                className="btn btn-primary btn-sm"
              >
                Browse grants
              </button>
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {saved.map((v) => (
              <div key={v.grant.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div
                      onClick={() => navigate(`/grants/${v.grant.id}`)}
                      role="button"
                      tabIndex={0}
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 21,
                        marginBottom: 5,
                        cursor: "pointer",
                      }}
                    >
                      {v.grant.purpose.split(".")[0]}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-muted)",
                        marginBottom: 10,
                      }}
                    >
                      {v.grant.grantor} ·{" "}
                      {formatCurrency(v.grant.award.totalAmount)}
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {v.grant.purpose}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => navigate(`/grants/${v.grant.id}`)}
                      className="btn btn-primary btn-sm"
                    >
                      Open grant →
                    </button>
                    <button
                      onClick={() =>
                        setStage(v.grant.id, GrantLifecycleStage.Unsaved)
                      }
                      className="btn btn-secondary btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
