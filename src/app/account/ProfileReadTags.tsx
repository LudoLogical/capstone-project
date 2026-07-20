"use client";

export default function ProfileReadTags({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
        {label}
      </div>
      {values.length === 0 ? (
        <div className="text-sm text-ink-muted">Not set yet</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-alt px-3 py-1 text-xs font-bold text-ink-secondary"
            >
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
