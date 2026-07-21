"use client";

import { RUEA_SECTIONS } from "@/data/seed";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

/** Step 2: review the data we found and opt each point in or out. */
export default function ApplyReviewStep({
  isFound,
  toggleFound,
  allFound,
  toggleAllFound,
  analysisUnlocked,
  unlockAnalysis,
  setStep,
  REVIEW_STEP,
}: {
  isFound: (id: string) => boolean;
  toggleFound: (id: string) => void;
  allFound: boolean;
  toggleAllFound: () => void;
  analysisUnlocked: boolean;
  unlockAnalysis: () => void;
  setStep: (step: number) => void;
  REVIEW_STEP: number;
}) {
  // Nothing to analyze until at least one data point is checked.
  const anyFound = RUEA_SECTIONS.some((s) => isFound(s.id));
  return (
    <div>
      <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
        Review Your Data
      </h1>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
          Based on the data sources you approved and data from the Vibrancy
          Portal, we identified {RUEA_SECTIONS.length + " "} data points that
          are relevant to this grant. Select the ones that you&apos;d like to
          learn more about.
        </p>
        <button
          onClick={toggleAllFound}
          className="inline-flex flex-none items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
        >
          {allFound ? "Deselect all" : "Select all"}
        </button>
      </div>
      <div className="mb-5 flex flex-col gap-2.5">
        {RUEA_SECTIONS.map((s) => {
          const selected = isFound(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggleFound(s.id)}
              aria-pressed={selected}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left ${
                selected
                  ? "border-accent bg-accent-tint-soft"
                  : "border-border bg-surface"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-5.5 w-5.5 flex-none items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                  selected ? "border-accent bg-accent" : "border-ink-muted"
                }`}
              >
                {selected ? <Check size={14} /> : null}
              </span>
              <div>
                <div className="text-sm font-semibold">
                  {s.analysis.datum.content}
                </div>
                <div className="text-xs text-ink-muted">
                  {s.analysis.datum.citation}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-2.5">
        <button
          onClick={() => setStep(REVIEW_STEP - 1)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={16} className="shrink-0" /> Previous step
        </button>
        <button
          onClick={unlockAnalysis}
          disabled={!anyFound}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analysisUnlocked ? (
            <>
              See updated analysis <ArrowRight size={16} className="shrink-0" />
            </>
          ) : (
            <>
              Save and analyze <ArrowRight size={16} className="shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
