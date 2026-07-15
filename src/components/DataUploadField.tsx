"use client";

import { useRef, useState } from "react";

// File types the portal accepts for supporting data, disclosed to the user and
// enforced on the file picker via the accept attribute.
const ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,image/png,image/jpeg,application/pdf";
const ALLOWED_LABEL =
  "PDF, Word (DOC/DOCX), Excel (XLS/XLSX), CSV, or images (JPG, PNG)";

/**
 * Add-supporting-data control: a real file picker that opens the user's Finder
 * and accepts actual files, plus an optional link field. Selected file names
 * and links are surfaced back to the caller, which stores them; uploads are
 * shown as removable chips.
 */
export default function DataUploadField({
  uploads,
  onAddFiles,
  onAddLink,
  onRemove,
}: {
  uploads: string[];
  onAddFiles: (names: string[]) => void;
  onAddLink: (link: string) => void;
  onRemove: (index: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkDraft, setLinkDraft] = useState("");

  const pickFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onAddFiles(Array.from(files).map((f) => f.name));
  };

  const addLink = () => {
    const v = linkDraft.trim();
    if (!v) return;
    onAddLink(v);
    setLinkDraft("");
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          pickFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="mb-2 flex flex-wrap gap-2.5">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105"
        >
          📤 Upload files
        </button>
      </div>
      <p className="mb-3 text-xs text-ink-muted">
        Accepted file types: {ALLOWED_LABEL}.
      </p>

      <div className="mb-3 flex gap-2.5">
        <input
          value={linkDraft}
          onChange={(e) => setLinkDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addLink()}
          placeholder="Or paste a link to a document or page"
          aria-label="Paste a link"
          className="w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
        />
        <button
          onClick={addLink}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent"
        >
          Add link
        </button>
      </div>

      {uploads.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploads.map((u, i) => (
            <span
              key={`${u}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-alt py-1 pr-1.5 pl-3 text-xs font-bold text-ink-secondary"
            >
              📎 {u}
              <button
                onClick={() => onRemove(i)}
                aria-label={`Remove ${u}`}
                className="flex h-4 w-4 flex-none items-center justify-center rounded-full text-ink-muted transition duration-150 hover:bg-divider-2 hover:text-ink"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
