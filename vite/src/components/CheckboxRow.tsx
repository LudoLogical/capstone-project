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
      className="checkbox-row"
    >
      <div className={`checkbox-box ${checked ? "checkbox-box-checked" : ""}`} style={{ marginTop: 1 }}>
        {checked ? "✓" : ""}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-body)", lineHeight: 1.3 }}>
          {label}
        </div>
        {hint && <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", lineHeight: 1.3 }}>{hint}</div>}
      </div>
    </div>
  );
}
