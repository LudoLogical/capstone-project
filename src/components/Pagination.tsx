"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Prev / page-number / Next button group, used wherever a list is paged.
 *
 * Renders nothing for a single page, so callers can hand it a page count
 * unconditionally rather than guarding at every site. External spacing comes in
 * via `className` instead of a wrapper, so the margin disappears along with the
 * control when there's only one page.
 */
export default function Pagination({
  page,
  pageCount,
  onPageChange,
  size = "md",
  label,
  className,
}: {
  /** Current page, zero-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /**
   * "sm" is for dense contexts: a dashboard board column sits beside four
   * others, and full-size controls there would outweigh the cards they page.
   */
  size?: "sm" | "md";
  /**
   * Scopes the accessible names, e.g. "Saved Grants". Needed wherever a screen
   * carries more than one of these, so "Page 2" isn't ambiguous between them.
   */
  label?: string;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  // Defensive: a caller whose list shrank under it can still be holding an
  // out-of-range page on the render before it clamps.
  const current = Math.min(Math.max(page, 0), pageCount - 1);
  const compact = size === "sm";

  const stepClass = `inline-flex items-center gap-1 rounded-lg border border-border-strong bg-white font-semibold text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-40 ${
    compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
  }`;

  const numberClass = (active: boolean) =>
    `rounded-lg border font-bold transition duration-150 ${
      compact ? "min-w-7 px-2 py-1 text-xs" : "min-w-9 px-3 py-2 text-sm"
    } ${
      active
        ? "border-ink bg-ink text-white"
        : "border-border-strong bg-white text-ink-secondary hover:border-accent"
    }`;

  const iconSize = compact ? 13 : 16;

  return (
    <nav
      aria-label={label ? `${label} pagination` : "Pagination"}
      className={`flex items-center justify-center ${
        compact ? "gap-1.5" : "gap-2"
      } ${className ?? ""}`}
    >
      <button
        onClick={() => onPageChange(Math.max(0, current - 1))}
        disabled={current === 0}
        className={stepClass}
      >
        <ArrowLeft size={iconSize} className="shrink-0" /> Prev
      </button>

      {Array.from({ length: pageCount }).map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i)}
          aria-current={i === current ? "page" : undefined}
          aria-label={label ? `${label}, page ${i + 1}` : `Page ${i + 1}`}
          className={numberClass(i === current)}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(pageCount - 1, current + 1))}
        disabled={current === pageCount - 1}
        className={stepClass}
      >
        Next <ArrowRight size={iconSize} className="shrink-0" />
      </button>
    </nav>
  );
}
