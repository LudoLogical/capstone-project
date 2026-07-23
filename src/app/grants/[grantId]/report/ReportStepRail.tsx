"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CONTEXT_STEP,
  analysisStep,
  requirementIndexForStep,
  reviewStep,
  stepGroups,
} from "@/app/grants/[grantId]/report/reportModel";
import type { ReportState } from "@/store/useAppStore";
import ResetWorkflowButton from "@/components/analysis/ResetWorkflowButton";
import Modal from "@/components/primitives/Modal";
import { Check, Clipboard, Database, Lightbulb } from "lucide-react";

/** The sticky step rail beside the report flow. */
export default function ReportStepRail({
  report,
  isComplete,
  reviewHasSelection,
  setStep,
  resetAnalysis,
}: {
  report: ReportState;
  isComplete: (n: number) => boolean;
  reviewHasSelection: boolean;
  setStep: (step: number) => void;
  resetAnalysis: () => void;
}) {
  const router = useRouter();
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const groups = stepGroups(report.requirements);
  const REVIEW_STEP = reviewStep(report.requirements.length);
  const ANALYSIS_STEP = analysisStep(report.requirements.length);
  return (
    <aside className="sticky top-22 w-56 flex-none rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col border-b border-divider-2 pb-3 mb-1.5">
          <button
            onClick={() => setRequirementsOpen(true)}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 text-left transition duration-150 hover:bg-surface-alt"
          >
            <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-divider-2 text-ink-muted">
              <Clipboard size={12} />
            </div>
            <span className="text-sm font-medium text-ink-muted">
              Requirements
            </span>
          </button>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <div className="mb-1.5 px-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
              {group.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.steps.map((s) => {
                const current = report.step === s.n;
                // Analysis is locked exactly when Review has nothing selected -
                // the same condition that disables Review's own
                // "Save and analyze" button.
                const isAnalysis = s.n === ANALYSIS_STEP;
                const locked = isAnalysis && !reviewHasSelection;
                const questionIndex = requirementIndexForStep(
                  s.n,
                  report.requirements.length,
                );
                // What counts as finished differs by step, so each says so for
                // itself:
                //  - sharing your context is done once you've moved past it;
                //    there is nothing to confirm.
                //  - a question is done when you tick it off inside the step.
                //    That's your call, not ours, so it holds even while you're
                //    still standing on it - the tick is the confirmation.
                //  - visiting Review isn't finishing it: it counts only once
                //    it has been saved with at least one data point selected.
                //  - Analysis is a destination rather than a task, so it is
                //    never marked done.
                const done =
                  s.n === CONTEXT_STEP
                    ? !current
                    : questionIndex !== null
                      ? !!report.conversations[questionIndex]?.markedComplete
                      : s.n === REVIEW_STEP
                        ? !current &&
                          isComplete(REVIEW_STEP) &&
                          reviewHasSelection
                        : false;
                return (
                  <button
                    key={s.n}
                    onClick={() => {
                      if (!locked) setStep(s.n);
                    }}
                    disabled={locked}
                    aria-current={current ? "step" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg border px-2 py-2 text-left transition duration-150 ${
                      current
                        ? "border-accent bg-accent-tint"
                        : "border-transparent hover:bg-surface-alt"
                    } ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {/* Finished wins over current: a step you've ticked off
                        stays ticked off while you're looking at it. Which one
                        you're on is still carried by the row's own accent
                        border and bold label. */}
                    <div
                      className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? "bg-success-ink-2 text-white"
                          : current
                            ? "bg-accent text-white"
                            : "bg-divider-2 text-ink-muted"
                      }`}
                    >
                      {/* Analysis always keeps its own icon rather than a step
                          number: it's a destination, not a numbered task. */}
                      {isAnalysis ? (
                        <Lightbulb size={12} />
                      ) : done ? (
                        <Check size={12} />
                      ) : (
                        s.n
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        current
                          ? "font-bold text-ink"
                          : locked
                            ? "font-medium text-ink-muted"
                            : "font-medium text-ink-muted"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex flex-col border-t border-divider-2 pt-3">
          <button
            onClick={() => router.push("/account")}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 text-left transition duration-150 hover:bg-surface-alt"
          >
            <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-divider-2 text-ink-muted">
              <Database size={12} />
            </div>
            <span className="text-sm font-medium text-ink-muted">
              Manage your data
            </span>
          </button>
          <ResetWorkflowButton onReset={resetAnalysis} />
        </div>
      </div>

      <Modal
        open={requirementsOpen}
        onClose={() => setRequirementsOpen(false)}
        title="Reporting requirements"
      >
        <div className="mb-5 flex max-h-56 flex-col gap-3 overflow-y-auto rounded-xl border border-border-soft bg-surface p-3">
          {report.requirements.map((r) => (
            <div key={r.statement}>
              <div className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                {r.shortName}
              </div>
              <p className="text-sm leading-relaxed text-ink-body">
                {r.statement}
              </p>
            </div>
          ))}
        </div>
        {/* There is no Edit here: the steps above are generated from these
            requirements, so changing one would strand the conversation it
            belongs to. Starting over is the only coherent way to change them. */}
        <p className="text-sm leading-relaxed text-ink-muted">
          The steps of this workflow are generated from the requirements above,
          so you can&apos;t change them unless you start over using the
          &quot;reset this workfow&quot; button at the bottom of the sidebar.
        </p>
      </Modal>
    </aside>
  );
}
