import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-9 text-center">
      <div className="mb-2.5 flex justify-center text-ink-muted">
        <Icon size={30} />
      </div>
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
