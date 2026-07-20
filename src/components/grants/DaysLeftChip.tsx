"use client";

import { daysUntil } from "@/store/derived";

/**
 * Countdown to a deadline, shown only once it's close enough to matter (30 days
 * out) and colored by how close: green with time to work, yellow inside two
 * weeks, red inside a week. Past the date it says nothing - the card's own
 * "needs attention" treatment takes over there.
 */
export default function DaysLeftChip({ date }: { date: Date }) {
  const days = daysUntil(date);
  if (days < 0 || days > 30) return null;

  const tone =
    days < 7
      ? "border-error-border bg-error-bg text-error-ink"
      : days < 15
        ? "border-warning-border bg-warning-bg text-warning-ink"
        : "border-success-border bg-success-bg text-success-ink";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}
    >
      {days === 0 ? "Due today" : `${days} day${days === 1 ? "" : "s"} left`}
    </span>
  );
}
