"use client";

import type { RueaSection } from "@/data/seed";
import CiteButton from "./CiteButton";

const BAR_COLORS: Record<string, string> = {
  me: "bg-accent",
  average: "bg-bar-average",
  max: "bg-bar-max",
  other: "bg-info-ink",
};

function StatBars({ bars }: { bars: RueaSection["bars"] }) {
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div className="flex flex-col gap-2.5">
      {bars.map((bar) => {
        const barColor = BAR_COLORS[bar.role];
        return (
          <div key={bar.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-ink-muted">{bar.label}</span>
              <strong>
                {bar.value.toLocaleString()} {bar.unit}
              </strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-divider-2">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${Math.max(4, (bar.value / max) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

type RueaCardProps = {
  section: RueaSection;
  expanded: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  added?: boolean;
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
  onAdd,
  added = false,
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
              className={`flex h-6 w-6 items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                selected ? "border-accent bg-accent" : "border-checkbox"
              }`}
            >
              {selected ? "✓" : ""}
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
              <div className="mt-1 text-xs text-ink-muted">Source: {source}</div>
            )}
          </div>
          <div className="text-sm text-ink-muted">{expanded ? "▲" : "▼"}</div>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-divider px-5 pb-5">
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

          <div className="my-4">
            <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
              In context
            </div>
            <StatBars bars={section.bars} />
            <p className="mt-2.5 text-sm leading-relaxed font-bold text-accent-ink">
              {section.evalNote}
            </p>
          </div>

          <div className="mb-4">
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

          <div className="flex flex-wrap gap-2.5">
            <CiteButton provenanceKey={section.provenanceKey} />
            {onAdd && (
              <button
                onClick={onAdd}
                disabled={added}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition duration-150 disabled:cursor-default ${
                  added
                    ? "border border-success-border bg-success-bg text-success-ink"
                    : "bg-accent text-white shadow-cta enabled:hover:brightness-105"
                }`}
              >
                {added ? "Added to Data Analysis!" : "Add to Data Analysis"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
