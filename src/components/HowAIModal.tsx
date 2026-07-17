"use client";

import { useState } from "react";
import Modal from "./Modal";
import { BarChart3, Sparkles, Bookmark, type LucideIcon } from "lucide-react";

const TIERS: {
  icon: LucideIcon;
  label: string;
  color: string;
  bg: string;
  body: string;
}[] = [
  {
    icon: BarChart3,
    label: "AI-ASSISTED",
    color: "text-accent-ink",
    bg: "bg-accent-tint",
    body: "Fully automated. Used to rank grants by fit and explain your data in plain language. You review everything before it goes anywhere.",
  },
  {
    icon: Sparkles,
    label: "AI SUGGESTS",
    color: "text-info-ink",
    bg: "bg-info-bg",
    body: "The AI surfaces options - like a possible collaborator - but a human always takes the next step. It never reaches out on your behalf.",
  },
  {
    icon: Bookmark,
    label: "NO AI",
    color: "text-ink-secondary",
    bg: "bg-neutral-bg",
    body: "Sensitive records, like payroll or receipts, are AI-free by design and never read by any model.",
  },
];

export default function HowAIModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-0 text-xs font-semibold text-accent-ink-2 underline"
      >
        Learn more
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="How AI is used here"
      >
        <div className="flex flex-col gap-3.5">
          {TIERS.map((t) => (
            <div key={t.label} className={`rounded-xl p-4 ${t.bg}`}>
              <div
                className={`mb-2 inline-flex items-center gap-1.5 text-xs font-extrabold ${t.color}`}
              >
                <t.icon size={14} className="shrink-0" />
                <span>{t.label}</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-body">{t.body}</p>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
