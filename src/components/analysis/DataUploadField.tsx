"use client";

import { useRef, useState } from "react";
import { Paperclip, FileText, X } from "lucide-react";
import { DOCUMENT_SOURCE_TYPES } from "@/types/constants";
import { formatWebpageLabel, normalizeWebpageUrl } from "@/utils/url";

/** The `accept` attribute for the file picker, e.g. ".txt,.md,...". */
const ACCEPTED_EXTENSIONS = DOCUMENT_SOURCE_TYPES.map((t) => `.${t}`).join(",");

/**
 * Whether an uploaded document's file type, read off its name, is one we
 * accept. The picker's `accept` filter is only a hint - a user can always
 * override it in the OS dialog - so uploads are checked here too.
 */
function isDocument(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return DOCUMENT_SOURCE_TYPES.some((t) => t === ext);
}

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
  // Names of files from the most recent pick that we couldn't accept.
  const [rejected, setRejected] = useState<string[]>([]);
  // Set when the link field holds something that isn't a URL, cleared as soon
  // as the user edits it again so the message doesn't outlive the mistake.
  const [linkError, setLinkError] = useState(false);

  // Files whose type we don't accept are dropped and named back to the user,
  // so a rejected upload is never mistaken for a successful one.
  const pickFiles = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    const accepted = names.filter(isDocument);
    if (accepted.length > 0) onAddFiles(accepted);
    setRejected(names.filter((n) => !isDocument(n)));
  };

  const addLink = () => {
    if (!linkDraft.trim()) return;
    const url = normalizeWebpageUrl(linkDraft);
    if (!url) {
      setLinkError(true);
      return;
    }
    onAddLink(url);
    setLinkDraft("");
    setLinkError(false);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={(e) => {
          pickFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="mb-3 flex flex-wrap gap-2.5">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
        >
          <Paperclip size={15} className="shrink-0" />
          Upload files
        </button>
      </div>
      <p className="mb-3 text-xs text-ink-muted">
        Accepted file types: {DOCUMENT_SOURCE_TYPES.join(", ")}.
      </p>
      {rejected.length > 0 && (
        <p role="alert" className="mb-3 max-w-2xl text-sm text-accent-ink">
          We can&apos;t read {rejected.join(", ")}. The supported file types are
          listed above.
        </p>
      )}

      <div className="mb-3 flex gap-2.5">
        <input
          value={linkDraft}
          onChange={(e) => {
            setLinkDraft(e.target.value);
            setLinkError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && addLink()}
          placeholder="Or paste a link to a webpage"
          aria-label="Paste a link"
          aria-invalid={linkError}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent ${
            linkError ? "border-accent-ink" : "border-border-strong"
          }`}
        />
        <button
          onClick={addLink}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent"
        >
          Add link
        </button>
      </div>
      {linkError && (
        <p role="alert" className="mb-3 max-w-2xl text-sm text-accent-ink">
          That doesn&apos;t look like a webpage address. Links should look like
          example.org or https://example.org/page.
        </p>
      )}

      {uploads.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploads.map((u, i) => {
            // A chip holds either a file name or a canonical link; only the
            // latter is shortened, and only for display.
            const label = formatWebpageLabel(u);
            return (
              <span
                key={`${u}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-alt py-1 pr-1.5 pl-3 text-xs font-bold text-ink-secondary"
              >
                <FileText size={12} className="shrink-0" />
                {label}
                <button
                  onClick={() => onRemove(i)}
                  aria-label={`Remove ${label}`}
                  className="flex h-4 w-4 flex-none items-center justify-center rounded-full text-ink-muted transition duration-150 hover:bg-divider-2 hover:text-ink"
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
