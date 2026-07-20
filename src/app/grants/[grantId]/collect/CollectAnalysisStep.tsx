"use client";

import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import type { RueaSection } from "@/data/seed";
import type { WizardState } from "@/store/useAppStore";
import RueaCard from "@/components/analysis/RueaCard";
import ResetAnalysisButton from "@/components/analysis/ResetAnalysisButton";
import { ArrowRight, Check, ChevronDown } from "lucide-react";

/** Step 3: the generated analysis cards, with export selection. */
export default function CollectAnalysisStep({
  wizard,
  foundSections,
  foundCustom,
  setRueaExpanded,
  isExportSelected,
  setExportSelected,
  exportMode,
  allExportSelected,
  selectAllForExport,
  useSelectedExportMode,
  downloadOpen,
  setDownloadOpen,
  setShareOpen,
  resetAnalysis,
  setStep,
  REVIEW_STEP,
}: {
  wizard: WizardState;
  foundSections: RueaSection[];
  foundCustom: string[];
  setRueaExpanded: (id: string, value: boolean) => void;
  isExportSelected: (key: string) => boolean;
  setExportSelected: (key: string, value: boolean) => void;
  exportMode: "selected" | "all";
  allExportSelected: boolean;
  selectAllForExport: () => void;
  useSelectedExportMode: () => void;
  downloadOpen: boolean;
  setDownloadOpen: Dispatch<SetStateAction<boolean>>;
  setShareOpen: (open: boolean) => void;
  resetAnalysis: () => void;
  setStep: (step: number) => void;
  REVIEW_STEP: number;
}) {
  const router = useRouter();
  return (
    <div>
      <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
        Analyze Your Data
      </h1>
      <p className="mb-5 text-sm leading-relaxed text-ink-muted">
        Each card below breaks down each of the data points you selected: what
        it means in plain English (In Other Words), how it compares to county
        and peer benchmarks (In Context), and how to use it in your grant
        writing or reporting (In Your Application). Review each card and use the
        language in “In Your Application” to strengthen your application.
      </p>
      <div className="mb-6 flex flex-col gap-3">
        {foundSections.length === 0 && foundCustom.length === 0 ? (
          <p className="text-sm leading-relaxed text-ink-muted">
            Go back and select at least one data point to see it explained here.
          </p>
        ) : (
          <>
            {foundSections.map((s, i) => {
              // Default the first card open, the rest collapsed; an explicit
              // toggle (stored value) always wins.
              const expanded = wizard.rueaExpanded[s.id] ?? i === 0;
              return (
                <RueaCard
                  key={s.id}
                  section={s}
                  expanded={expanded}
                  onToggle={() => setRueaExpanded(s.id, !expanded)}
                  selected={isExportSelected(s.id)}
                  onSelectChange={() =>
                    setExportSelected(s.id, !isExportSelected(s.id))
                  }
                />
              );
            })}
            {foundCustom.map((text, i) => {
              const key = `custom:${text}`;
              const selected = isExportSelected(key);
              return (
                <div
                  key={`custom-${i}`}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-5 py-4"
                >
                  <button
                    onClick={() => setExportSelected(key, !selected)}
                    aria-pressed={selected}
                    aria-label={selected ? "Deselect card" : "Select card"}
                    className="flex flex-none items-start pt-0.5"
                  >
                    <span
                      aria-hidden
                      className={`flex h-5.5 w-5.5 items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                        selected
                          ? "border-accent bg-accent"
                          : "border-ink-muted"
                      }`}
                    >
                      {selected ? <Check size={14} /> : null}
                    </span>
                  </button>
                  <div>
                    <div className="mb-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
                      Added by you
                    </div>
                    <div className="text-sm font-bold">{text}</div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {(foundSections.length > 0 || foundCustom.length > 0) && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
          {/* Selected / all segmented toggle */}
          <div className="mb-4 inline-flex rounded-lg border border-border-strong bg-surface-alt p-1">
            <button
              onClick={useSelectedExportMode}
              aria-pressed={exportMode === "selected"}
              className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition duration-150 ${
                exportMode === "selected"
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Export selected cards
            </button>
            <button
              onClick={selectAllForExport}
              aria-pressed={exportMode === "all"}
              className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition duration-150 ${
                exportMode === "all" && allExportSelected
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Export all cards
            </button>
          </div>

          {/* Download (with format menu) + Share link */}
          <div className="flex flex-wrap items-start gap-2.5">
            <div className="relative">
              <button
                onClick={() => setDownloadOpen((v) => !v)}
                aria-expanded={downloadOpen}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 hover:bg-accent-ink-2 active:translate-y-px"
              >
                Download <ChevronDown size={16} className="shrink-0" />
              </button>
              {downloadOpen && (
                <div className="absolute z-10 mt-1.5 w-64 overflow-hidden rounded-xl border border-border-strong bg-white shadow-float">
                  <button
                    onClick={() => setDownloadOpen(false)}
                    className="block w-full px-4 py-3 text-left text-sm font-semibold text-ink transition duration-150 hover:bg-surface-alt"
                  >
                    Download as PDF
                  </button>
                  <button
                    onClick={() => setDownloadOpen(false)}
                    className="block w-full border-t border-divider px-4 py-3 text-left text-sm font-semibold text-ink transition duration-150 hover:bg-surface-alt"
                  >
                    Download Word document (.docx)
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
            >
              Share link
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2.5">
        <button
          onClick={() => setStep(REVIEW_STEP)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save and exit <ArrowRight size={16} className="shrink-0" />
        </button>
      </div>

      {(foundSections.length > 0 || foundCustom.length > 0) && (
        <div className="mt-8 border-t border-divider pt-6">
          <ResetAnalysisButton onReset={resetAnalysis} />
        </div>
      )}
    </div>
  );
}
