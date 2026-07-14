"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAllGrantViews } from "@/store/derived";
import {
  ORG_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  DEFAULT_FILTERS,
  filterGrants,
  sortGrants,
  type SortOption,
} from "@/data/selectors";
import CheckboxRow from "@/components/CheckboxRow";
import RadioRow from "@/components/RadioRow";
import RangeHistogram from "@/components/RangeHistogram";
import GrantCard from "@/components/GrantCard";
import EmptyState from "@/components/EmptyState";

const SORTS: { key: SortOption; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "deadline", label: "Deadline" },
  { key: "amount", label: "Funding amount" },
];

// Issue tags shown in the search filter. These are broader than the canonical
// `ISSUES` used on grant data, so selecting them is a UI-only refinement (they
// don't narrow results) — the full list is scrollable once expanded.
const ISSUE_TAGS: readonly string[] = [
  "Arts",
  "Black-Led",
  "Community Development",
  "Disabilities",
  "Education",
  "Environment/EJ",
  "Faith-Based",
  "Food",
  "Health/Wellness",
  "Housing",
  "Innovation",
  "Justice/Equality",
  "Literary",
  "Mothers",
  "Queer Led/Serving",
  "Recreation",
  "Social Services",
  "Sustainability",
  "Technology",
  "Water",
  "Women-Led",
  "Workforce Development",
  "Youth",
];

// Funding-slider domain — kept in sync with the filter defaults so a full-range
// selection reads as "no min / no max".
const FUND_MIN = DEFAULT_FILTERS.fundMin;
const FUND_MAX = DEFAULT_FILTERS.fundMax;

// How many options to show before the "+ Show N more" expander.
const COLLAPSED_COUNT = 4;

