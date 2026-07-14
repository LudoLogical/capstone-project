"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ISSUES } from "@/types/constants";
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
import RadioRow from "@/components/RadioRow";
import GrantCard from "@/components/GrantCard";
import EmptyState from "@/components/EmptyState";

const SORTS: { key: SortOption; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "deadline", label: "Deadline" },
  { key: "amount", label: "Funding amount" },
];

const PRESET_ISSUES: readonly string[] = ISSUES;

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

  const [issueInput, setIssueInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  const views = useAllGrantViews();
  const filtered = filterGrants(
    views.map((v) => v.grant),
    appliedFilters,
  );
  const sorted = sortGrants(filtered, sortBy);
  const viewById = new Map(views.map((v) => [v.grant.id, v]));

  const customIssues = draftFilters.issues.filter(
    (i) => !PRESET_ISSUES.includes(i),
  );
  const customLocations = draftFilters.locations.filter(
    (l) => !LOCATION_OPTIONS.includes(l),
  );

  const toggleIssue = (issue: string) => {
    const has = draftFilters.issues.includes(issue);
    const next = has
      ? draftFilters.issues.filter((i) => i !== issue)
      : [...draftFilters.issues, issue];
    setDraftFilters({ issues: next });
    applyFilters();
  };

  const addIssue = () => {
    const value = issueInput.trim();
    setIssueInput("");
    if (!value || draftFilters.issues.includes(value)) return;
    setDraftFilters({ issues: [...draftFilters.issues, value] });
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

  const addLocation = () => {
    const value = locationInput.trim();
    setLocationInput("");
    if (!value || draftFilters.locations.includes(value)) return;
    setDraftFilters({ locations: [...draftFilters.locations, value] });
    applyFilters();
  };

  const applyRange = () => {
    applyFilters();
    addToast("Filters applied.");
  };

  const selectedOrgType = draftFilters.orgTypes[0] ?? "";

  return (
    <div className="animate-nc-rise mx-auto max-w-6xl px-8 pt-7 pb-20">
      <button
        onClick={() => router.push("/")}
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
          <div className="mb-2.5 flex flex-wrap gap-2">
            {PRESET_ISSUES.map((issue) => {
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
            {customIssues.map((issue) => (
              <button
                key={issue}
                onClick={() => toggleIssue(issue)}
                className="inline-flex items-center gap-1 rounded-full border border-ink bg-ink px-3 py-1 text-xs font-bold text-white"
              >
                {issue} ✕
              </button>
            ))}
          </div>
          <div className="mb-5 flex gap-2">
            <input
              value={issueInput}
              onChange={(e) => setIssueInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIssue()}
              placeholder="Add your own tag"
              aria-label="Add a custom issue tag"
              className="min-w-0 flex-1 rounded-lg border border-border-strong bg-white px-3 py-2 text-xs text-ink outline-none focus:border-accent"
            />
            <button
              onClick={addIssue}
              className="rounded-lg border border-border-strong bg-white px-3 py-2 text-xs font-semibold text-ink transition duration-150 enabled:hover:border-accent"
            >
              Add
            </button>
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
          <div className="mb-2.5 flex flex-col gap-2">
            {LOCATION_OPTIONS.map((loc) => (
              <CheckboxRow
                key={loc}
                checked={draftFilters.locations.includes(loc)}
                onToggle={() => toggleLocation(loc)}
                label={loc}
              />
            ))}
            {customLocations.map((loc) => (
              <CheckboxRow
                key={loc}
                checked
                onToggle={() => toggleLocation(loc)}
                label={loc}
              />
            ))}
          </div>
          <div className="mb-5 flex gap-2">
            <input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLocation()}
              placeholder="Add your own location"
              aria-label="Add a custom target location"
              className="min-w-0 flex-1 rounded-lg border border-border-strong bg-white px-3 py-2 text-xs text-ink outline-none focus:border-accent"
            />
            <button
              onClick={addLocation}
              className="rounded-lg border border-border-strong bg-white px-3 py-2 text-xs font-semibold text-ink transition duration-150 enabled:hover:border-accent"
            >
              Add
            </button>
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
