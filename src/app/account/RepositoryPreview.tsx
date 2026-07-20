"use client";

import { InitiativeSourceKind } from "@/types/data";
import { FileText, ArrowUpRight } from "lucide-react";

/** A live object URL for a file the user uploaded this session. */
export type FileBlob = { url: string; type: string };

/** The preview shown when a repository item is clicked. */
export default function RepositoryPreview({
  kind,
  label,
  date,
  creator,
  verb,
  blob,
}: {
  kind: InitiativeSourceKind;
  label: string;
  date: string;
  creator: string;
  verb: "Uploaded" | "Logged";
  blob?: FileBlob;
}) {
  const meta = (
    <div className="mt-4 text-xs text-ink-muted">
      {verb} {date} by {creator}
    </div>
  );

  if (kind === InitiativeSourceKind.Webpage) {
    const href = label.startsWith("http") ? label : `https://${label}`;
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
          {label}
        </a>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Opens in a new tab. We pull from this page the next time you apply or
          report.
        </p>
        {meta}
      </div>
    );
  }

  if (kind === InitiativeSourceKind.Chat) {
    return (
      <div>
        <div className="mb-1.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
          Captured from your conversations
        </div>
        <div className="rounded-xl border border-border bg-surface-alt px-4 py-3.5">
          <p className="text-base leading-relaxed text-ink-body">“{label}”</p>
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
  const ext = label.includes(".")
    ? label.split(".").pop()!.toUpperCase()
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
            alt={label}
            className="max-h-96 w-full rounded-xl border border-border bg-surface-alt object-contain"
          />
        ) : isPdf ? (
          <iframe
            src={blob.url}
            title={label}
            className="h-96 w-full rounded-xl border border-border bg-surface-alt"
          />
        ) : (
          <div className="flex items-center gap-3.5 rounded-xl border border-border bg-surface-alt px-4 py-4">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-accent-tint text-lg text-accent-ink">
              <FileText size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">
                {label}
              </div>
              <div className="text-xs text-ink-muted">{ext} file</div>
            </div>
            <a
              href={blob.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-none items-center gap-1 rounded-lg border border-border-strong bg-white px-3 py-2 text-xs font-semibold text-ink transition duration-150 hover:border-accent"
            >
              Open file <ArrowUpRight size={13} className="shrink-0" />
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
          <FileText size={20} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">{label}</div>
          <div className="text-xs text-ink-muted">{ext} document</div>
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
