"use client";

import { Plus, Minus } from "lucide-react";

/** Expand/collapse toggle for a truncated option list, e.g. the search facets. */
export default function ShowMoreButton({
  expanded,
  hiddenCount,
  onToggle,
}: {
  expanded: boolean;
  hiddenCount: number;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="mt-0.5 inline-flex items-center gap-1 self-start text-xs font-bold text-ink-secondary underline underline-offset-2 transition-colors duration-150 hover:text-ink"
    >
      {expanded ? (
        <>
          <Minus size={14} className="shrink-0" /> Show less
        </>
      ) : (
        <>
          <Plus size={14} className="shrink-0" /> Show {hiddenCount} more
        </>
      )}
    </button>
  );
}
