"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { InitiativeSourceKind, type InitiativeSource } from "@/types/data";
import { USER_DISPLAY_NAME } from "@/data/seed";
import {
  documentType,
  formatLongDate,
  normalizeWebpageUrl,
  sourceLabel,
} from "@/utils/format";
import type { LucideIcon } from "lucide-react";
import { Download, ExternalLink, Trash2 } from "lucide-react";
import Pagination from "@/components/primitives/Pagination";
import { DOCUMENT_SOURCE_TYPES } from "@/types/constants";

const PAGE_SIZE = 6;

/** The `accept` attribute for the file picker, e.g. ".txt,.md,...". */
const ACCEPTED_EXTENSIONS = DOCUMENT_SOURCE_TYPES.map((t) => `.${t}`).join(",");

export default function RepositorySection({
  title,
  kind,
  description,
  addLabel,
  addIcon: AddIcon,
  verb,
  sources,
  onAddDocuments,
  onAddWebpage,
  onRemove,
  underlineLabel = false,
  addPlaceholder,
  fileUpload = false,
  help,
}: {
  title: string;
  kind: InitiativeSourceKind;
  description: string;
  addLabel?: string;
  addIcon?: LucideIcon;
  verb: "Uploaded" | "Logged";
  // Owned by the store, not by this section: sources added while gathering data
  // for a grant have to show up here too, so the list can't be local state.
  sources: InitiativeSource[];
  // Absent on the read-only section, which has nothing to add.
  onAddDocuments?: (files: File[]) => void;
  onAddWebpage?: (link: string) => void;
  onRemove: (id: string) => void;
  underlineLabel?: boolean;
  addPlaceholder?: string;
  fileUpload?: boolean;
  help?: ReactNode;
}) {
  const [page, setPage] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  // Names of files from the most recent pick that we couldn't accept.
  const [rejected, setRejected] = useState<string[]>([]);
  // Set when the draft holds something that isn't a URL, cleared as soon as the
  // user edits it again so the message doesn't outlive the mistake.
  const [draftError, setDraftError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Jump to the last page so newly added items are visible. The list lives in
  // the store now, so the new length is computed rather than read back.
  const showLastPageFor = (added: number) =>
    setPage(Math.ceil((sources.length + added) / PAGE_SIZE) - 1);

  const addWebpage = () => {
    if (!draft.trim()) return;
    const url = normalizeWebpageUrl(draft);
    if (!url) {
      setDraftError(true);
      return;
    }
    onAddWebpage?.(url);
    showLastPageFor(1);
    setDraft("");
    setDraftError(false);
    setAdding(false);
  };

  // Files whose type we don't accept are dropped and named back to the user,
  // so a rejected upload is never mistaken for a successful one.
  const onFilesPicked = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files);
    const accepted = picked.filter((f) => documentType(f.name));
    if (accepted.length > 0) {
      onAddDocuments?.(accepted);
      showLastPageFor(accepted.length);
    }
    setRejected(picked.filter((f) => !documentType(f.name)).map((f) => f.name));
  };

  const pageCount = Math.max(1, Math.ceil(sources.length / PAGE_SIZE));
  // Keep the current page in range as items are removed.
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = useMemo(
    () => sources.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [sources, safePage],
  );

  const labelText = `text-sm font-semibold text-ink ${
    underlineLabel ? "underline underline-offset-2" : ""
  }`;
  // Applied to both the text and the trailing icon so the whole label reacts as
  // one, whichever half the cursor is over.
  const labelHover = "transition duration-150 group-hover:text-accent";

  /**
   * A row's label reads differently by kind: a file downloads itself when
   * clicked (the download isn't wired up yet, so only the affordance is here),
   * a link opens in a new tab, and a captured message isn't interactive at all.
   */
  const renderLabel = (source: InitiativeSource, label: string) => {
    if (kind === InitiativeSourceKind.Chat) {
      return <div className={labelText}>{label}</div>;
    }
    if (source.kind === InitiativeSourceKind.Webpage) {
      return (
        <a
          // The stored link, not the shortened label - the latter has had its
          // scheme trimmed off for display.
          href={source.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5"
        >
          <span className={`${labelText} ${labelHover}`}>{label}</span>
          <ExternalLink
            size={13}
            aria-hidden
            className={`shrink-0 text-ink ${labelHover}`}
          />
        </a>
      );
    }
    return (
      <div className="group inline-flex items-center gap-1.5">
        <span className={`${labelText} ${labelHover}`}>{label}</span>
        <Download
          size={13}
          aria-hidden
          className={`shrink-0 text-ink ${labelHover}`}
        />
      </div>
    );
  };

  return (
    <section className="mb-12">
      <h2 className="mb-1.5 font-serif text-xl leading-tight font-bold">
        {title}
      </h2>
      <p className="mb-3.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
        {description}
      </p>

      {help ? (
        <div className="mb-3.5">
          <button
            onClick={() => setHelpOpen((v) => !v)}
            aria-expanded={helpOpen}
            className="inline-flex items-center gap-2 text-sm text-ink-muted transition duration-150 hover:text-ink"
          >
            <span
              aria-hidden
              className="flex h-5 w-5 flex-none items-center justify-center rounded-full border border-border-strong text-xs font-semibold"
            >
              i
            </span>
            <span className="underline underline-offset-2">
              Why can&apos;t I add a data point here?
            </span>
          </button>
          {helpOpen && (
            <p className="mt-2 pl-7 max-w-2xl text-sm leading-relaxed text-ink-muted">
              {help}
            </p>
          )}
        </div>
      ) : fileUpload ? (
        <div className="mb-3.5">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS}
            className="hidden"
            onChange={(e) => {
              onFilesPicked(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-3 py-1.5 text-sm font-semibold text-ink-secondary transition duration-150 hover:border-accent"
          >
            {AddIcon ? <AddIcon size={15} /> : null} {addLabel}
          </button>
          {rejected.length > 0 && (
            <p
              role="alert"
              className="mt-2.5 max-w-2xl text-sm text-accent-ink"
            >
              We can&apos;t read {rejected.join(", ")}. The supported file types
              are: {DOCUMENT_SOURCE_TYPES.join(", ")}.
            </p>
          )}
        </div>
      ) : (
        <div className="mb-3.5">
          <button
            onClick={() => setAdding((v) => !v)}
            aria-expanded={adding}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-3 py-1.5 text-sm font-semibold text-ink-secondary transition duration-150 hover:border-accent"
          >
            {AddIcon ? <AddIcon size={15} /> : null} {addLabel}
          </button>
          {adding && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setDraftError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addWebpage();
                  if (e.key === "Escape") setAdding(false);
                }}
                placeholder={addPlaceholder}
                aria-label={addLabel}
                aria-invalid={draftError}
                className={`min-w-64 flex-1 rounded-lg border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent ${
                  draftError ? "border-accent-ink" : "border-border-strong"
                }`}
              />
              <button
                onClick={addWebpage}
                disabled={!draft.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-4 py-2 text-sm font-semibold text-white transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setDraft("");
                  setDraftError(false);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
              >
                Cancel
              </button>
              {draftError && (
                <p
                  role="alert"
                  className="w-full max-w-2xl text-sm text-accent-ink"
                >
                  That isn&apos;t a valid URL. Links should look like
                  example.org or https://example.org/page.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-4">
        {pageItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-strong px-4 py-8 text-center text-sm text-ink-muted">
            Nothing here yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {pageItems.map((item) => {
              const label = sourceLabel(item);
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border-soft bg-surface-alt px-4 py-3"
                >
                  <div className="min-w-48 flex-1">
                    {renderLabel(item, label)}
                    <div className="mt-0.5 text-xs text-ink-muted">
                      {verb} {formatLongDate(item.creationTime)} by{" "}
                      {USER_DISPLAY_NAME[item.creator] ?? item.creator}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${label}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-accent-tint-border bg-accent-tint px-3 py-2 text-xs font-semibold text-accent-ink transition duration-150 hover:border-accent hover:bg-accent-tint-2"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              );
            })}
            {/* Invisible spacers keep the card the same height on partial pages. */}
            {Array.from({ length: PAGE_SIZE - pageItems.length }).map(
              (_, i) => (
                <div
                  key={`spacer-${i}`}
                  aria-hidden
                  className="invisible border border-transparent px-4 py-3"
                >
                  <div className="text-sm font-semibold">&nbsp;</div>
                  <div className="mt-0.5 text-xs">&nbsp;</div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <Pagination
        page={safePage}
        pageCount={pageCount}
        onPageChange={setPage}
        label={title}
        className="mt-4"
      />
    </section>
  );
}
