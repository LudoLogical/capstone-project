"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  ACCOUNT_ORG_NAME,
  REPOSITORY_FILES,
  REPOSITORY_LINKS,
  REPOSITORY_CONVERSATIONS,
  type RepositoryItem,
} from "@/data/seed";
import Modal from "@/components/Modal";
import BackButton from "@/components/BackButton";
import { useAppStore } from "@/store/useAppStore";

type RepositoryKind = "file" | "link" | "conversation";

// A live object URL for a file the user uploaded this session.
type FileBlob = { url: string; type: string };

const PAGE_SIZE = 6;

/**
 * The Profile screen is a data repository: three collections the app pulls from
 * when filling in applications and reports. Each section paginates its rows and
 * lets you remove an item. State is local - this is prototype content, not a
 * persisted store.
 */
export default function AccountProfilePage() {
  const router = useRouter();
  const onboardOrg = useAppStore((s) => s.onboardOrg);
  const restartOnboarding = useAppStore((s) => s.restartOnboarding);
  const orgName = onboardOrg.name.trim() || ACCOUNT_ORG_NAME;

  const editSetup = () => {
    restartOnboarding();
    router.push("/");
  };

  return (
    <div className="animate-nc-rise mx-auto w-full px-8 pt-7 pb-20">
      <BackButton fallback="/" />
      <h1 className="mb-2.5 font-serif text-3xl leading-tight font-medium">
        {orgName}
      </h1>
      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-ink-muted">
        This is the information you&apos;ve saved so far. We pull from it to fill
        in your grant applications and put together your outcome reports, and you
        can edit any of it right here.
      </p>

      {(onboardOrg.issues.length > 0 || onboardOrg.areas.length > 0) && (
        <div className="mb-9 rounded-2xl border border-border bg-surface p-6">
          <div className="mb-1 text-base font-bold">
            What you told us during setup
          </div>
          <p className="mb-4 text-sm leading-relaxed text-ink-muted">
            We use this to match you with grants. Update it anytime by{" "}
            <button
              onClick={editSetup}
              className="font-semibold text-ink underline underline-offset-2 hover:text-accent"
            >
              revisiting setup
            </button>
            .
          </p>
          {onboardOrg.issues.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
                Issues you work on
              </div>
              <div className="flex flex-wrap gap-2">
                {onboardOrg.issues.map((issue) => (
                  <span
                    key={issue}
                    className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-alt px-3 py-1 text-xs font-bold text-ink-secondary"
                  >
                    {issue}
                  </span>
                ))}
              </div>
            </div>
          )}
          {onboardOrg.areas.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
                Where you serve
              </div>
              <div className="flex flex-wrap gap-2">
                {onboardOrg.areas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-alt px-3 py-1 text-xs font-bold text-ink-secondary"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <RepositorySection
        title="Files"
        kind="file"
        description="Files you've uploaded while working on applications and outcome reports. We save them and pull from them the next time you apply or report."
        addLabel="Upload new file"
        addIcon="📤"
        fileUpload
        verb="Uploaded"
        items={REPOSITORY_FILES}
        underlineLabel
      />

      <RepositorySection
        title="Website Links"
        kind="link"
        description="Website links you've saved while working on applications and reports. We pull from them the next time you apply or report."
        addLabel="Add new website link"
        addIcon="📋"
        addPlaceholder="https://example.org"
        verb="Uploaded"
        items={REPOSITORY_LINKS}
        underlineLabel
      />

      <RepositorySection
        title="From Your Conversations"
        kind="conversation"
        description="Things you told us while working on your reports. We saved them and pull from them the next time you apply or report."
        verb="Logged"
        items={REPOSITORY_CONVERSATIONS}
        help={
          <>
            These are the data points captured from your conversations with the
            AI while you build an outcome report. To add or change them, head to
            your outcome reports, which you can open from the{" "}
            <Link
              href="/"
              className="font-semibold text-ink underline underline-offset-2 hover:text-accent"
            >
              dashboard
            </Link>
            .
          </>
        }
      />
    </div>
  );
}

function RepositorySection({
  title,
  kind,
  description,
  addLabel,
  addIcon,
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
  addIcon?: string;
  verb: "Uploaded" | "Logged";
  items: RepositoryItem[];
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
  const [preview, setPreview] = useState<RepositoryItem | null>(null);
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
      <h2 className="mb-1.5 font-serif text-2xl leading-tight font-medium">
        {title}
      </h2>
      <p className="mb-3.5 max-w-3xl text-sm leading-relaxed text-ink-muted">
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
            <p className="mt-2 max-w-2xl pl-7 text-sm leading-relaxed text-ink-muted">
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
            <span aria-hidden>{addIcon}</span> {addLabel}
          </button>
        </div>
      ) : (
        <div className="mb-3.5">
          <button
            onClick={() => setAdding((v) => !v)}
            aria-expanded={adding}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-3 py-1.5 text-sm font-semibold text-ink-secondary transition duration-150 hover:border-accent"
          >
            <span aria-hidden>{addIcon}</span> {addLabel}
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
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition duration-150 hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="rounded-xl border border-dashed border-border-strong px-4 py-8 text-center text-sm text-ink-faint">
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
                  <div className="mt-0.5 text-xs text-ink-faint">
                    {verb} {item.date} by {item.by}
                  </div>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.label}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent-tint-border bg-accent-tint px-3 py-2 text-xs font-semibold text-accent-ink transition duration-150 hover:border-accent hover:bg-accent-tint-2"
                >
                  <span aria-hidden>🗑</span> Remove
                </button>
              </div>
            ))}
            {/* Invisible spacers keep the card the same height on partial pages. */}
            {Array.from({ length: PAGE_SIZE - pageItems.length }).map((_, i) => (
              <div
                key={`spacer-${i}`}
                aria-hidden
                className="invisible border border-transparent px-4 py-3"
              >
                <div className="text-sm font-semibold">&nbsp;</div>
                <div className="mt-0.5 text-xs">&nbsp;</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-6">
          <button
            onClick={() => setPage(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            aria-label="Previous page"
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-secondary transition duration-150 enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Go to page ${i + 1}`}
                aria-current={i === safePage ? "page" : undefined}
                className={`h-2 w-2 rounded-full transition duration-150 ${
                  i === safePage ? "bg-accent" : "bg-divider-2 hover:bg-border-strong"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
            disabled={safePage === pageCount - 1}
            aria-label="Next page"
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-secondary transition duration-150 enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-1 text-center text-xs text-ink-faint">
          Page {safePage + 1} of {pageCount}
        </div>
      )}

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

/** The preview shown when a repository item is clicked. */
function RepositoryPreview({
  kind,
  item,
  verb,
  blob,
}: {
  kind: RepositoryKind;
  item: RepositoryItem;
  verb: "Uploaded" | "Logged";
  blob?: FileBlob;
}) {
  const meta = (
    <div className="mt-4 text-xs text-ink-faint">
      {verb} {item.date} by {item.by}
    </div>
  );

  if (kind === "link") {
    const href = item.label.startsWith("http")
      ? item.label
      : `https://${item.label}`;
    return (
      <div>
        <div className="mb-1.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
          Saved link
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm font-semibold break-all text-accent underline underline-offset-2 hover:text-accent-ink"
        >
          {item.label}
        </a>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Opens in a new tab. We pull from this page the next time you apply or
          report.
        </p>
        {meta}
      </div>
    );
  }

  if (kind === "conversation") {
    return (
      <div>
        <div className="mb-1.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
          Captured from your conversations
        </div>
        <div className="rounded-xl border border-border bg-surface-alt px-4 py-3.5">
          <p className="text-base leading-relaxed text-ink-body">
            “{item.label}”
          </p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          We saved this while you built an outcome report, and reuse it the next
          time you apply or report.
        </p>
        {meta}
      </div>
    );
  }

  // file
  const ext = item.label.includes(".")
    ? item.label.split(".").pop()!.toUpperCase()
    : "FILE";

  // When we have the actual uploaded file, show it: images render inline, PDFs
  // in an embedded viewer, and anything else opens the real file in a new tab.
  if (blob) {
    const isImage = blob.type.startsWith("image/");
    const isPdf = blob.type === "application/pdf";
    return (
      <div>
        <div className="mb-1.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
          Uploaded file
        </div>
        {isImage ? (
          // A user-selected blob URL, not a remote asset - next/image can't
          // optimize an object URL, so a plain img is correct here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blob.url}
            alt={item.label}
            className="max-h-96 w-full rounded-xl border border-border bg-surface-alt object-contain"
          />
        ) : isPdf ? (
          <iframe
            src={blob.url}
            title={item.label}
            className="h-96 w-full rounded-xl border border-border bg-surface-alt"
          />
        ) : (
          <div className="flex items-center gap-3.5 rounded-xl border border-border bg-surface-alt px-4 py-4">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-accent-tint text-lg text-accent-ink">
              📄
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">
                {item.label}
              </div>
              <div className="text-xs text-ink-faint">{ext} file</div>
            </div>
            <a
              href={blob.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-none rounded-lg border border-border-strong bg-white px-3 py-2 text-xs font-semibold text-ink transition duration-150 hover:border-accent"
            >
              Open file ↗
            </a>
          </div>
        )}
        {meta}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-1.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
        Uploaded file
      </div>
      <div className="flex items-center gap-3.5 rounded-xl border border-border bg-surface-alt px-4 py-4">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-accent-tint text-lg text-accent-ink">
          📄
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">
            {item.label}
          </div>
          <div className="text-xs text-ink-faint">{ext} document</div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        This file was saved from an earlier session, so only its details are
        shown here. We pull evidence from it the next time you apply or report.
      </p>
      {meta}
    </div>
  );
}