function ShowMoreButton({
  expanded,
  hiddenCount,
  onToggle,
}: {
  expanded: boolean;
  hiddenCount: number;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="mt-0.5 self-start text-xs font-bold text-ink-secondary underline underline-offset-2 transition-colors duration-150 hover:text-ink"
    >
      {expanded ? "− Show less" : `+ Show ${hiddenCount} more`}
    </button>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const draftFilters = useAppStore((s) => s.draftFilters);
  const appliedFilters = useAppStore((s) => s.appliedFilters);
  const setDraftFilters = useAppStore((s) => s.setDraftFilters);
  const applyFilters = useAppStore((s) => s.applyFilters);
  const clearFilters = useAppStore((s) => s.clearFilters);
  const sortBy = useAppStore((s) => s.sortBy);
  const setSortBy = useAppStore((s) => s.setSortBy);
  const addToast = useAppStore((s) => s.addToast);

  const [issuesExpanded, setIssuesExpanded] = useState(false);
  const [locationsExpanded, setLocationsExpanded] = useState(false);
  // Issue tags are a UI-only refinement, so their selection lives here rather
  // than in the grant filter state.
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);

  const views = useAllGrantViews();
  const fundingAmounts = views.map((v) => v.grant.award.totalAmount);
  const filtered = filterGrants(
    views.map((v) => v.grant),
    appliedFilters,
  );
  const sorted = sortGrants(filtered, sortBy);
  const viewById = new Map(views.map((v) => [v.grant.id, v]));

  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue)
        ? prev.filter((i) => i !== issue)
        : [...prev, issue],
    );
  };

  const selectOrgType = (id: string) => {
    setDraftFilters({ orgTypes: id ? [id] : [] });
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
    addToast("Funding filter applied.");
  };

  const selectedOrgType = draftFilters.orgTypes[0] ?? "";

  const clearAll = () => {
    clearFilters();
    setSelectedIssues([]);
  };

  // "Clear" only does something when the draft differs from the defaults.
  const hasChanges =
    selectedIssues.length > 0 ||
    draftFilters.query !== DEFAULT_FILTERS.query ||
    draftFilters.orgTypes.length > 0 ||
    draftFilters.locations.length > 0 ||
    draftFilters.deadlineFrom !== DEFAULT_FILTERS.deadlineFrom ||
    draftFilters.deadlineTo !== DEFAULT_FILTERS.deadlineTo ||
    draftFilters.fundMin !== DEFAULT_FILTERS.fundMin ||
    draftFilters.fundMax !== DEFAULT_FILTERS.fundMax;

  return (
    <div className="animate-nc-rise mx-auto max-w-6xl px-8 pt-7 pb-20">
      <button
        onClick={() => router.push("/")}
        className="mb-4 inline-block text-sm font-semibold text-ink-muted hover:text-ink"
      >
        ← Back to dashboard
      </button>
      <div className="flex items-start gap-7">
        <aside className="sticky top-22 w-80 flex-none rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-bold">Refine your search</div>
            <button
              onClick={clearAll}
              disabled={!hasChanges}
              className="p-0 text-xs font-semibold underline transition-colors duration-150 enabled:text-accent disabled:cursor-not-allowed disabled:text-ink-faint disabled:no-underline"
            >
              Clear
            </button>
          </div>

          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Issue tags
          </div>
          <div className="mb-5">
            <div
              className={`flex flex-col gap-2.5 rounded-xl border border-border-soft bg-surface p-3 ${
                issuesExpanded ? "max-h-56 overflow-y-auto" : ""
              }`}
            >
              {(issuesExpanded
                ? ISSUE_TAGS
                : ISSUE_TAGS.slice(0, COLLAPSED_COUNT)
              ).map((issue) => (
                <CheckboxRow
                  key={issue}
                  checked={selectedIssues.includes(issue)}
                  onToggle={() => toggleIssue(issue)}
                  label={issue}
                />
              ))}
            </div>
            {ISSUE_TAGS.length > COLLAPSED_COUNT && (
              <div className="mt-2.5">
                <ShowMoreButton
                  expanded={issuesExpanded}
                  hiddenCount={ISSUE_TAGS.length - COLLAPSED_COUNT}
                  onToggle={() => setIssuesExpanded((v) => !v)}
                />
              </div>
            )}
          </div>

          <div className="mb-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Organization type
          </div>
          <div className="mb-2.5 text-xs text-ink-muted">
            Show grants open to your kind of organization.
          </div>
          <div className="mb-5 flex flex-col gap-2">
            <RadioRow
              checked={selectedOrgType === ""}
              onSelect={() => selectOrgType("")}
              label="Any organization type"
            />
            {ORG_TYPE_OPTIONS.map((t) => (
              <RadioRow
                key={t.id}
                checked={selectedOrgType === t.id}
                onSelect={() => selectOrgType(t.id)}
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
          <div className="mb-5">
            <div
              className={`flex flex-col gap-2.5 rounded-xl border border-border-soft bg-surface p-3 ${
                locationsExpanded ? "max-h-56 overflow-y-auto" : ""
              }`}
            >
              {(locationsExpanded
                ? LOCATION_OPTIONS
                : LOCATION_OPTIONS.slice(0, COLLAPSED_COUNT)
              ).map((loc) => (
                <CheckboxRow
                  key={loc}
                  checked={draftFilters.locations.includes(loc)}
                  onToggle={() => toggleLocation(loc)}
                  label={loc}
                />
              ))}
            </div>
            {LOCATION_OPTIONS.length > COLLAPSED_COUNT && (
              <div className="mt-2.5">
                <ShowMoreButton
                  expanded={locationsExpanded}
                  hiddenCount={LOCATION_OPTIONS.length - COLLAPSED_COUNT}
                  onToggle={() => setLocationsExpanded((v) => !v)}
                />
              </div>
            )}
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
          <div className="mb-3.5">
            <RangeHistogram
              min={FUND_MIN}
              max={FUND_MAX}
              step={1000}
              valueMin={draftFilters.fundMin}
              valueMax={draftFilters.fundMax}
              amounts={fundingAmounts}
              onChange={(fundMin, fundMax) =>
                setDraftFilters({ fundMin, fundMax })
              }
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
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Search
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
                  onClick={() => setSortBy(s.key)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    sortBy === s.key
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
