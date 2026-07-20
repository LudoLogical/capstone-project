"use client";

import { Check } from "lucide-react";

/** The "also do the coupled action" checkbox each prompt offers. */
export default function CoupledCheckbox({
  checked,
  onToggle,
  label,
  hint,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  hint: string;
}) {
  return (
    <div
      onClick={onToggle}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-surface-alt px-4 py-3.5"
    >
      <div
        className={`mt-0.5 flex h-[22px] w-[22px] flex-none items-center justify-center rounded-sm border-2 text-xs font-extrabold text-white ${
          checked ? "border-accent bg-accent" : "border-ink-muted"
        }`}
      >
        {checked ? <Check size={14} /> : null}
      </div>
      <div>
        <div className="text-sm leading-tight font-bold">{label}</div>
        <p className="mt-1 text-xs leading-normal text-ink-muted">{hint}</p>
      </div>
    </div>
  );
}
