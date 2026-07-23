"use client";

import type { AnalysisCardSection } from "@/components/analysis/RueaCard";
import RueaCard from "@/components/analysis/RueaCard";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import BulletList from "@/components/primitives/BulletList";

/**
 * The last step of both the application wizard and the report flow: one card
 * per data point the user selected on the preceding Review step, with export
 * selection.
 *
 * Takes the card list and a plain map of per-card open state rather than a
 * `WizardState | ReportState` union - both states hold the same
 * `Record<string, boolean>` under different names, and staying structural keeps
 * this component free of any store coupling.
 *
 * There is no empty state because there is no way to get here without cards:
 * every selected data point yields exactly one, and at least one selection is
 * required to unlock the step.
 */
export default function AnalysisStep({
  sections,
  expanded,
  setExpanded,
  isSelected,
  toggleSelected,
  allSelected,
  toggleAll,
  usageBullet,
  applyLabel,
  onBack,
  onSaveAndExit,
}: {
  sections: AnalysisCardSection[];
  // Keyed by section id. A missing entry means the card has never been toggled,
  // which is what lets the topmost card default to open.
  expanded: Record<string, boolean>;
  // Takes the value to store rather than the current one, so the caller stays a
  // plain setter and cannot disagree with us about which way a card flipped.
  setExpanded: (id: string, value: boolean) => void;
  // Export selection. Cards start unticked so the user opts each one in.
  isSelected: (id: string) => boolean;
  toggleSelected: (id: string) => void;
  // Computed by the page, not here: "all" means all the cards on screen, and
  // the page is what knows to leave ticks on cards it is no longer passing.
  allSelected: boolean;
  toggleAll: () => void;
  // The third bullet names what the flow is for - pitching work not yet done,
  // or accounting for work already done - so the two sentences differ in
  // substance and neither can be derived from the other.
  usageBullet: string;
  // Left unset by the application flow so RueaCard's own default applies, and
  // the wording lives in exactly one place.
  applyLabel?: string;
  // Where the footer goes differs by flow: the two number their steps
  // differently, and "Save and exit" means "go home" in one and "mark the
  // report complete, then go home" in the other. Each page supplies its own.
  onBack: () => void;
  onSaveAndExit: () => void;
}) {
  // Nothing to put in the PDF until at least one card is ticked.
  const anySelected = sections.some((s) => isSelected(s.id));
  return (
    <div>
      <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
        Data Analysis
      </h1>
      <div className="mb-5 flex flex-col gap-2.5">
        <p className="text-sm leading-relaxed text-ink-muted">
          Each card below breaks down each of the data points you selected.
        </p>
        <BulletList
          items={[
            "IN OTHER WORDS explains what it means in plain English",
            "IN CONTEXT visualizes how it compares to other data points like it",
            usageBullet,
          ]}
          muted
        />
      </div>

      <div className="mb-5 flex flex-col gap-2.5">
        {sections.map((s, i) => {
          // The topmost card starts expanded and the rest start collapsed, but
          // once the user has toggled a card, their choice wins.
          const isOpen = expanded[s.id] ?? i === 0;
          return (
            <RueaCard
              key={s.id}
              section={s}
              expanded={isOpen}
              onToggle={() => setExpanded(s.id, !isOpen)}
              applyLabel={applyLabel}
              selected={isSelected(s.id)}
              onSelectChange={() => toggleSelected(s.id)}
            />
          );
        })}
      </div>

      {/* Sits below the cards: both actions here act on what's selected above. */}
      <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-accent-tint-border bg-accent-tint-soft px-4 py-3">
        <div className="flex items-center gap-2">
          <Download size={16} className="shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-ink-body">
            If you&apos;d like, you can select cards to download them for later.
          </p>
        </div>
        <div className="flex flex-none items-center gap-2.5">
          <button
            onClick={toggleAll}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
          <button
            disabled={!anySelected}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download as PDF
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <div className="text-md mb-2.5 font-bold">What to do next</div>
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
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={16} className="shrink-0" /> Previous step
        </button>
        <button
          onClick={onSaveAndExit}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save and exit <ArrowRight size={16} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}
