"use client";

import { useState } from "react";
import Modal from "./Modal";
import { JARGON } from "@/data/seed";

export default function JargonTerm({
  termKey,
  children,
}: {
  termKey: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const entry = JARGON[termKey];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-0 text-xs font-semibold text-accent-ink-2 underline decoration-dotted"
      >
        {children} <sup>ⓘ</sup>
      </button>
      {entry && (
        <Modal open={open} onClose={() => setOpen(false)} title={entry.term}>
          <p className="text-sm leading-relaxed text-ink-body">
            {entry.definition}
          </p>
        </Modal>
      )}
    </>
  );
}
