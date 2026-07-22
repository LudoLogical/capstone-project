"use client";

import { useState } from "react";
import type { ReviewGroup } from "@/app/grants/[grantId]/report/reportModel";
import DeleteDataConfirmModal from "@/components/modals/DeleteDataConfirmModal";
import { Check, X, ArrowLeft, ArrowRight } from "lucide-react";

/** Step 6: the consolidated review of every data point gathered. */
export default function ReportReviewStep({
  reviewGroups,
  isComplete,
  toggleReviewItem,
  allReviewPicked,
  toggleAllReviewPicked,
  reviewHasSelection,
  deleteReviewItem,
  dontAskDeleteFound,
  setDontAskDeleteFound,
  setStep,
  saveAndContinue,
}: {
  reviewGroups: ReviewGroup[];
  isComplete: (n: number) => boolean;
  toggleReviewItem: (stepId: ReviewGroup["stepId"], itemId: string) => void;
  allReviewPicked: boolean;
  toggleAllReviewPicked: () => void;
  // Nothing to analyze until at least one data point is checked. Supplied by
  // the page so this button and the rail's Analysis step agree.
  reviewHasSelection: boolean;
  deleteReviewItem: (stepId: ReviewGroup["stepId"], itemId: string) => void;
  dontAskDeleteFound: boolean;
  setDontAskDeleteFound: () => void;
  setStep: (step: number) => void;
  saveAndContinue: (n: number) => void;
}) {
  const [pendingReviewDelete, setPendingReviewDelete] = useState<{
    stepId: ReviewGroup["stepId"];
    itemId: string;
  } | null>(null);
  return (
    <div>
      <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
        Review Your Data
      </h1>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
          Below is every data point we gathered from you. We will analyze every
          data point by default - remove any you don&apos;t want to analyze for
          your report.
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
          No data points yet. Go back through the sections to gather some.
        </p>
      ) : (
        reviewGroups.map((group) => (
          <div key={group.stepId} className="mb-5">
            <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
              {group.label}
            </div>
            <div className="flex flex-col gap-2.5">
              {group.items.map((it) => (
                <div
                  key={it.itemId}
                  className={`relative rounded-2xl border ${
                    it.picked
                      ? "border-accent bg-accent-tint"
                      : "border-border-strong bg-white"
                  }`}
                >
                  <button
                    onClick={() => toggleReviewItem(group.stepId, it.itemId)}
                    aria-pressed={it.picked}
                    className="flex w-full items-start gap-3 px-4 py-4 pr-11 text-left"
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 flex h-5.5 w-5.5 flex-none items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                        it.picked
                          ? "border-accent bg-accent"
                          : "border-ink-muted"
                      }`}
                    >
                      {it.picked ? <Check size={14} /> : null}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{it.label}</div>
                      <div className="text-xs text-ink-muted">{it.source}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      if (dontAskDeleteFound)
                        deleteReviewItem(group.stepId, it.itemId);
                      else
                        setPendingReviewDelete({
                          stepId: group.stepId,
                          itemId: it.itemId,
                        });
                    }}
                    aria-label={`Delete ${it.label}`}
                    title="Delete"
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-base text-ink-muted transition duration-150 hover:bg-white hover:text-accent-ink"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <div className="flex items-center justify-between gap-2.5">
        <button
          onClick={() => setStep(5)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={16} className="shrink-0" /> Previous step
        </button>
        <button
          onClick={() => saveAndContinue(6)}
          disabled={!reviewHasSelection}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isComplete(6) ? (
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

      <DeleteDataConfirmModal
        open={pendingReviewDelete !== null}
        onClose={() => setPendingReviewDelete(null)}
        onConfirm={() => {
          if (pendingReviewDelete)
            deleteReviewItem(
              pendingReviewDelete.stepId,
              pendingReviewDelete.itemId,
            );
          setPendingReviewDelete(null);
        }}
        onConfirmDontAsk={() => {
          setDontAskDeleteFound();
          if (pendingReviewDelete)
            deleteReviewItem(
              pendingReviewDelete.stepId,
              pendingReviewDelete.itemId,
            );
          setPendingReviewDelete(null);
        }}
      />
    </div>
  );
}
