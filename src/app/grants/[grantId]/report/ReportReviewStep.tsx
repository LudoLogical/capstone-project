"use client";

import type { ReviewGroup } from "@/app/grants/[grantId]/report/reportModel";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";

/**
 * The consolidated review: every data point the assistant raised while the user
 * worked through the questions, grouped by the question that raised it.
 *
 * Nothing is filtered out - a data point the user never approved is still one
 * they were shown, and seeing the whole set is the point of this step. The tick
 * is the same approval the question steps write, so unticking here unlights the
 * chip back there, and vice versa.
 */
export default function ReportReviewStep({
  reviewGroups,
  isComplete,
  toggleApproved,
  allReviewPicked,
  toggleAllReviewPicked,
  reviewHasSelection,
  reviewStep,
  setStep,
  saveAndContinue,
}: {
  reviewGroups: ReviewGroup[];
  isComplete: (n: number) => boolean;
  toggleApproved: (id: number) => void;
  allReviewPicked: boolean;
  toggleAllReviewPicked: () => void;
  // Nothing to analyze until at least one data point is approved. Supplied by
  // the page so this button and the rail's Analysis step agree.
  reviewHasSelection: boolean;
  reviewStep: number;
  setStep: (step: number) => void;
  saveAndContinue: (n: number) => void;
}) {
  return (
    <div>
      <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
        Review Your Data
      </h1>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
          Below is every data point we surfaced while you worked through each
          question. The ones you approved are checked - uncheck any you
          don&apos;t want analyzed, or check something you passed over.
        </p>
        {reviewGroups.length > 0 && (
          <button
            onClick={toggleAllReviewPicked}
            className="inline-flex flex-none items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
          >
            {allReviewPicked ? "Deselect all" : "Select all"}
          </button>
        )}
      </div>

      {reviewGroups.length === 0 ? (
        <p className="mb-5 rounded-2xl border border-dashed border-border-strong px-4 py-8 text-center text-sm text-ink-muted">
          No data points yet. Go back through the questions to gather some.
        </p>
      ) : (
        reviewGroups.map((group) => (
          <div key={group.requirementIndex} className="mb-5">
            <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
              {group.label}
            </div>
            <div className="flex flex-col gap-2.5">
              {group.items.map(({ datum, approved }) => (
                <button
                  key={datum.id}
                  onClick={() => toggleApproved(datum.id)}
                  aria-pressed={approved}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left ${
                    approved
                      ? "border-accent bg-accent-tint"
                      : "border-border-strong bg-white"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-5.5 w-5.5 flex-none items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                      approved ? "border-accent bg-accent" : "border-ink-muted"
                    }`}
                  >
                    {approved ? <Check size={14} /> : null}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      {datum.content}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {datum.citation}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))
      )}

      <div className="flex items-center justify-between gap-2.5">
        <button
          onClick={() => setStep(reviewStep - 1)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={16} className="shrink-0" /> Previous step
        </button>
        <button
          onClick={() => saveAndContinue(reviewStep)}
          disabled={!reviewHasSelection}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isComplete(reviewStep) ? (
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
