"use client";

/** One choice in the past-due resolution modal: a label plus a clarifying hint. */
export default function ResolveOption({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-border-strong bg-white px-4 py-3 text-left transition duration-150 hover:border-accent hover:bg-surface-alt"
    >
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="mt-0.5 text-xs text-ink-muted">{hint}</div>
    </button>
  );
}
