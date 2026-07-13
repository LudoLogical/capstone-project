"use client";

import { useAppStore } from "@/store/useAppStore";

export default function ToastHost() {
  const toasts = useAppStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-nc-toast rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-toast"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
