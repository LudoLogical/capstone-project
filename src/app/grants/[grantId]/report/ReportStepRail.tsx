"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STEP_GROUPS } from "@/app/grants/[grantId]/report/reportModel";
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
  editRequirements,
}: {
  report: ReportState;
  isComplete: (n: number) => boolean;
  reviewHasSelection: boolean;
  setStep: (step: number) => void;
  resetAnalysis: () => void;
  editRequirements: () => void;
}) {
  const router = useRouter();
  const [requirementsOpen, setRequirementsOpen] = useState(false);
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
        {STEP_GROUPS.map((group) => (
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
                const isAnalysis = s.n === 7;
                const locked = isAnalysis && !reviewHasSelection;
                // Visiting Review isn't finishing it - it only counts as done
                // once the user has picked at least one data point and unlocked
                // the analysis from it.
                const done = s.n === 6 && isComplete(6) && reviewHasSelection;
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
                    <div
                      className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${
                        current
                          ? "bg-accent text-white"
                          : done
                            ? "bg-success-ink-2 text-white"
                            : "bg-divider-2 text-ink-muted"
                      }`}
                    >
                      {/* Analysis always keeps its own icon rather than a step
                          number: it's a destination, not a numbered task. */}
                      {isAnalysis ? (
                        <Lightbulb size={12} />
                      ) : !current && done ? (
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
        <div className="mb-5 max-h-56 overflow-y-auto rounded-xl border border-border-soft bg-surface p-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-body">
            {report.requirements}
          </p>
        </div>
        {/* Editing reopens the requirements gate, which replaces this page,
            so the modal closes with it. */}
        <button
          onClick={() => {
            setRequirementsOpen(false);
            editRequirements();
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 hover:bg-accent-ink-2 active:translate-y-px"
        >
          Edit
        </button>
      </Modal>
    </aside>
  );
}
