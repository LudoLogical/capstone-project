import { useState } from "react";
import Modal from "./Modal";

const TIERS = [
  {
    icon: "✦",
    label: "AI-ASSISTED",
    color: "var(--color-accent-ink)",
    bg: "var(--color-accent-tint)",
    body: "Fully automated. Used to rank grants by fit and explain your data in plain language. You review everything before it goes anywhere.",
  },
  {
    icon: "◔",
    label: "AI SUGGESTS",
    color: "var(--color-info-ink)",
    bg: "var(--color-info-bg)",
    body: "The AI surfaces options — like a possible collaborator — but a human always takes the next step. It never reaches out on your behalf.",
  },
  {
    icon: "🔒",
    label: "NO AI",
    color: "var(--color-text-secondary)",
    bg: "var(--color-neutral-bg)",
    body: "Sensitive records, like payroll or receipts, are AI-free by design and never read by any model.",
  },
];

export default function HowAIModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-link">
        Learn more
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="How AI is used here" maxWidth={480}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {TIERS.map((t) => (
            <div key={t.label} style={{ background: t.bg, borderRadius: "var(--radius-lg)", padding: 16 }}>
              <div style={{ display: "inline-flex", gap: 6, fontSize: 11, fontWeight: 800, color: t.color, marginBottom: 8 }}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--color-text-body)", margin: 0 }}>{t.body}</p>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
