import { useState } from "react";
import Modal from "./Modal";
import { JARGON } from "@/data/seed";

export default function JargonTerm({ termKey, children }: { termKey: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const entry = JARGON[termKey];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-link"
        style={{ textDecorationStyle: "dotted" }}
      >
        {children} <sup style={{ fontSize: 9 }}>ⓘ</sup>
      </button>
      {entry && (
        <Modal open={open} onClose={() => setOpen(false)} title={entry.term} maxWidth={420}>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--color-text-body)" }}>{entry.definition}</p>
        </Modal>
      )}
    </>
  );
}
