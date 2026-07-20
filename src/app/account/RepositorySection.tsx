"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import type { RepositoryRow } from "@/app/account/repositoryRows";
import type { LucideIcon } from "lucide-react";
import { Trash2 } from "lucide-react";
import Modal from "@/components/primitives/Modal";
import Pagination from "@/components/primitives/Pagination";
import RepositoryPreview, {
  type RepositoryKind,
  type FileBlob,
} from "@/app/account/RepositoryPreview";

const PAGE_SIZE = 6;

export default function RepositorySection({
  title,
  kind,
  description,
  addLabel,
  addIcon: AddIcon,
  verb,
  items: initialItems,
  underlineLabel = false,
  addPlaceholder,
  fileUpload = false,
  help,
}: {
  title: string;
  kind: RepositoryKind;
  description: string;
  addLabel?: string;
  addIcon?: LucideIcon;
  verb: "Uploaded" | "Logged";
  items: RepositoryRow[];
  underlineLabel?: boolean;
  addPlaceholder?: string;
  fileUpload?: boolean;
  help?: ReactNode;
}) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [preview, setPreview] = useState<RepositoryRow | null>(null);
  // Object URLs for files the user actually uploaded this session, keyed by
  // item id, so their preview can show the real file instead of a placeholder.
  const [blobs, setBlobs] = useState<Record<string, FileBlob>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);

  const appendItem = (label: string, file?: File) => {
    const date = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const id = `new-${Date.now()}-${idCounter.current++}`;
    setItems((prev) => {
      const next = [...prev, { id, label, date, by: "Maya123" }];
      // Jump to the last page so the new item is visible.
      setPage(Math.ceil(next.length / PAGE_SIZE) - 1);
      return next;
    });
    if (file) {
      setBlobs((prev) => ({
        ...prev,
        [id]: { url: URL.createObjectURL(file), type: file.type },
      }));
    }
  };

  const addItem = () => {
    const label = draft.trim();
    if (!label) return;
    appendItem(label);
    setDraft("");
    setAdding(false);
  };

  const onFilesPicked = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => appendItem(file.name, file));
  };

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  // Keep the current page in range as items are removed.
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = useMemo(
    () => items.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [items, safePage],
  );

  const remove = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

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
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addItem();
                  if (e.key === "Escape") setAdding(false);
                }}
                placeholder={addPlaceholder}
                aria-label={addLabel}
                className="min-w-64 flex-1 rounded-lg border border-border-strong bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
              <button
                onClick={addItem}
                disabled={!draft.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-4 py-2 text-sm font-semibold text-white transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setDraft("");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
              >
                Cancel
              </button>
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
            {pageItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border-soft bg-surface-alt px-4 py-3"
              >
                <div className="min-w-48 flex-1">
                  <button
                    onClick={() => setPreview(item)}
                    className={`block text-left text-sm font-semibold text-ink transition duration-150 hover:text-accent ${
                      underlineLabel ? "underline underline-offset-2" : ""
                    }`}
                  >
                    {item.label}
                  </button>
                  <div className="mt-0.5 text-xs text-ink-muted">
                    {verb} {item.date} by {item.by}
                  </div>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.label}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent-tint-border bg-accent-tint px-3 py-2 text-xs font-semibold text-accent-ink transition duration-150 hover:border-accent hover:bg-accent-tint-2"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            ))}
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

      {preview && (
        <Modal open onClose={() => setPreview(null)} title={preview.label}>
          <RepositoryPreview
            kind={kind}
            item={preview}
            verb={verb}
            blob={blobs[preview.id]}
          />
        </Modal>
      )}
    </section>
  );
}
