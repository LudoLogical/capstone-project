"use client";

import { useState } from "react";
import type { ReportState } from "@/store/useAppStore";
import type { AnalysisCardSection } from "@/components/analysis/RueaCard";
import RueaCard from "@/components/analysis/RueaCard";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";

/** Step 7: the generated analysis cards, with export selection and save. */
export default function ReportAnalysisStep({
  report,
  analysisSections,
  toggleAnalysis,
  isAnalysisSelected,
  toggleAnalysisSelected,
  allAnalysisSelected,
  selectAllAnalysis,
  useSelectedExportMode,
  exportMode,
  editCustomSupporting,
  deleteCustomSupporting,
  setStep,
  saveToGrant,
}: {
  report: ReportState;
  analysisSections: AnalysisCardSection[];
  toggleAnalysis: (id: string, current: boolean) => void;
  isAnalysisSelected: (id: string) => boolean;
  toggleAnalysisSelected: (id: string) => void;
  allAnalysisSelected: boolean;
  selectAllAnalysis: () => void;
  useSelectedExportMode: () => void;
  exportMode: "selected" | "all";
  editCustomSupporting: (index: number, text: string) => void;
  deleteCustomSupporting: (index: number) => void;
  setStep: (step: number) => void;
  saveToGrant: () => void;
}) {
  const [editingCustom, setEditingCustom] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  return (
    <div>
      <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
        Analysis
      </h1>
      <p className="mb-3.5 text-sm leading-relaxed text-ink-muted">
        Each card below breaks down each of the data points you selected: what
        it means in plain English (In Other Words), how it compares to county
        and peer benchmarks (In Context), and how to use it in your reporting
        (In Your Report). Review each card and use the language in “In Your
        Report” to strengthen your report.
      </p>
      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-accent-tint-border bg-accent-tint-soft px-4 py-3">
        <Check size={14} className="mt-px shrink-0 text-accent" />
        <p className="text-sm leading-relaxed text-ink-body">
          <strong>Check the box on each card</strong> you want in your data
          analysis. Only checked cards are included when you download or share
          it below - everything else stays out.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        {analysisSections.map((s, i) => {
          // The topmost card is always expanded; the rest default
          // collapsed until the user opens them.
          const expanded =
            i === 0 ? true : (report.analysisExpanded[s.id] ?? false);
          return (
            <RueaCard
              key={s.id}
              section={s}
              expanded={expanded}
              onToggle={() => toggleAnalysis(s.id, expanded)}
              applyLabel="In your report"
              selected={isAnalysisSelected(s.id)}
              onSelectChange={() => toggleAnalysisSelected(s.id)}
            />
          );
        })}
        {report.customSupporting.map((text, i) => (
          <div
            key={`custom-${i}`}
            className="rounded-2xl border border-border bg-surface px-5 py-4"
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                Added by you
              </div>
              {editingCustom !== i && (
                <div className="flex flex-none gap-3">
                  <button
                    onClick={() => {
                      setEditingCustom(i);
                      setEditDraft(text);
                    }}
                    className="text-xs font-semibold text-accent-ink-2 underline underline-offset-2 hover:text-accent"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCustomSupporting(i)}
                    className="text-xs font-semibold text-ink-muted underline underline-offset-2 transition hover:text-warning-ink"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            {editingCustom === i ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  autoFocus
                  className="min-h-20 w-full resize-y rounded-xl border border-border-strong bg-white px-3 py-2 text-sm leading-relaxed text-ink outline-none focus:border-accent"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const v = editDraft.trim();
                      if (v) editCustomSupporting(i, v);
                      setEditingCustom(null);
                    }}
                    disabled={!editDraft.trim()}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition duration-150 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCustom(null)}
                    className="rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm font-bold">{text}</div>
            )}
          </div>
        ))}
        {analysisSections.length === 0 &&
          report.customSupporting.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border-strong px-4 py-8 text-center text-sm leading-relaxed text-ink-muted">
              Go back to data collection to create a new data analysis
            </p>
          )}
      </div>

      {analysisSections.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5">
          {/* Selected / all segmented toggle */}
          <div className="inline-flex rounded-lg border border-border-strong bg-surface-alt p-1">
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
              onClick={selectAllAnalysis}
              aria-pressed={exportMode === "all"}
              className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition duration-150 ${
                exportMode === "all" && allAnalysisSelected
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Export all cards
            </button>
          </div>

          <button className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 hover:bg-accent-ink-2 active:translate-y-px">
            Download PDF
          </button>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <div className="mb-2.5 text-sm font-bold">Next steps</div>
        <ul className="flex list-disc flex-col gap-1.5 pl-4">
          <li className="text-sm">
            Copy language from the cards above into your narrative
          </li>
          <li className="text-sm">
            Use the citations when a funder asks for a data source
          </li>
          <li className="text-sm">
            Go back to add more data if something&apos;s missing
          </li>
          <li className="text-sm">
            Export this report as a reference document
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between gap-2.5">
        <button
          onClick={() => setStep(6)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={16} className="shrink-0" /> Previous step
        </button>
        <button
          onClick={saveToGrant}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 hover:bg-accent-ink-2 active:translate-y-px"
        >
          Save and exit <ArrowRight size={16} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}
