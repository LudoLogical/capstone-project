"use client";

import type { Datum } from "@/types/data";
import { Check, Plus } from "lucide-react";

/**
 * One data point the assistant surfaced, shown under the message that raised
 * it. Clicking it approves the data point, or takes that approval back.
 *
 * The chip is the only place a suggestion can be acted on, and approving is all
 * it can do: a suggestion isn't the user's to delete - the assistant offered
 * it, and declining is simply leaving it unapproved.
 */
export default function SuggestionChip({
  datum,
  approved,
  onToggle,
}: {
  datum: Datum;
  approved: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={approved}
      title={datum.citation}
      className={`flex max-w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition duration-150 ${
        approved
          ? "border-accent bg-accent-tint-soft font-semibold text-accent-ink"
          : "border-border-strong bg-white text-ink-muted hover:border-accent hover:text-ink"
      }`}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-4.5 w-4.5 flex-none items-center justify-center rounded-md border-2 ${
          approved
            ? "border-accent bg-accent text-white"
            : "border-ink-muted text-ink-muted"
        }`}
      >
        {approved ? <Check size={11} /> : <Plus size={11} />}
      </span>
      <span className="min-w-0">
        <span className="block leading-snug">{datum.content}</span>
        <span className="block text-xs font-normal text-ink-muted">
          {datum.citation}
        </span>
      </span>
    </button>
  );
}
