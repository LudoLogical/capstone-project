"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import Pagination from "@/components/primitives/Pagination";

type Tone = "accent" | "success" | "neutral";

const TONE: Record<Tone, { tile: string }> = {
  accent: { tile: "bg-accent-tint text-accent-ink" },
  success: { tile: "bg-success-bg text-success-ink" },
  neutral: { tile: "bg-surface-alt text-ink-secondary" },
};

// A board column shows a few grants at a time; the rest are a page click away,
// so one busy column can't push every other column off the screen.
const CARDS_PER_PAGE = 3;

/**
 * A labeled board column: a colored header tile, a count, and its grant cards,
 * paged once there are more than fit comfortably.
 */
export default function BoardColumn<T>({
  icon: Icon,
  title,
  tone,
  items,
  empty,
  renderItem,
  toolbar,
}: {
  icon: LucideIcon;
  title: string;
  tone: Tone;
  items: T[];
  empty: string;
  renderItem: (item: T) => React.ReactNode;
  /** Controls shown in the header row, e.g. the Archived filters. */
  toolbar?: React.ReactNode;
}) {
  const t = TONE[tone];
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / CARDS_PER_PAGE));
  // Keep the page in range as grants move off this column.
  const safePage = Math.min(page, pageCount - 1);
  const shown = items.slice(
    safePage * CARDS_PER_PAGE,
    safePage * CARDS_PER_PAGE + CARDS_PER_PAGE,
  );

  return (
    <section className="flex flex-col rounded-2xl bg-surface-alt-2 p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2.5 px-1">
        <div
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg ${t.tile}`}
        >
          <Icon size={17} />
        </div>
        <div className="text-sm font-bold">{title}</div>
        <div className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-ink-secondary">
          {items.length}
        </div>
        {toolbar && <div className="ml-auto">{toolbar}</div>}
      </div>
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-xs leading-normal text-ink-muted">
            {empty}
          </div>
        ) : (
          shown.map(renderItem)
        )}
      </div>

      <Pagination
        page={safePage}
        pageCount={pageCount}
        onPageChange={setPage}
        // A board column sits beside four others, so its pagination stays
        // compact rather than outweighing the cards it pages.
        size="sm"
        label={title}
        className="mt-4"
      />
    </section>
  );
}
