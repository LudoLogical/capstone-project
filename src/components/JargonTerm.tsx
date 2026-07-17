"use client";

import { JARGON } from "@/data/seed";

/**
 * Inline jargon term. Hovering (or focusing) the dotted-underlined word reveals
 * a small tooltip with the plain-language explanation - no click or modal
 * needed. The tooltip is shown via group-hover / focus-within so it works on
 * pointer and keyboard alike.
 */
export default function JargonTerm({
  termKey,
  children,
}: {
  termKey: string;
  children: React.ReactNode;
}) {
  const entry = JARGON[termKey];

  return (
    <span className="group relative inline">
      <button
        type="button"
        className="inline-flex cursor-help items-baseline gap-0.5 p-0 text-xs font-semibold text-accent-ink-2 underline decoration-dotted"
        aria-label={entry ? `${entry.term}: ${entry.definition}` : undefined}
      >
        {children}
        <span aria-hidden className="text-[12px] leading-none no-underline">
          ⓘ
        </span>
      </button>
      {entry && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-border bg-white p-3 text-left opacity-0 shadow-soft transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <span className="mb-1 block text-xs font-bold text-ink">
            {entry.term}
          </span>
          <span className="block text-xs leading-relaxed text-ink-body">
            {entry.definition}
          </span>
        </span>
      )}
    </span>
  );
}
