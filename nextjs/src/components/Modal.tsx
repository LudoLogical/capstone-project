"use client";

import { useEffect, type ReactNode } from "react";

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
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
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
        className={`max-h-full w-full ${maxWidth} overflow-y-auto rounded-2xl bg-white p-7`}
      >
        <div className="flex items-start justify-between gap-4">
          {title && (
            <h2 className="font-serif text-xl leading-tight font-medium">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-lg leading-none text-ink-muted enabled:hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div className={title ? "mt-4" : ""}>{children}</div>
      </div>
    </div>
  );
}
