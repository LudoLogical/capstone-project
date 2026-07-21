"use client";

import { useState } from "react";
import Modal from "@/components/primitives/Modal";
import { PROVENANCE } from "@/data/seed";
import { FileText, Link, Download, ExternalLink } from "lucide-react";

export default function CiteButton({
  provenanceKey,
  label = "See Citation",
}: {
  provenanceKey: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const entry = PROVENANCE[provenanceKey];
  if (!entry) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={entry.title}>
        <div className="mb-3.5 text-sm text-ink-muted">{entry.source}</div>
        <div className="mb-4 flex flex-col gap-2">
          {entry.fields.map((f) => (
            <div
              key={f.label}
              className="flex justify-between gap-3 border-b border-divider pb-2 text-sm"
            >
              <span className="flex-none text-ink-muted">{f.label}</span>
              <strong className="text-right">{f.value}</strong>
            </div>
          ))}
        </div>
        <a
          href={entry.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 flex items-center gap-2.5 rounded-xl border border-border-strong bg-surface-alt px-4 py-3 text-sm font-semibold text-accent no-underline transition duration-150 hover:border-accent"
        >
          {entry.linkKind === "file" ? (
            <FileText size={13} className="shrink-0" />
          ) : (
            <Link size={13} className="shrink-0" />
          )}
          <span className="min-w-0 flex-1 truncate">{entry.linkLabel}</span>
          <span
            aria-hidden
            className="flex flex-none items-center gap-1 text-ink-muted"
          >
            Open{" "}
            {entry.linkKind === "file" ? (
              <Download size={13} />
            ) : (
              <ExternalLink size={13} />
            )}
          </span>
        </a>
        <p className="text-xs leading-normal text-ink-muted">{entry.note}</p>
      </Modal>
    </>
  );
}
