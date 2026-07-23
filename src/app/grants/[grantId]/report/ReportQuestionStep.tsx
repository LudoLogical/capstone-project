"use client";

import { useEffect, useRef, useState } from "react";
import { REPORT_QUESTION_STEPS } from "@/data/seed";
import type { ReportChatState, ReportState } from "@/store/useAppStore";
import {
  isPicked,
  assistantReply,
  type QuestionStepId,
} from "@/app/grants/[grantId]/report/reportModel";
import DeleteDataConfirmModal from "@/components/modals/DeleteDataConfirmModal";
import FoundItem from "@/components/analysis/FoundItem";
import { ArrowLeft, ArrowRight, BarChart3, Paperclip } from "lucide-react";

/**
 * Steps 2-5: one chat-style question section, wrapped in Back/Continue.
 *
 * Mounted with a key of its section id, so moving between sections gets a fresh
 * composer - its focus, scroll position and any open dialog belong to the
 * section being answered rather than carrying over from the last one.
 */
export default function QuestionStep({
  questionStepId,
  report,
  grantId,
  updateReport,
  dontAskDeleteFound,
  setDontAskDeleteFound,
  setStep,
  saveAndContinue,
}: {
  questionStepId: QuestionStepId;
  report: ReportState;
  grantId: string;
  updateReport: (id: string, fn: (r: ReportState) => ReportState) => void;
  // When true, deleting a found item skips the confirmation dialog.
  dontAskDeleteFound: boolean;
  setDontAskDeleteFound: () => void;
  setStep: (step: number) => void;
  saveAndContinue: (n: number) => void;
}) {
  const stepDef = REPORT_QUESTION_STEPS.find((q) => q.id === questionStepId)!;
  const chat = report.chat[questionStepId];
  // The draft lives in the section's own chat state, so each page keeps its own
  // unsent message.
  const draft = chat.draft ?? "";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  // The found item awaiting delete confirmation, or null when no dialog is open.
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);

  // Keep the newest message in view as the conversation grows (including the
  // assistant's reply, which lands a beat after the user's).
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.messages.length]);

  // Every edit below touches this one section's slice of the report, so the
  // nesting that reaches it lives here rather than in each handler.
  const patchChat = (
    patch: (prev: ReportChatState) => Partial<ReportChatState>,
  ) =>
    updateReport(grantId, (r) => ({
      ...r,
      chat: {
        ...r.chat,
        [questionStepId]: {
          ...r.chat[questionStepId],
          ...patch(r.chat[questionStepId]),
        },
      },
    }));

  const setDraft = (text: string) => patchChat(() => ({ draft: text }));

  const togglePick = (itemId: string) =>
    patchChat((prev) => ({
      picks: { ...prev.picks, [itemId]: !isPicked(prev.picks, itemId) },
    }));

  // Live conversation: the user's message lands immediately (along with a
  // pre-selected "shared by you" data item), then the assistant replies a beat
  // later.
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    patchChat((prev) => {
      const custom = prev.custom ?? [];
      return {
        custom: [...custom, text],
        picks: { ...prev.picks, [`custom-${custom.length}`]: true },
        messages: [...prev.messages, { from: "user", text }],
        // Clears the composer in the same write that records the message, so
        // the box can never hold a message that has already been sent.
        draft: "",
      };
    });
    setTimeout(() => {
      patchChat((prev) => ({
        messages: [
          ...prev.messages,
          { from: "ai", text: assistantReply(stepDef.topic, text) },
        ],
      }));
    }, 600);
  };

  // Attaching a file drops it into the chat and surfaces a fact from it into
  // the found list (pre-selected, sourced to the file).
  const attach = (fileName: string) => {
    patchChat((prev) => {
      const custom = prev.custom ?? [];
      const newIndex = custom.length;
      return {
        custom: [...custom, `Key figures pulled from ${fileName}`],
        customSources: { ...(prev.customSources ?? {}), [newIndex]: fileName },
        picks: { ...prev.picks, [`custom-${newIndex}`]: true },
        messages: [
          ...prev.messages,
          { from: "user", text: `Attached ${fileName}` },
        ],
      };
    });
    setTimeout(() => {
      patchChat((prev) => ({
        messages: [
          ...prev.messages,
          {
            from: "ai",
            text: `Thanks - we read “${fileName}” and pulled the key figures into the list below, tagged to the file so reviewers can trace them.`,
          },
        ],
      }));
    }, 600);
  };

  const deleteItem = (itemId: string) =>
    patchChat((prev) => ({
      removed: { ...(prev.removed ?? {}), [itemId]: true },
      // Drop it from the selection too, so it isn't carried forward anywhere
      // that reads picks.
      picks: { ...prev.picks, [itemId]: false },
    }));

  const requestDelete = (id: string, label: string) => {
    if (dontAskDeleteFound) deleteItem(id);
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
              if (file) attach(file.name);
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
                onTogglePick={() => togglePick(item.id)}
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
                onTogglePick={() => togglePick(id)}
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
          if (pendingDelete) deleteItem(pendingDelete.id);
          setPendingDelete(null);
        }}
        onConfirmDontAsk={() => {
          setDontAskDeleteFound();
          if (pendingDelete) deleteItem(pendingDelete.id);
          setPendingDelete(null);
        }}
      />

      <div className="mt-5 flex items-center justify-between gap-2.5">
        <button
          onClick={() => setStep(report.step - 1)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={16} className="shrink-0" /> Previous step
        </button>
        <button
          onClick={() => saveAndContinue(report.step)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save and continue <ArrowRight size={16} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}
