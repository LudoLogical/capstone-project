"use client";

import { useState } from "react";
import type { ReportState } from "@/store/useAppStore";
import type { AnalysisCardSection } from "@/components/analysis/RueaCard";
import RueaCard from "@/components/analysis/RueaCard";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import BulletList from "@/components/primitives/BulletList";

/** Step 7: the generated analysis cards, with export selection and save. */
export default function ReportAnalysisStep({
  report,
  analysisSections,
  toggleAnalysis,
  isAnalysisSelected,
  toggleAnalysisSelected,
  allAnalysisSelected,
  toggleAllAnalysisSelected,
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
  toggleAllAnalysisSelected: () => void;
  editCustomSupporting: (index: number, text: string) => void;
  deleteCustomSupporting: (index: number) => void;
  setStep: (step: number) => void;
  saveToGrant: () => void;
}) {
  const [editingCustom, setEditingCustom] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  // Nothing to put in the PDF until at least one card is ticked.
  const anyAnalysisSelected = analysisSections.some((s) =>
    isAnalysisSelected(s.id),
  );
  return (
    <div>
      <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
        Data Analysis
      </h1>
      <div className="flex flex-col gap-2 mb-4">
        <p className="text-sm leading-relaxed text-ink-muted">
          Each card below breaks down each of the data points you selected.
        </p>
        <BulletList
          items={[
            "IN OTHER WORDS explains what it means in plain English",
            "IN CONTEXT visualizes how it compares to other data points like it",
            // The application flow pitches what an organization plans to do;
            // a report accounts for what it has already done.
            "IN YOUR REPORT shows you how you can use it to demonstrate the impact you've had",
          ]}
          muted
        />
      </div>

      <div className="mb-6 flex flex-col gap-3">
        {analysisSections.map((s, i) => {
          // The topmost card starts expanded and the rest start collapsed,
          // but once the user has toggled a card, their choice wins.
          const expanded = report.analysisExpanded[s.id] ?? i === 0;
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

      {/* Sits below the cards: both actions here act on what's selected above. */}
      {analysisSections.length > 0 && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent-tint-border bg-accent-tint-soft px-4 py-3">
          <div className="flex items-center gap-2">
            <Download size={16} className="shrink-0 text-accent" />
            <p className="text-sm leading-relaxed text-ink-body">
              If you&apos;d like, you can select cards to download them for
              later.
            </p>
          </div>
          <div className="flex flex-none items-center gap-2.5">
            <button
              onClick={toggleAllAnalysisSelected}
              className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
            >
              {allAnalysisSelected ? "Deselect all" : "Select all"}
            </button>
            <button
              disabled={!anyAnalysisSelected}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            >
              Download as PDF
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <div className="mb-2.5 text-md font-bold">What to do next</div>
        <ul className="flex list-disc flex-col gap-1.5 pl-4">
          <li className="text-sm">Download the cards that look helpful</li>
          <li className="text-sm">
            Use the data and analysis in each one to support your narrative
          </li>
          <li className="text-sm">
            Revisit previous steps to add more data if you discover that
            something&apos;s missing
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
