"use client";

import { useRouter } from "next/navigation";
import type { RueaSection } from "@/data/seed";
import type { WizardState } from "@/store/useAppStore";
import RueaCard from "@/components/analysis/RueaCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
import BulletList from "@/components/primitives/BulletList";

/** Step 3: the generated analysis cards, with export selection. */
export default function ApplyAnalysisStep({
  wizard,
  foundSections,
  setRueaExpanded,
  isExportSelected,
  setExportSelected,
  exportMode,
  allExportSelected,
  selectAllForExport,
  useSelectedExportMode,
  setStep,
  REVIEW_STEP,
}: {
  wizard: WizardState;
  foundSections: RueaSection[];
  setRueaExpanded: (id: string, value: boolean) => void;
  isExportSelected: (key: string) => boolean;
  setExportSelected: (key: string, value: boolean) => void;
  exportMode: "selected" | "all";
  allExportSelected: boolean;
  selectAllForExport: () => void;
  useSelectedExportMode: () => void;
  setStep: (step: number) => void;
  REVIEW_STEP: number;
}) {
  const router = useRouter();
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
            "IN YOUR APPLICATION shows you how you can use it to enhance your pitch.",
          ]}
          muted
        />
        <p className="text-sm leading-relaxed text-ink-muted">
          If you&apos;d like, you can select cards to download them for later.
        </p>
      </div>
      <div className="mb-6 flex flex-col gap-3">
        {foundSections.length === 0 ? (
          <p className="text-sm leading-relaxed text-ink-muted">
            Go back and select at least one data point to see it explained here.
          </p>
        ) : (
          foundSections.map((s, i) => {
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
          })
        )}
      </div>

      {foundSections.length > 0 && (
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

          <button className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 hover:bg-accent-ink-2 active:translate-y-px">
            Download PDF
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2.5">
        <button
          onClick={() => setStep(REVIEW_STEP)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={16} className="shrink-0" /> Previous step
        </button>
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save and exit <ArrowRight size={16} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}
