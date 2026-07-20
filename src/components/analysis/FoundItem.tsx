"use client";

import { Check, X } from "lucide-react";

/** One card in the found-data list: left checkbox, content, and a
 *  delete "×" in the upper right. */
export default function FoundItem({
  label,
  source,
  picked,
  onTogglePick,
  onDelete,
}: {
  id: string;
  label: string;
  source: string;
  picked: boolean;
  onTogglePick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`relative rounded-xl border ${
        picked ? "border-accent bg-accent-tint" : "border-border-strong bg-white"
      }`}
    >
      <button
        onClick={onTogglePick}
        aria-pressed={picked}
        className="flex w-full items-start gap-3 px-3.5 py-3 pr-10 text-left"
      >
        <span
          aria-hidden
          className={`mt-0.5 flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
            picked ? "border-accent bg-accent" : "border-ink-muted"
          }`}
        >
          {picked ? <Check size={14} /> : null}
        </span>
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs text-ink-muted">{source}</div>
        </div>
      </button>
      <button
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        title="Delete"
        className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-base text-ink-muted transition duration-150 hover:bg-white hover:text-accent-ink"
      >
        <X size={14} />
      </button>
    </div>
  );
}
