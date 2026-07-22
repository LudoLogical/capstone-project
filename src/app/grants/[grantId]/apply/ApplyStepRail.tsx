"use client";

import { useRouter } from "next/navigation";
import type { WizardState } from "@/store/useAppStore";
import ResetWorkflowButton from "@/components/analysis/ResetWorkflowButton";
import { Check, Database, Lightbulb } from "lucide-react";

/** The sticky step rail beside the collection wizard. */
export default function ApplyStepRail({
  wizard,
  STEP_LABELS,
  STEP_GROUPS,
  REVIEW_STEP,
  ANALYSIS_STEP,
  analysisUnlocked,
  reviewHasSelection,
  setStep,
  resetAnalysis,
}: {
  wizard: WizardState;
  STEP_LABELS: string[];
  STEP_GROUPS: { title: string; steps: number[] }[];
  REVIEW_STEP: number;
  ANALYSIS_STEP: number;
  analysisUnlocked: boolean;
  reviewHasSelection: boolean;
  setStep: (step: number) => void;
  resetAnalysis: () => void;
}) {
  const router = useRouter();
  return (
    <aside className="sticky top-22 w-56 flex-none rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-3">
        {STEP_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="mb-1.5 px-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
              {group.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.steps.map((n) => {
                const label = STEP_LABELS[n - 1];
                const current = wizard.step === n;
                const visited = !!wizard.visited[n];
                // Analysis is locked exactly when Review has nothing selected -
                // the same condition that disables Review's own
                // "Save and analyze" button.
                const isAnalysis = n === ANALYSIS_STEP;
                const locked = isAnalysis && !reviewHasSelection;
                // Visiting Review isn't finishing it - it only counts as done
                // once the user has picked at least one data point and unlocked
                // the analysis from it.
                const done =
                  visited &&
                  !isAnalysis &&
                  (n !== REVIEW_STEP ||
                    (analysisUnlocked && reviewHasSelection));
                return (
                  <button
                    key={n}
                    onClick={() => {
                      if (!locked) setStep(n);
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
                      {/* Analysis always keeps its own icon, never a tick:
                          it's a destination, not a task to complete. */}
                      {locked || isAnalysis ? (
                        <Lightbulb size={12} />
                      ) : !current && done ? (
                        <Check size={12} />
                      ) : (
                        n
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
                      {label}
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
    </aside>
  );
}
