"use client";

import { useRef, useState } from "react";
import type { ReportQuestionStep } from "@/data/seed";
import type { ReportChatState } from "@/store/useAppStore";
import DeleteDataConfirmModal from "./DeleteDataConfirmModal";

type Props = {
  stepDef: ReportQuestionStep;
  chat: ReportChatState;
  onTogglePick: (itemId: string) => void;
  onSend: (text: string) => void;
  onAttach: (fileName: string) => void;
  onDelete: (itemId: string) => void;
  // When true, deleting a found item skips the confirmation dialog.
  skipDeleteConfirm: boolean;
  onSkipDeleteConfirm: () => void;
};

export default function ReportQuestionStep({
  stepDef,
  chat,
  onTogglePick,
  onSend,
  onAttach,
  onDelete,
  skipDeleteConfirm,
  onSkipDeleteConfirm,
}: Props) {
  const [draft, setDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // The found item awaiting delete confirmation, or null when no dialog is open.
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const send = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
  };

  const requestDelete = (id: string, label: string) => {
    if (skipDeleteConfirm) onDelete(id);
    else setPendingDelete({ id, label });
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
        <div className="mb-3 text-xs font-bold tracking-wider text-ink-muted uppercase">
          Chat with the reporting assistant
        </div>
        {chat.messages.length > 0 && (
          <div
            className={`mb-3.5 flex flex-col gap-2.5 ${
              chat.messages.length > 3
                ? "max-h-72 overflow-y-auto rounded-xl border border-border bg-white/50 p-3"
                : ""
            }`}
          >
            {chat.messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-4/5 rounded-xl px-3.5 py-2.5 text-sm leading-normal ${
                  m.from === "user"
                    ? "self-end bg-accent text-white"
                    : "self-start bg-white text-ink-body"
                }`}
              >
                {m.text}
              </div>
            ))}
            {/* The assistant "types" between the user's message landing and its
                reply arriving, giving the exchange a live feel. */}
            {chat.messages[chat.messages.length - 1]?.from === "user" && (
              <div className="max-w-4/5 self-start rounded-xl bg-white px-3.5 py-2.5 text-sm text-ink-muted">
                <span className="inline-flex gap-1">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse [animation-delay:0.15s]">●</span>
                  <span className="animate-pulse [animation-delay:0.3s]">●</span>
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Tell the assistant anything in your own words..."
            aria-label={`Response to: ${stepDef.question}`}
            className="w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAttach(file.name);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach a file"
            title="Attach a file"
            className="inline-flex flex-none items-center justify-center rounded-xl border border-border-strong bg-white px-4 py-3 text-base text-ink transition duration-150 hover:border-accent"
          >
            <span aria-hidden>📎</span>
          </button>
          <button
            onClick={send}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-border bg-surface-alt p-6">
        <div className="mb-3 text-sm font-bold">
          Here&apos;s the data points I found for this one:
        </div>
        <div className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
          {stepDef.items
            .filter((item) => !chat.removed?.[item.id])
            .map((item) => (
              <FoundItem
                key={item.id}
                id={item.id}
                label={item.label}
                source={item.source}
                picked={!!chat.picks[item.id]}
                onTogglePick={() => onTogglePick(item.id)}
                onDelete={() => requestDelete(item.id, item.label)}
              />
            ))}
          {(chat.custom ?? []).map((text, i) => {
            const id = `custom-${i}`;
            if (chat.removed?.[id]) return null;
            return (
              <FoundItem
                key={id}
                id={id}
                label={text}
                source={
                  chat.customSources?.[i]
                    ? `From ${chat.customSources[i]}`
                    : "Added by you"
                }
                picked={!!chat.picks[id]}
                onTogglePick={() => onTogglePick(id)}
                onDelete={() => requestDelete(id, text)}
              />
            );
          })}
        </div>
      </div>

      <DeleteDataConfirmModal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
        onConfirmDontAsk={() => {
          onSkipDeleteConfirm();
          if (pendingDelete) onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

/** One card in the "Here's what I found" list: left checkbox, content, and a
 *  delete "×" in the upper right. */
function FoundItem({
  label,
  source,
  picked,
  onTogglePick,
  onDelete,
}: {
  id: string;
  label: string;
  source: string;
  picked: boolean;
  onTogglePick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`relative rounded-xl border ${
        picked ? "border-accent bg-accent-tint" : "border-border-strong bg-white"
      }`}
    >
      <button
        onClick={onTogglePick}
        aria-pressed={picked}
        className="flex w-full items-start gap-3 px-3.5 py-3 pr-10 text-left"
      >
        <span
          aria-hidden
          className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
            picked ? "border-accent bg-accent" : "border-checkbox"
          }`}
        >
          {picked ? "✓" : ""}
        </span>
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs text-ink-muted">{source}</div>
        </div>
      </button>
      <button
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        title="Delete"
        className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-base text-ink-faint transition duration-150 hover:bg-white hover:text-accent-ink"
      >
        ✕
      </button>
    </div>
  );
}
