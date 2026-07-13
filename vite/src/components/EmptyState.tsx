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
    <div className="empty-state">
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{title}</div>
      <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: action ? 16 : 0 }}>{body}</p>
      {action}
    </div>
  );
}
