import { useState } from "react";
import type { ReportQuestionStep } from "@/data/seed";
import type { ReportChatState } from "@/store/useAppStore";

type Props = {
  stepDef: ReportQuestionStep;
  chat: ReportChatState;
  onTogglePick: (itemId: string) => void;
  onSend: (text: string) => void;
  onMarkComplete: () => void;
};

export default function ReportQuestionStep({ stepDef, chat, onTogglePick, onSend, onMarkComplete }: Props) {
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Question {stepDef.index} · {stepDef.topic}
      </div>
      <h2 className="h2-serif" style={{ marginBottom: 18 }}>
        {stepDef.question}
      </h2>

      <div className="card" style={{ marginBottom: 18, background: "var(--color-surface-alt)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
          Here's what I found in your application and data for this one:
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stepDef.items.map((item) => {
            const picked = !!chat.picks[item.id];
            return (
              <button
                key={item.id}
                onClick={() => onTogglePick(item.id)}
                aria-pressed={picked}
                style={{
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${picked ? "var(--color-accent)" : "var(--color-border-strong)"}`,
                  background: picked ? "var(--color-accent-tint)" : "#fff",
                  cursor: "pointer",
                  fontFamily: "var(--font-ui)",
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{item.source}</div>
                </div>
                <div style={{ fontSize: 16 }}>{picked ? "✓" : "+"}</div>
              </button>
            );
          })}
        </div>
      </div>

      {chat.messages.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {chat.messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.from === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                background: m.from === "user" ? "var(--color-accent)" : "var(--color-surface-alt)",
                color: m.from === "user" ? "#fff" : "var(--color-text-body)",
                padding: "10px 14px",
                borderRadius: 14,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {m.text}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Add anything in your own words..."
          aria-label={`Response to: ${stepDef.question}`}
          className="input"
        />
        <button onClick={send} className="btn btn-secondary">
          Send
        </button>
      </div>

      <button
        onClick={onMarkComplete}
        className="btn btn-sm"
        style={
          chat.marked
            ? { background: "var(--color-success-bg)", color: "var(--color-success-ink)", border: "1px solid var(--color-success-border)" }
            : { background: "#fff", border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }
        }
      >
        {chat.marked ? "✓ Marked as complete" : "Mark as complete"}
      </button>
    </div>
  );
}
