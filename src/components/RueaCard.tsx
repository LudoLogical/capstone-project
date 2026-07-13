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
};

export default function RueaCard({
  section,
  expanded,
  onToggle,
  onAdd,
}: RueaCardProps) {
  const { analysis } = section;
  const headline = analysis.datum.content;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3.5 bg-white px-5 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Remember
          </div>
          <div className="text-sm font-bold">{headline}</div>
        </div>
        <div className="text-sm text-ink-muted">{expanded ? "▲" : "▼"}</div>
      </button>

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
              In your application
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
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to my grant ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
