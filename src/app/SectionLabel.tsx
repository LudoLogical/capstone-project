"use client";

/** Small uppercase eyebrow used to label a dashboard section. */
export default function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 text-xs font-bold tracking-wider text-ink-muted uppercase">
      {children}
    </div>
  );
}
