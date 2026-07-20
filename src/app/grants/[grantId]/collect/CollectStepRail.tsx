"use client";

import { useRouter } from "next/navigation";
import type Grant from "@/types/grant";
import type { WizardState } from "@/store/useAppStore";
import { Bookmark, Check } from "lucide-react";

/** The sticky step rail beside the collection wizard. */
export default function CollectStepRail({
  grant,
  wizard,
  STEP_LABELS,
  STEP_GROUPS,
  ANALYSIS_STEP,
  analysisUnlocked,
  setStep,
}: {
  grant: Grant;
  wizard: WizardState;
  STEP_LABELS: string[];
  STEP_GROUPS: { title: string; steps: number[] }[];
  ANALYSIS_STEP: number;
  analysisUnlocked: boolean;
  setStep: (step: number) => void;
}) {
  const router = useRouter();
  return (
    <aside className="sticky top-22 w-56 flex-none rounded-2xl border border-border bg-surface p-4">
      <div className="mb-1 text-sm font-bold">{grant.name}</div>
      <button
        onClick={() => router.push("/account")}
        className="mb-4 inline-block p-0 text-xs font-semibold text-accent-ink-2 underline"
      >
        Manage Your Data
      </button>
      <div className="flex flex-col gap-3">
        {STEP_GROUPS.map((group, gi) => (
          <div
            key={group.title}
            className={gi > 0 ? "border-t border-divider-2 pt-3" : ""}
          >
            <div className="mb-1.5 px-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
              {group.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.steps.map((n) => {
                const label = STEP_LABELS[n - 1];
                const current = wizard.step === n;
                const visited = !!wizard.visited[n];
                // Analysis stays locked until unlocked from Review.
                const locked = n === ANALYSIS_STEP && !analysisUnlocked;
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
                          : !locked && visited
                            ? "bg-success-ink-2 text-white"
                            : "bg-divider-2 text-ink-muted"
                      }`}
                    >
                      {locked ? (
                        <Bookmark size={11} />
                      ) : !current && visited ? (
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
      </div>
    </aside>
  );
}
