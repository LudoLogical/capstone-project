"use client";

import type { DatumAnalysis } from "@/types/analysis";
import CiteButton from "@/components/analysis/CiteButton";
import StatBars, { type RueaBar } from "@/components/analysis/StatBars";
import { Check, ChevronUp, ChevronDown } from "lucide-react";

/**
 * What the card needs to render: a canonical DatumAnalysis plus the optional
 * presentation extras. Built by `analysisForDatum`, which is total over every
 * Datum - a data point with no comparison to draw and nothing to cite simply
 * arrives without bars or a provenance key.
 */
export type AnalysisCardSection = {
  id: string;
  provenanceKey?: string;
  analysis: DatumAnalysis;
  bars?: RueaBar[];
  evalNote?: string;
};

type RueaCardProps = {
  section: AnalysisCardSection;
  expanded: boolean;
  onToggle: () => void;
  // When provided, a checkbox is shown on the left of the card header and its
  // state is controlled by `selected` / `onSelectChange`.
  selected?: boolean;
  onSelectChange?: () => void;
  // Heading for the "how to use it" section. Defaults to the application-writing
  // wording; the report flow passes "In your report".
  applyLabel?: string;
};

export default function RueaCard({
  section,
  expanded,
  onToggle,
  selected,
  onSelectChange,
  applyLabel = "In your application",
}: RueaCardProps) {
  const { analysis } = section;
  const headline = analysis.datum.content;
  const source = analysis.datum.citation;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-stretch bg-white">
        {onSelectChange && (
          <button
            onClick={onSelectChange}
            aria-pressed={!!selected}
            aria-label={selected ? "Deselect card" : "Select card"}
            className="flex flex-none items-start py-4 pl-5"
          >
            <span
              aria-hidden
              className={`flex h-5.5 w-5.5 items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                selected ? "border-accent bg-accent" : "border-ink-muted"
              }`}
            >
              {selected ? <Check size={14} /> : null}
            </span>
          </button>
        )}
        <button
          onClick={onToggle}
          className={`flex flex-1 items-center gap-3.5 py-4 pr-5 text-left ${
            onSelectChange ? "pl-3" : "pl-5"
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{headline}</div>
            {source && (
              <div className="mt-1 text-xs text-ink-muted">
                Source: {source}
              </div>
            )}
          </div>
          <div className="text-ink-muted">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-divider px-5 pb-5">
          <div className="mt-4">
            <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
              In other words
            </div>
            <ul className="flex list-disc flex-col gap-1.5 pl-4">
              {analysis.result.understand.map((line, i) => (
                <li key={i} className="text-sm leading-relaxed text-ink-body">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Only shown when there's a real comparison to draw. */}
          {(section.bars?.length || section.evalNote) && (
            <div>
              <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
                In context
              </div>
              {section.bars?.length ? <StatBars bars={section.bars} /> : null}
              {section.evalNote && (
                <p className="mt-2.5 text-sm leading-relaxed font-bold text-accent-ink">
                  {section.evalNote}
                </p>
              )}
            </div>
          )}

          <div>
            <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
              {applyLabel}
            </div>
            <ul className="flex list-disc flex-col gap-1.5 pl-4">
              {analysis.result.apply.map((line, i) => (
                <li key={i} className="text-sm leading-relaxed text-ink-body">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* The row keeps the button at its natural width - as a direct child
              of the column it would stretch to fill. */}
          {section.provenanceKey && (
            <div className="flex flex-wrap gap-2.5">
              <CiteButton provenanceKey={section.provenanceKey} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
