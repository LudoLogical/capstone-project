import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-9 text-center">
      <div className="mb-2.5 text-3xl">{icon}</div>
      <div className="mb-1.5 text-base font-bold">{title}</div>
      <p
        className={`text-sm leading-relaxed text-ink-muted ${action ? "mb-4" : ""}`}
      >
        {body}
      </p>
      {action}
    </div>
  );
}
