"use client";

/** One header line of the warm-intro email preview, e.g. "To: …". */
export default function EmailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-divider py-2.5 text-sm">
      <span className="w-16 flex-none font-mono text-xs tracking-wide text-ink-muted">
        {label}
      </span>
      <span className="min-w-0 text-ink-body">{children}</span>
    </div>
  );
}
