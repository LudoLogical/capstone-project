"use client";

export default function RadioRow({
  checked,
  onSelect,
  label,
  hint,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  hint?: string;
}) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      onClick={onSelect}
      onKeyDown={onKeyDown}
      role="radio"
      tabIndex={0}
      aria-checked={checked}
      aria-label={label}
      className="flex cursor-pointer items-start gap-2.5"
    >
      <div
        className={`flex h-5.5 w-5.5 flex-none items-center justify-center rounded-full border-2 ${
          checked ? "border-accent" : "border-ink-muted"
        }`}
      >
        {checked && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
      </div>
      <div className="mt-0.5 flex-1">
        <div className="text-sm leading-tight font-semibold text-ink-body">
          {label}
        </div>
        {hint && (
          <div className="mt-0.5 text-xs leading-tight text-ink-muted">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}
