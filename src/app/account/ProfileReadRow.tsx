"use client";

export default function ProfileReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
        {label}
      </div>
      <div className={`text-sm ${value ? "text-ink" : "text-ink-muted"}`}>
        {value || "Not set yet"}
      </div>
    </div>
  );
}
