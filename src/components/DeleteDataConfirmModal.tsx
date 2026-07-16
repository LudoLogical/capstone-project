"use client";

import Link from "next/link";
import Modal from "./Modal";

/**
 * Confirmation shown before deleting a found data point in the report flow.
 * "Yes, and don't ask again" both confirms and suppresses the dialog for later
 * deletes (via `onConfirmDontAsk`).
 */
export default function DeleteDataConfirmModal({
  open,
  onClose,
  onConfirm,
  onConfirmDontAsk,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onConfirmDontAsk: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Delete this data point?">
      <p className="mb-4 text-sm leading-relaxed text-ink-body">
        Are you sure you want to delete this piece of data we found?
      </p>
      <div className="mb-4 flex flex-wrap gap-2.5">
        <button
          onClick={onConfirm}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 hover:brightness-105"
        >
          Yes, delete
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
        >
          No, keep it
        </button>
        <button
          onClick={onConfirmDontAsk}
          className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
        >
          Yes, and don&apos;t ask again
        </button>
      </div>
      <p className="text-xs leading-relaxed text-ink-muted">
        The source we pulled this from will still be stored, and we may pull from
        it again. You can access all the sources we store on your{" "}
        <Link
          href="/account"
          className="font-semibold text-accent underline underline-offset-2 hover:text-accent-ink"
        >
          profile
        </Link>{" "}
        page.
      </p>
    </Modal>
  );
}
