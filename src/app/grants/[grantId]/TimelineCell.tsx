"use client";

/** One bordered label/value tile in the grant's timeline grid. */
export default function TimelineCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-divider-2 p-3.5">
      <div className="mb-1 text-xs text-ink-muted">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
