"use client";

import { REQUIREMENT_SUGGESTIONS } from "@/app/grants/[grantId]/report/reportModel";
import type Grant from "@/types/grant";
import BackButton from "@/components/primitives/BackButton";
import { BarChart3, ArrowRight } from "lucide-react";

/** The gate shown before a report starts: capture the funder's requirements. */
export default function ReportRequirementsGate({
  grant,
  reqDraft,
  setReqDraft,
  addRequirement,
  submitRequirements,
}: {
  grant: Grant;
  reqDraft: string;
  setReqDraft: (v: string) => void;
  addRequirement: (s: string) => void;
  submitRequirements: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl animate-nc-rise px-8 pt-7 pb-16">
      <BackButton fallback="/" />
      <h1 className="mb-2 font-serif text-3xl leading-tight font-bold">
        What does {grant.name} ask for in a report?
      </h1>
      <p className="mb-5 max-w-xl text-sm leading-relaxed text-ink-muted">
        Paste or type the reporting requirements for this grant. We&apos;ll use
        them to figure out what questions we need to ask to get the data
        you&apos;ll need for your report(s).
      </p>
      {/* Common requirements: tap to build the list without typing it out. */}
      <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
        Most grants ask for these - click to add
      </div>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {REQUIREMENT_SUGGESTIONS.map((s) => {
          const alreadyAdded = reqDraft.includes(s);
          return (
            <button
              key={s}
              onClick={() => addRequirement(s)}
              disabled={alreadyAdded}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition duration-150 ${
                alreadyAdded
                  ? "cursor-default border-success-border bg-success-bg text-success-ink"
                  : "border-border-strong bg-white text-ink-muted hover:border-accent hover:text-ink"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
      <textarea
        value={reqDraft}
        onChange={(e) => setReqDraft(e.target.value)}
        autoFocus
        placeholder="e.g. A narrative summary of outcomes, number of residents served, a budget-to-actuals table, and two participant stories."
        className="mb-4 min-h-44 w-full resize-y rounded-xl border border-border-strong bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-accent"
      />
      <div className="flex gap-2.5">
        <button
          onClick={submitRequirements}
          disabled={!reqDraft.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
        >
          Start report <ArrowRight size={16} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}
