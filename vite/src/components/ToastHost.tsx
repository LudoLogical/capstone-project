import { useAppStore } from "@/store/useAppStore";

export default function ToastHost() {
  const toasts = useAppStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 200,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: "var(--color-text)",
            color: "#fff",
            font: "600 13.5px var(--font-ui)",
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-toast)",
            animation: "ncToast .25s ease both",
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
