"use client";

import { useRouter } from "next/navigation";
import { ISSUES, type Issue } from "@/types/constants";
import { useAppStore } from "@/store/useAppStore";
import { useAllGrantViews } from "@/store/derived";
import {
  ORG_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  filterGrants,
  sortGrants,
  type SortOption,
} from "@/data/selectors";
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
  const router = useRouter();
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
    const next = has
      ? draftFilters.issues.filter((i) => i !== issue)
      : [...draftFilters.issues, issue];
    setDraftFilters({ issues: next });
    applyFilters();
  };

  const toggleOrgType = (id: string) => {
    const has = draftFilters.orgTypes.includes(id);
    const next = has
      ? draftFilters.orgTypes.filter((t) => t !== id)
      : [...draftFilters.orgTypes, id];
    setDraftFilters({ orgTypes: next });
    applyFilters();
  };

  const toggleLocation = (name: string) => {
    const has = draftFilters.locations.includes(name);
    const next = has
      ? draftFilters.locations.filter((l) => l !== name)
      : [...draftFilters.locations, name];
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
    <div className="mx-auto max-w-6xl px-8 pt-7 pb-20 animate-nc-rise">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 inline-block text-sm font-semibold text-ink-muted hover:text-ink"
      >
        ← Back to dashboard
      </button>
      <div className="flex items-start gap-7">
        <aside className="sticky top-22 w-64 flex-none rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-bold">Refine your search</div>
            <button
              onClick={clearFilters}
              className="p-0 text-xs font-semibold text-accent underline"
            >
              Clear
            </button>
          </div>

          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Issue tags
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            {ISSUES.map((issue) => {
              const active = draftFilters.issues.includes(issue);
              return (
                <button
                  key={issue}
                  onClick={() => toggleIssue(issue)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    active
                      ? "border border-ink bg-ink text-white"
                      : "border border-border-strong bg-surface-alt text-ink-secondary"
                  }`}
                >
                  {issue}
                </button>
              );
            })}
          </div>

          <div className="mb-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Organization type
          </div>
          <div className="mb-2.5 text-xs text-ink-muted">
            Show grants open to your kind of organization.
          </div>
          <div className="mb-5 flex flex-col gap-2">
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

          <div className="mb-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Grant&apos;s Target Location
          </div>
          <div className="mb-2.5 text-xs text-ink-muted">
            Where the grant&apos;s funding must be spent.
          </div>
          <div className="mb-5 flex flex-col gap-2">
            {LOCATION_OPTIONS.map((loc) => (
              <CheckboxRow
                key={loc}
                checked={draftFilters.locations.includes(loc)}
                onToggle={() => toggleLocation(loc)}
                label={loc}
              />
            ))}
          </div>

          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Deadline (closing date)
          </div>
          <div className="mb-5 grid grid-cols-2 gap-2.5">
            <div>
              <div className="mb-1.5 text-xs font-bold text-ink-muted">
                From
              </div>
              <input
                type="date"
                value={draftFilters.deadlineFrom}
                onChange={(e) =>
                  setDraftFilters({ deadlineFrom: e.target.value })
                }
                aria-label="Deadline from"
                className="w-full rounded-lg border border-border-strong bg-surface-alt px-3 py-2.5 text-sm text-ink outline-none"
              />
            </div>
            <div>
              <div className="mb-1.5 text-xs font-bold text-ink-muted">To</div>
              <input
                type="date"
                value={draftFilters.deadlineTo}
                onChange={(e) =>
                  setDraftFilters({ deadlineTo: e.target.value })
                }
                aria-label="Deadline to"
                className="w-full rounded-lg border border-border-strong bg-surface-alt px-3 py-2.5 text-sm text-ink outline-none"
              />
            </div>
          </div>

          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Funding amount
          </div>
          <div className="mb-3.5 grid grid-cols-2 gap-2.5">
            <input
              type="number"
              value={draftFilters.fundMin}
              onChange={(e) =>
                setDraftFilters({ fundMin: Number(e.target.value) })
              }
              aria-label="Minimum funding amount"
              className="w-full rounded-lg border border-border-strong bg-white px-3 py-2.5 text-sm text-ink outline-none"
            />
            <input
              type="number"
              value={draftFilters.fundMax}
              onChange={(e) =>
                setDraftFilters({ fundMax: Number(e.target.value) })
              }
              aria-label="Maximum funding amount"
              className="w-full rounded-lg border border-border-strong bg-white px-3 py-2.5 text-sm text-ink outline-none"
            />
          </div>
          <button
            onClick={applyRange}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <input
              value={draftFilters.query}
              onChange={(e) => setDraftFilters({ query: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search grants..."
              aria-label="Search grants"
              className="w-full min-w-56 flex-1 rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none"
            />
            <button
              onClick={applyFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Search
            </button>
            <button
              onClick={findRelevant}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✦ Rank by my{" "}
              <JargonTerm termKey="profile">initiative profile</JargonTerm>
            </button>
          </div>

          <div className="my-4 flex items-center justify-between">
            <div className="text-sm text-ink-muted">
              {sorted.length} grants found
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setSortBy(s.key);
                    setRelevanceMode(false);
                  }}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    sortBy === s.key && !relevanceMode
                      ? "border border-ink bg-ink text-white"
                      : "border border-border-strong bg-surface-alt text-ink-secondary"
                  }`}
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
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="flex flex-col gap-3.5">
              {sorted.map((grant) => (
                <GrantCard
                  key={grant.id}
                  grant={grant}
                  stage={viewById.get(grant.id)!.stage}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
