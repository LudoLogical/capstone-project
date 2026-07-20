"use client";

import { Check } from "lucide-react";

export default function CheckboxRow({
  checked,
  onToggle,
  label,
  hint,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  hint?: string;
}) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      onClick={onToggle}
      onKeyDown={onKeyDown}
      role="checkbox"
      tabIndex={0}
      aria-checked={checked}
      aria-label={label}
      className="flex cursor-pointer items-center gap-2.5"
    >
      <div
        className={`flex h-5.5 w-5.5 flex-none items-center justify-center rounded-sm border-2 text-xs font-extrabold text-white ${
          checked ? "border-accent bg-accent" : "border-ink-muted"
        }`}
      >
        {checked ? <Check size={14} /> : null}
      </div>
      <div className="flex-1">
        <div className="text-sm leading-tight font-semibold text-ink-body">
          {label}
        </div>
        {hint && (
          <div className="text-xs leading-tight text-ink-muted">{hint}</div>
        )}
      </div>
    </div>
  );
}
