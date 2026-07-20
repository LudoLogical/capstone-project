"use client";

/** A titled, rounded content card used down the grant detail page. */
export default function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5 rounded-2xl border border-border bg-surface p-6">
      <div className="mb-3 text-base font-bold">{title}</div>
      {children}
    </div>
  );
}
