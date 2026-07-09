import { useNavigate } from "react-router-dom";
import { ISSUES, type Issue } from "@types-domain/constants";
import { useAppStore } from "@/store/useAppStore";
import { useAllGrantViews } from "@/store/derived";
import { ORG_TYPE_OPTIONS, LOCATION_OPTIONS, filterGrants, sortGrants, type SortOption } from "@/data/selectors";
import CheckboxRow from "@/components/CheckboxRow";
import GrantCard from "@/components/GrantCard";
import EmptyState from "@/components/EmptyState";
import JargonTerm from "@/components/JargonTerm";

const SORTS: { key: SortOption; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "fit", label: "Best fit for you" },
  { key: "deadline", label: "Deadline" },
  { key: "amount", label: "Funding amount" },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const draftFilters = useAppStore((s) => s.draftFilters);
  const appliedFilters = useAppStore((s) => s.appliedFilters);
  const setDraftFilters = useAppStore((s) => s.setDraftFilters);
  const applyFilters = useAppStore((s) => s.applyFilters);
  const clearFilters = useAppStore((s) => s.clearFilters);
  const sortBy = useAppStore((s) => s.sortBy);
  const setSortBy = useAppStore((s) => s.setSortBy);
  const relevanceMode = useAppStore((s) => s.relevanceMode);
  const setRelevanceMode = useAppStore((s) => s.setRelevanceMode);
  const addToast = useAppStore((s) => s.addToast);

  const views = useAllGrantViews();
  const filtered = filterGrants(
    views.map((v) => v.grant),
    appliedFilters,
  );
  const sorted = sortGrants(filtered, relevanceMode ? "fit" : sortBy);
  const viewById = new Map(views.map((v) => [v.grant.id, v]));

  const toggleIssue = (issue: Issue) => {
    const has = draftFilters.issues.includes(issue);
    const next = has ? draftFilters.issues.filter((i) => i !== issue) : [...draftFilters.issues, issue];
    setDraftFilters({ issues: next });
    applyFilters();
  };

  const toggleOrgType = (id: string) => {
    const has = draftFilters.orgTypes.includes(id);
    const next = has ? draftFilters.orgTypes.filter((t) => t !== id) : [...draftFilters.orgTypes, id];
    setDraftFilters({ orgTypes: next });
    applyFilters();
  };

  const toggleLocation = (name: string) => {
    const has = draftFilters.locations.includes(name);
    const next = has ? draftFilters.locations.filter((l) => l !== name) : [...draftFilters.locations, name];
    setDraftFilters({ locations: next });
    applyFilters();
  };

  const applyRange = () => {
    applyFilters();
    addToast("Filters applied.");
  };

  const findRelevant = () => {
    setRelevanceMode(true);
    addToast("Ranking grants by fit with your initiative profile.");
  };

  return (
    <div className="page-wide page-enter">
      <button onClick={() => navigate("/dashboard")} className="back-link">
        ← Back to dashboard
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, alignItems: "start" }}>
        <aside className="card" style={{ position: "sticky", top: 88, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Refine your search</div>
            <button onClick={clearFilters} className="btn-link" style={{ color: "var(--color-accent)" }}>
              Clear
            </button>
          </div>

          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Issue tags
          </div>
          <div className="tag-row" style={{ marginBottom: 20 }}>
            {ISSUES.map((issue) => {
              const active = draftFilters.issues.includes(issue);
              return (
                <button
                  key={issue}
                  onClick={() => toggleIssue(issue)}
                  className={`pill ${active ? "pill-neutral-selected" : "pill-neutral"}`}
                  style={{ cursor: "pointer" }}
                >
                  {issue}
                </button>
              );
            })}
          </div>

          <div className="eyebrow" style={{ marginBottom: 4 }}>
            Organization type
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginBottom: 10 }}>
            Show grants open to your kind of organization.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {ORG_TYPE_OPTIONS.map((t) => (
              <CheckboxRow
                key={t.id}
                checked={draftFilters.orgTypes.includes(t.id)}
                onToggle={() => toggleOrgType(t.id)}
                label={t.label}
                hint={t.hint}
              />
            ))}
          </div>

          <div className="eyebrow" style={{ marginBottom: 4 }}>
            Grant's Target Location
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginBottom: 10 }}>
            Where the grant's funding must be spent.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {LOCATION_OPTIONS.map((loc) => (
              <CheckboxRow
                key={loc}
                checked={draftFilters.locations.includes(loc)}
                onToggle={() => toggleLocation(loc)}
                label={loc}
              />
            ))}
          </div>

          <div className="eyebrow" style={{ margin: "0 0 10px" }}>
            Deadline (closing date)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6 }}>From</div>
              <input
                type="date"
                value={draftFilters.deadlineFrom}
                onChange={(e) => setDraftFilters({ deadlineFrom: e.target.value })}
                aria-label="Deadline from"
                className="input input-sm"
                style={{ background: "var(--color-surface-alt)" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6 }}>To</div>
              <input
                type="date"
                value={draftFilters.deadlineTo}
                onChange={(e) => setDraftFilters({ deadlineTo: e.target.value })}
                aria-label="Deadline to"
                className="input input-sm"
                style={{ background: "var(--color-surface-alt)" }}
              />
            </div>
          </div>

          <div className="eyebrow" style={{ margin: "0 0 10px" }}>
            Funding amount
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <input
              type="number"
              value={draftFilters.fundMin}
              onChange={(e) => setDraftFilters({ fundMin: Number(e.target.value) })}
              aria-label="Minimum funding amount"
              className="input input-sm"
            />
            <input
              type="number"
              value={draftFilters.fundMax}
              onChange={(e) => setDraftFilters({ fundMax: Number(e.target.value) })}
              aria-label="Maximum funding amount"
              className="input input-sm"
            />
          </div>
          <button onClick={applyRange} className="btn btn-secondary btn-sm btn-block">
            Apply
          </button>
        </aside>

        <div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
            <input
              value={draftFilters.query}
              onChange={(e) => setDraftFilters({ query: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search grants..."
              aria-label="Search grants"
              className="input"
              style={{ flex: 1, minWidth: 220 }}
            />
            <button onClick={applyFilters} className="btn btn-secondary">
              Search
            </button>
            <button onClick={findRelevant} className="btn btn-primary">
              ✦ Rank by my <JargonTerm termKey="profile">initiative profile</JargonTerm>
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0" }}>
            <div style={{ fontSize: 13.5, color: "var(--color-text-muted)" }}>{sorted.length} grants found</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setSortBy(s.key);
                    setRelevanceMode(false);
                  }}
                  className={`pill ${sortBy === s.key && !relevanceMode ? "pill-neutral-selected" : "pill-neutral"}`}
                  style={{ cursor: "pointer" }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {sorted.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No grants match your filters"
              body="Try removing an issue tag or organization type."
              action={
                <button onClick={clearFilters} className="btn btn-primary btn-sm">
                  Clear filters
                </button>
              }
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sorted.map((grant) => (
                <GrantCard key={grant.id} grant={grant} stage={viewById.get(grant.id)!.stage} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
