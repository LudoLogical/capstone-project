"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /**
   * A Tailwind max-width class. Was a pixel number (420 / 460 / 480), but all
   * three collapse onto `max-w-md` on the baseline scale, so callers no longer
   * pass anything.
   */
  maxWidth?: string;
  /**
   * Bare mode: render the dialog surface with no padding, no title row, and no
   * built-in close button, so the caller fully controls the layout (e.g. a
   * full-bleed colored header with its own close control).
   */
  bare?: boolean;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  bare = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  // Render into <body> via a portal so the fixed overlay is measured against the
  // viewport, not an ancestor with a transform (the page containers animate with
  // a transform, which would otherwise offset the modal and force scrolling).
  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      className="animate-nc-pop fixed inset-0 z-50 flex items-center justify-center bg-scrim p-5"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-full w-full ${maxWidth} overflow-y-auto rounded-2xl bg-white ${
          bare ? "" : "p-7"
        }`}
      >
        {bare ? (
          children
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              {title && (
                <h2 className="font-serif text-xl leading-tight font-bold">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1 text-lg leading-none text-ink-muted enabled:hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
            <div className={title ? "mt-4" : ""}>{children}</div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
