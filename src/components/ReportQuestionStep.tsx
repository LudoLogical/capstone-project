"use client";

import { useState } from "react";
import type { ReportQuestionStep } from "@/data/seed";
import type { ReportChatState } from "@/store/useAppStore";

type Props = {
  stepDef: ReportQuestionStep;
  chat: ReportChatState;
  marked: boolean;
  onTogglePick: (itemId: string) => void;
  onSend: (text: string) => void;
  onMarkComplete: () => void;
};

export default function ReportQuestionStep({
  stepDef,
  chat,
  marked,
  onTogglePick,
  onSend,
  onMarkComplete,
}: Props) {
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <div>
      <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
        Question {stepDef.index} · {stepDef.topic}
      </div>
      <h2 className="mb-4 font-serif text-2xl leading-tight font-medium">
        {stepDef.question}
      </h2>

      <div className="mb-4 rounded-2xl border border-border bg-surface-alt p-6">
        <div className="mb-3 text-sm font-bold">
          Here&apos;s what I found in your application and data for this one:
        </div>
        <div className="flex flex-col gap-2">
          {stepDef.items.map((item) => {
            const picked = !!chat.picks[item.id];
            return (
              <button
                key={item.id}
                onClick={() => onTogglePick(item.id)}
                aria-pressed={picked}
                className={`flex items-center justify-between gap-2.5 rounded-xl border px-3.5 py-3 text-left ${
                  picked
                    ? "border-accent bg-accent-tint"
                    : "border-border-strong bg-white"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-ink-muted">{item.source}</div>
                </div>
                <div className="text-base">{picked ? "✓" : "+"}</div>
              </button>
            );
          })}
        </div>
      </div>

      {chat.messages.length > 0 && (
        <div className="mb-3.5 flex flex-col gap-2.5">
          {chat.messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-4/5 rounded-xl px-3.5 py-2.5 text-sm leading-normal ${
                m.from === "user"
                  ? "self-end bg-accent text-white"
                  : "self-start bg-surface-alt text-ink-body"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex gap-2.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Add anything in your own words..."
          aria-label={`Response to: ${stepDef.question}`}
          className="w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none"
        />
        <button
          onClick={send}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>

      <button
        onClick={onMarkComplete}
        className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
          marked
            ? "border-success-border bg-success-bg text-success-ink"
            : "border-border-strong bg-white text-ink"
        }`}
      >
        {marked ? "✓ Marked as complete" : "Mark as complete"}
      </button>
    </div>
  );
}
