"use client";

import { useState } from "react";
import Modal from "./Modal";

/**
 * A red "Reset this analysis" button shown under the export controls. It clears
 * the whole analysis step, so it confirms first - the reset can't be undone.
 */
export default function ResetAnalysisButton({
  onReset,
}: {
  onReset: () => void;
}) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setConfirm(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-error-border bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-error-ink transition duration-150 hover:bg-error-bg"
      >
        Reset this analysis
      </button>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Reset this analysis?"
      >
        <p className="mb-4 text-sm leading-relaxed text-ink-body">
          This can&apos;t be undone. Before you reset, make sure you&apos;ve saved
          anything from this analysis you want to keep. The breakdown and its
          suggested language will be cleared.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => {
              onReset();
              setConfirm(false);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-error-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition duration-150 hover:brightness-110"
          >
            Reset analysis
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
