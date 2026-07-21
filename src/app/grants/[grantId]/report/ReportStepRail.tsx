"use client";

import { useRouter } from "next/navigation";
import { STEP_GROUPS } from "@/app/grants/[grantId]/report/reportModel";
import type { ReportState } from "@/store/useAppStore";
import ResetWorkflowButton from "@/components/analysis/ResetWorkflowButton";
import { Bookmark, Database } from "lucide-react";

/** The sticky step rail beside the report flow. */
export default function ReportStepRail({
  report,
  isComplete,
  setStep,
  resetAnalysis,
}: {
  report: ReportState;
  isComplete: (n: number) => boolean;
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
              {group.steps.map((s) => {
                const current = report.step === s.n;
                // The Analysis step stays locked until the Review is
                // completed (via "Unlock your analysis").
                const locked = s.n === 7 && !isComplete(6);
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
                          : "bg-divider-2 text-ink-muted"
                      }`}
                    >
                      {locked ? <Bookmark size={11} /> : s.n}
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
              <Database size={11} />
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
