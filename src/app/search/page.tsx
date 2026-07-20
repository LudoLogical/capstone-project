"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAllGrantViews } from "@/store/derived";
import {
  ORG_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  ISSUE_TAGS,
  DEFAULT_FILTERS,
  filterGrants,
  sortGrants,
  type SortOption,
} from "@/data/selectors";
import { Search } from "lucide-react";
import CheckboxRow from "@/components/primitives/CheckboxRow";
import RadioRow from "@/components/primitives/RadioRow";
import RangeHistogram from "@/components/grants/RangeHistogram";
import GrantCard from "@/components/grants/GrantCard";
import EmptyState from "@/components/primitives/EmptyState";
import BackButton from "@/components/primitives/BackButton";
import Pagination from "@/components/primitives/Pagination";
import ShowMoreButton from "@/components/primitives/ShowMoreButton";

const SORTS: { key: SortOption; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "deadline", label: "Deadline" },
  { key: "amount", label: "Funding amount" },
];

// Funding-slider domain - kept in sync with the filter defaults so a full-range
// selection reads as "no min / no max".
const FUND_MIN = DEFAULT_FILTERS.fundMin;
const FUND_MAX = DEFAULT_FILTERS.fundMax;

// How many options to show before the "+ Show N more" expander.
const COLLAPSED_COUNT = 4;

// Results per page in the Explore list.
const RESULTS_PER_PAGE = 5;

export default function SearchPage() {
  const draftFilters = useAppStore((s) => s.draftFilters);
  const appliedFilters = useAppStore((s) => s.appliedFilters);
  const setDraftFilters = useAppStore((s) => s.setDraftFilters);
  const applyFilters = useAppStore((s) => s.applyFilters);
  const clearFilters = useAppStore((s) => s.clearFilters);
  const sortBy = useAppStore((s) => s.sortBy);
  const setSortBy = useAppStore((s) => s.setSortBy);

  const [page, setPage] = useState(0);
  const [issuesExpanded, setIssuesExpanded] = useState(false);
  const [locationsExpanded, setLocationsExpanded] = useState(false);
  const selectedIssues = draftFilters.issues;

  const views = useAllGrantViews();
  const fundingAmounts = views.map((v) => v.grant.award.totalAmount);
  // Explore only lists grants you could still apply to; a closed window is not
  // an opportunity. Closed grants you already saved stay on your dashboard.
  const filtered = filterGrants(
    views.filter((v) => !v.isClosed).map((v) => v.grant),
    appliedFilters,
  );
  const sorted = sortGrants(filtered, sortBy);
  // Results are paged so the list stays scannable rather than endless.
  const pageCount = Math.max(1, Math.ceil(sorted.length / RESULTS_PER_PAGE));
  // Keep the page in range as filters narrow the results under it.
  const safePage = Math.min(page, pageCount - 1);
  const pageResults = sorted.slice(
    safePage * RESULTS_PER_PAGE,
    safePage * RESULTS_PER_PAGE + RESULTS_PER_PAGE,
  );
  const viewById = new Map(views.map((v) => [v.grant.id, v]));

  const toggleIssue = (issue: string) => {
    const next = selectedIssues.includes(issue)
      ? selectedIssues.filter((i) => i !== issue)
      : [...selectedIssues, issue];
    setDraftFilters({ issues: next });
    applyFilters();
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

  const selectedOrgType = draftFilters.orgTypes[0] ?? "";

  const clearAll = () => clearFilters();

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
    <div className="animate-nc-rise mx-auto w-full max-w-6xl px-8 pt-7 pb-28">
      <BackButton fallback="/" />
      <div className="mb-6">
        <h1 className="font-serif text-3xl leading-tight font-bold">
          Find a grant that fits your work
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Search results are based on the information you&apos;ve shared with us
          about your organization.
        </p>
      </div>
      <div className="flex items-start gap-7">
        <aside className="top-22 w-80 flex-none rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="leading-tight font-bold text-ink">
              Refine your search
            </h3>
            <button
              onClick={clearAll}
              disabled={!hasChanges}
              className="p-0 text-xs font-semibold underline transition-colors duration-150 enabled:text-accent disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline"
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

          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Organization type
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
            Target Locations
          </div>
          <div className="mb-2.5 text-xs text-ink-muted">
            Where the grant funding must be spent.
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

          <div className="mb-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Application Period
          </div>
          <div className="mb-2.5 text-xs text-ink-muted">
            When applications are accepted.
          </div>
          <div className="mb-5 grid grid-cols-2 gap-2.5">
            <div>
              <div className="mb-1.5 text-xs font-bold text-ink-muted">
                From
              </div>
              <input
                type="date"
                value={draftFilters.deadlineFrom}
                onChange={(e) => {
                  setDraftFilters({ deadlineFrom: e.target.value });
                  applyFilters();
                }}
                aria-label="Deadline from"
                className="w-full rounded-lg border border-border-strong bg-surface-alt px-3 py-2.5 text-sm text-ink outline-none"
              />
            </div>
            <div>
              <div className="mb-1.5 text-xs font-bold text-ink-muted">To</div>
              <input
                type="date"
                value={draftFilters.deadlineTo}
                onChange={(e) => {
                  setDraftFilters({ deadlineTo: e.target.value });
                  applyFilters();
                }}
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
              onChange={(fundMin, fundMax) => {
                setDraftFilters({ fundMin, fundMax });
                applyFilters();
              }}
            />
          </div>
        </aside>

        <div className="w-full max-w-3xl flex-1">
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
              className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-6 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
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
              icon={Search}
              title="No grants match your criteria."
              body="Try changing your filters or searching for something else."
              action={
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              <div className="flex flex-col gap-3.5 w-full">
                {pageResults.map((grant) => (
                  <GrantCard
                    key={grant.id}
                    grant={grant}
                    saved={viewById.get(grant.id)!.isSaved}
                  />
                ))}
              </div>

              <Pagination
                page={safePage}
                pageCount={pageCount}
                onPageChange={setPage}
                className="mt-6"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
