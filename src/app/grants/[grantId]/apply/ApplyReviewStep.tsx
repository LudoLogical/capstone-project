"use client";

import { RUEA_SECTIONS } from "@/data/seed";
import type { WizardState } from "@/store/useAppStore";
import AddDataChatBox from "@/components/inputs/AddDataChatBox";
import { ArrowRight, Check, X } from "lucide-react";

/** Step 2: review the data we found and opt each point in or out. */
export default function CollectReviewStep({
  wizard,
  isFound,
  toggleFound,
  allFound,
  toggleAllFound,
  addCustomFound,
  removeCustomFound,
  analysisUnlocked,
  unlockAnalysis,
  setStep,
  REVIEW_STEP,
}: {
  wizard: WizardState;
  isFound: (id: string) => boolean;
  toggleFound: (id: string) => void;
  allFound: boolean;
  toggleAllFound: () => void;
  addCustomFound: (text: string) => void;
  removeCustomFound: (index: number) => void;
  analysisUnlocked: boolean;
  unlockAnalysis: () => void;
  setStep: (step: number) => void;
  REVIEW_STEP: number;
}) {
  return (
    <div>
      <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
        Review Your Data
      </h1>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm leading-relaxed text-ink-muted">
          Based on the data sources you approved and data from the Vibrancy
          Portal, we identified{" "}
          {RUEA_SECTIONS.length + wizard.customFound.length} data points that
          are relevant to this grant.
        </p>
        <button
          onClick={toggleAllFound}
          className="inline-flex flex-none items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
        >
          {allFound ? "Remove all" : "Add all"}
        </button>
      </div>

      <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
        From the Vibrancy Portal
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

      <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
        From Your Organization
      </div>
      <div className="mb-4 flex flex-col gap-2.5">
        {wizard.customFound.length === 0 ? (
          <p className="text-sm leading-relaxed text-ink-muted">
            Nothing added yet. Use the box below to add a data point in your own
            words.
          </p>
        ) : (
          wizard.customFound.map((text, i) => {
            const selected = isFound(`custom:${text}`);
            return (
              <div key={`custom-${i}`} className="relative">
                <button
                  onClick={() => toggleFound(`custom:${text}`)}
                  aria-pressed={selected}
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 pr-11 text-left ${
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
                    <div className="text-sm font-semibold">{text}</div>
                    <div className="text-xs text-ink-muted">Added by you</div>
                  </div>
                </button>
                <button
                  onClick={() => removeCustomFound(i)}
                  aria-label={`Delete ${text}`}
                  title="Delete"
                  className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-base text-ink-muted transition duration-150 hover:bg-accent-tint hover:text-accent-ink"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>
      <div className="mb-6">
        <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
          Add more data
        </div>
        <AddDataChatBox onAdd={addCustomFound} />
      </div>
      <div className="flex gap-2.5">
        <button
          onClick={() => setStep(REVIEW_STEP - 1)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={unlockAnalysis}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analysisUnlocked ? (
            <>
              See updated analysis <ArrowRight size={16} className="shrink-0" />
            </>
          ) : (
            <>
              Unlock your analysis <ArrowRight size={16} className="shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
