"use client";

import Modal from "@/components/primitives/Modal";
import { formatDate } from "@/utils/format";

/**
 * Shown when the user tries to work on a grant whose application window has
 * already closed. There's nothing to salvage here, so the only action offered
 * is removing it from their board.
 */
export default function ClosedGrantModal({
  grantName,
  closedOn,
  onClose,
  onRemove,
}: {
  grantName: string;
  closedOn: Date;
  onClose: () => void;
  onRemove: () => void;
}) {
  return (
    <Modal open onClose={onClose} title="This grant has closed">
      <p className="text-sm leading-relaxed text-ink-body">
        The application window for{" "}
        <span className="font-semibold">{grantName}</span> closed on{" "}
        <span className="font-semibold">{formatDate(closedOn)}</span>. You can
        no longer work on this grant.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Anything you gathered for it stays in your profile, so it&apos;s there
        for the next grant you go after.
      </p>
      <div className="mt-5 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
        >
          Keep it for now
        </button>
        <button
          onClick={onRemove}
          className="rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold text-white shadow-cta transition duration-150 hover:bg-accent-ink-2 active:translate-y-px"
        >
          Got it, remove grant
        </button>
      </div>
    </Modal>
  );
}
