import { useState } from "react";
import Modal from "./Modal";
import { PROVENANCE } from "@/data/seed";

export default function CiteButton({ provenanceKey, label = "Cite" }: { provenanceKey: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const entry = PROVENANCE[provenanceKey];
  if (!entry) return null;

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-secondary btn-sm">
        {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={entry.title} maxWidth={460}>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 14 }}>{entry.source}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {entry.fields.map((f) => (
            <div
              key={f.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 13.5,
                borderBottom: "1px solid var(--color-divider)",
                paddingBottom: 8,
              }}
            >
              <span className="muted">{f.label}</span>
              <strong>{f.value}</strong>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{entry.note}</p>
      </Modal>
    </>
  );
}
