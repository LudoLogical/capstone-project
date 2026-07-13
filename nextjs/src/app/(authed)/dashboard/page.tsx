"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-2 font-serif text-xl">
        {view.grant.purpose.split(".")[0]}
      </div>
      <div className="mb-2.5 text-sm text-ink-muted">
        {view.grant.grantor} · {formatCurrency(view.grant.award.totalAmount)}
      </div>
      <p className="mb-4 max-w-xl text-sm leading-relaxed text-ink-muted">
        {view.alignmentAnalysis ?? view.grant.purpose}
      </p>
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => router.push(primaryTo)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {primaryLabel}
        </button>
        <button
          onClick={() => router.push(`/grants/${view.grant.id}`)}
          className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          View grant
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
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
    router.push("/search");
  };

  const findRelevant = () => {
    setRelevanceMode(true);
    setDraftFilters({});
    applyFilters();
    router.push("/search");
  };

  const dashPick = (issue: (typeof ISSUES)[number]) => {
    setDraftFilters({ issues: [issue] });
    applyFilters();
    router.push("/search");
  };

  return (
    <div className="animate-nc-rise mx-auto max-w-5xl px-8 pt-10 pb-20">
      <h1 className="mb-4 font-serif text-4xl leading-tight font-medium">
        Hello, {SESSION_USER.firstName}.
      </h1>

      <div className="mb-8 rounded-2xl border border-border bg-surface p-6">
        <div className="mb-1 text-sm font-semibold">
          Find the perfect grant opportunity
        </div>
        <p className="mb-3.5 text-sm leading-normal text-ink-muted">
          Type what you&apos;re looking for and hit <strong>Search</strong>, pick
          an issue tag below, or let AI rank grants by how well they fit your
          work.
        </p>
        <div className="flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goSearch()}
            aria-label="Search for grants by keyword"
            placeholder="e.g. health programs in Pittsburgh"
            className="w-full min-w-72 flex-1 rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none"
          />
          <button
            onClick={goSearch}
            className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </button>
          <button
            onClick={findRelevant}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✦ Find grants relevant to me
          </button>
        </div>
        <div className="mt-4">
          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Or filter by issue tag
          </div>
          <div className="flex flex-wrap gap-2">
            {ISSUES.map((issue) => (
              <button
                key={issue}
                onClick={() => dashPick(issue)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-strong bg-surface-alt px-3 py-1 text-xs font-bold text-ink-secondary"
              >
                {issue}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 text-xs text-ink-muted">
          Your data remains private and is not used to train our AI.{" "}
          <HowAIModal />
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-border-soft">
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
            className={`border-b-2 px-4 py-3 text-sm font-semibold text-ink ${
              tab === key ? "border-accent" : "border-transparent"
            }`}
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
          <div className="flex flex-col gap-3.5">
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
          <div className="flex flex-col gap-3.5">
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
                onClick={() => router.push("/search")}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Browse grants
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3.5">
            {saved.map((v) => (
              <div
                key={v.grant.id}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-60 flex-1">
                    <div
                      onClick={() => router.push(`/grants/${v.grant.id}`)}
                      role="button"
                      tabIndex={0}
                      className="mb-1 cursor-pointer font-serif text-xl"
                    >
                      {v.grant.purpose.split(".")[0]}
                    </div>
                    <div className="mb-2.5 text-sm text-ink-muted">
                      {v.grant.grantor} ·{" "}
                      {formatCurrency(v.grant.award.totalAmount)}
                    </div>
                    <p className="text-sm leading-normal text-ink-muted">
                      {v.grant.purpose}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      onClick={() => router.push(`/grants/${v.grant.id}`)}
                      className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Open grant →
                    </button>
                    <button
                      onClick={() =>
                        setStage(v.grant.id, GrantLifecycleStage.Unsaved)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
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
