import { useEffect, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: number;
};

export default function Modal({ open, onClose, title, children, maxWidth = 480 }: ModalProps) {
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
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(43,36,34,.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
        animation: "ncToast .2s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "var(--radius-xl)",
          padding: 28,
          width: "100%",
          maxWidth,
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          {title && <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 21 }}>{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close"
            className="btn-ghost"
            style={{ fontSize: 18, lineHeight: 1, padding: 4 }}
          >
            ✕
          </button>
        </div>
        <div style={{ marginTop: title ? 16 : 0 }}>{children}</div>
      </div>
    </div>
  );
}
