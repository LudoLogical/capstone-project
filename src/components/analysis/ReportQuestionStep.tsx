"use client";

import { useEffect, useRef, useState } from "react";
import type { ReportQuestionStep } from "@/data/seed";
import type { ReportChatState } from "@/store/useAppStore";
import DeleteDataConfirmModal from "@/components/modals/DeleteDataConfirmModal";
import FoundItem from "@/components/analysis/FoundItem";
import { BarChart3, Paperclip } from "lucide-react";

type Props = {
  stepDef: ReportQuestionStep;
  chat: ReportChatState;
  // The draft lives in the section's own chat state, so each page keeps its own
  // unsent message.
  onDraftChange: (text: string) => void;
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
  onDraftChange,
  onTogglePick,
  onSend,
  onAttach,
  onDelete,
  skipDeleteConfirm,
  onSkipDeleteConfirm,
}: Props) {
  const draft = chat.draft ?? "";
  const setDraft = onDraftChange;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the conversation grows (including the
  // assistant's reply, which lands a beat after the user's).
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.messages.length]);
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
      <h2 className="mb-4 font-serif text-xl leading-tight font-bold">
        {stepDef.question}
      </h2>

      {/* One chat window: a titled header, the thread, and the composer all live
          inside a single frame so they read as one interface rather than three
          stacked panels. */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2.5 border-b border-divider bg-surface-alt px-5 py-3">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-accent-tint text-sm text-accent-ink">
            <BarChart3 size={15} />
          </div>
          <div className="text-sm font-bold">Reporting assistant</div>
          <span className="rounded-full border border-accent-tint-border bg-accent-tint px-2 py-0.5 text-xs font-bold tracking-wider text-accent-ink uppercase">
            AI
          </span>
        </div>

        {/* The thread: tall enough to hold roughly ten back-and-forth exchanges
            before it scrolls, and to give an empty chat open space. */}
        <div
          ref={threadRef}
          className="flex max-h-160 min-h-104 flex-col gap-2.5 overflow-y-auto bg-white p-5"
        >
          {chat.messages.length === 0 ? (
            <div className="m-auto max-w-sm px-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-tint text-2xl text-accent-ink">
                <BarChart3 size={15} />
              </div>
              <div className="text-sm font-bold text-ink">
                You&apos;re chatting with an AI assistant
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                Tell it about {stepDef.topic.toLowerCase()} in your own words,
                or attach a file. Everything you share is saved below with a
                source you can trace, and nothing is submitted for you.
              </p>
            </div>
          ) : (
            <>
              {chat.messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-4/5 rounded-xl border px-3.5 py-2.5 text-sm leading-normal ${
                    m.from === "user"
                      ? "self-end border-accent bg-accent text-white"
                      : "self-start border-border-strong bg-surface-alt text-ink-body"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {/* The assistant "types" between the user's message landing and
                  its reply arriving, giving the exchange a live feel. */}
              {chat.messages[chat.messages.length - 1]?.from === "user" && (
                <div className="max-w-4/5 self-start rounded-xl border border-border-strong bg-surface-alt px-3.5 py-2.5 text-sm text-ink-muted">
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse [animation-delay:0.15s]">
                      ●
                    </span>
                    <span className="animate-pulse [animation-delay:0.3s]">
                      ●
                    </span>
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Starter prompts sit on the same white surface as the thread, running
            right up to the typing box. Clicking one drops it into the box (and
            highlights it) for the user to finish in their own words. */}
        {stepDef.suggestions.length > 0 && (
          <div className="grid grid-cols-1 gap-2 bg-white px-5 pb-4 sm:grid-cols-2">
            {stepDef.suggestions.map((s) => {
              // Stays lit while its phrase is still in the box; delete the
              // phrase and it unlights.
              const chosen = draft.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => {
                    setDraft(s);
                    inputRef.current?.focus();
                  }}
                  aria-pressed={chosen}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition duration-150 ${
                    chosen
                      ? "border-accent bg-accent-tint font-semibold text-accent-ink"
                      : "border-border-strong bg-white text-ink-muted hover:border-accent hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-2.5 border-t border-border-strong bg-divider-2 px-5 py-4">
          <input
            ref={inputRef}
            // Focused on load so the user can just start typing.
            autoFocus
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
            <Paperclip size={16} />
          </button>
          <button
            onClick={send}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-border bg-surface-alt p-6">
        <div className="mb-3 text-sm font-bold">
          We found the following information:
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
