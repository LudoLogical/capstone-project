"use client";

import { useState } from "react";
import { REQUIREMENT_SUGGESTIONS } from "@/app/grants/[grantId]/report/reportModel";
import { REPORTING_REQUIREMENTS } from "@/data/seed";
import type Grant from "@/types/grant";
import type { ReportingRequirement } from "@/types/grant";
import BackButton from "@/components/primitives/BackButton";
import { ArrowRight } from "lucide-react";

/**
 * The gate shown before a report starts: capture the funder's requirements.
 *
 * This is where a grant's reporting requirements come from - nothing has them
 * on file until the user supplies them here. They're also what the flow is
 * built out of, one question step apiece, so nothing else can start until
 * they're set.
 *
 * What the user writes is collected but not read: the requirements handed on
 * are the fixed `REPORTING_REQUIREMENTS`, which stand in for the AI that
 * generates them in production. See that constant for the swap.
 */
export default function ReportRequirementsGate({
  grant,
  current,
  submitRequirements,
}: {
  grant: Grant;
  // What the report already holds, when the user is amending rather than
  // starting. Empty on a fresh report.
  current: ReportingRequirement[];
  submitRequirements: (next: ReportingRequirement[]) => void;
}) {
  // Amending reopens this screen on what the report currently holds, so the
  // user edits what's there rather than retyping it.
  const [draft, setDraft] = useState(() =>
    current.map((r) => r.statement).join("\n"),
  );

  // Tapping a common requirement appends it as its own line, so the user can
  // build the list by clicking and still edit or add to it by hand.
  const addRequirement = (text: string) =>
    setDraft((d) =>
      d.includes(text) ? d : d.trim() ? `${d.trim()}\n${text}` : text,
    );

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
          const alreadyAdded = draft.includes(s);
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
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
        placeholder="e.g. A narrative summary of outcomes, number of residents served, a budget-to-actuals table, and two participant stories."
        className="mb-4 min-h-44 w-full resize-y rounded-xl border border-border-strong bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-accent"
      />
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => submitRequirements(REPORTING_REQUIREMENTS)}
          // The user still has to supply their requirements before the report
          // can start, even though it's the constant above that is read.
          disabled={!draft.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
        >
          {current.length > 0 ? "Save requirements" : "Start report"}{" "}
          <ArrowRight size={16} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}
