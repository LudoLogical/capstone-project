"use client";

import { useState } from "react";
import Modal from "@/components/primitives/Modal";
import { RotateCcw } from "lucide-react";

/**
 * The "Reset this workflow" button at the foot of the step rail. It clears the
 * whole analysis step, so it confirms first - the reset can't be undone. Shaped
 * like the rail's step buttons, but kept red: it's the one destructive action
 * there.
 */
export default function ResetWorkflowButton({
  onReset,
}: {
  onReset: () => void;
}) {
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 text-left transition duration-150 hover:bg-error-bg"
      >
        <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-error-bg text-error-ink">
          <RotateCcw size={11} />
        </div>
        <span className="text-sm font-medium text-error-ink">
          Reset this workflow
        </span>
      </button>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Reset this workflow?"
      >
        <p className="mb-2 text-sm leading-relaxed text-ink-body">
          This can&apos;t be undone. Before you reset, make sure you&apos;ve
          saved any of the results from the analysis page that you want to keep.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-ink-body">
          Any information that you might have shared about your organization
          will be preserved on your account page so that it can be used in
          future analyses.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => {
              onReset();
              setConfirm(false);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-error-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition duration-150 hover:brightness-110"
          >
            Reset workflow
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}
