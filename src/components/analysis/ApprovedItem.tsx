"use client";

import type { Datum } from "@/types/data";
import { Check } from "lucide-react";

/**
 * One row of the approved list under a question's chat.
 *
 * Everything in this list is approved by definition, so its box is always
 * ticked; unticking is how the user takes a data point back out, which drops
 * the row and unlights its chip in the conversation above.
 *
 * There is no delete control, here or anywhere else a suggestion appears. The
 * assistant surfaced these, and the user's say over them is whether to use
 * them - not whether they were ever offered.
 */
export default function ApprovedItem({
  datum,
  onRemove,
}: {
  datum: Datum;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      aria-checked
      role="checkbox"
      aria-label={`Remove ${datum.content} from your approved data`}
      className="flex w-full items-start gap-3 rounded-xl border border-accent bg-accent-tint-soft px-3.5 py-3 text-left transition duration-150 hover:border-accent-ink"
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-5.5 w-5.5 flex-none items-center justify-center rounded-md border-2 border-accent bg-accent text-white"
      >
        <Check size={14} />
      </span>
      <span>
        <span className="block text-sm font-semibold">{datum.content}</span>
        <span className="block text-xs text-ink-muted">{datum.citation}</span>
      </span>
    </button>
  );
}
