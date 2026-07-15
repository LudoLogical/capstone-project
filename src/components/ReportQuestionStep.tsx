"use client";

import { useState } from "react";
import type { ReportQuestionStep } from "@/data/seed";
import type { ReportChatState } from "@/store/useAppStore";

type Props = {
  stepDef: ReportQuestionStep;
  chat: ReportChatState;
  onTogglePick: (itemId: string) => void;
  onSend: (text: string) => void;
};

export default function ReportQuestionStep({
  stepDef,
  chat,
  onTogglePick,
  onSend,
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
          {(chat.custom ?? []).map((text, i) => {
            const id = `custom-${i}`;
            const picked = !!chat.picks[id];
            return (
              <button
                key={id}
                onClick={() => onTogglePick(id)}
                aria-pressed={picked}
                className={`flex items-center justify-between gap-2.5 rounded-xl border px-3.5 py-3 text-left ${
                  picked
                    ? "border-accent bg-accent-tint"
                    : "border-border-strong bg-white"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{text}</div>
                  <div className="text-xs text-ink-muted">Added by you</div>
                </div>
                <div className="text-base">{picked ? "✓" : "+"}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
        Chat with the reporting assistant
      </div>
      {chat.messages.length > 0 && (
        <div
          className={`mb-3.5 flex flex-col gap-2.5 ${
            chat.messages.length > 3
              ? "max-h-72 overflow-y-auto rounded-xl border border-border bg-surface-alt/40 p-3"
              : ""
          }`}
        >
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
          {/* The assistant "types" between the user's message landing and its
              reply arriving, giving the exchange a live feel. */}
          {chat.messages[chat.messages.length - 1]?.from === "user" && (
            <div className="max-w-4/5 self-start rounded-xl bg-surface-alt px-3.5 py-2.5 text-sm text-ink-muted">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse [animation-delay:0.15s]">●</span>
                <span className="animate-pulse [animation-delay:0.3s]">●</span>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mb-4 flex gap-2.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Tell the assistant anything in your own words..."
          aria-label={`Response to: ${stepDef.question}`}
          className="w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
        />
        <button
          onClick={send}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
