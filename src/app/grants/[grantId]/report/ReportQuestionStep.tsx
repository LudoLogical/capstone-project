"use client";

import { useEffect, useRef, useState } from "react";
import type { Datum } from "@/types/data";
import type { ReportingRequirement } from "@/types/grant";
import type { ReportConversationState, ReportState } from "@/store/useAppStore";
import {
  firstMentionIds,
  nextDatumId,
  suggestedIds,
} from "@/app/grants/[grantId]/report/reportModel";
import {
  recordsDataPoint,
  reportConversationTurn,
  type ConversationEvent,
} from "@/ai/local";
import { documentType, normalizeWebpageUrl } from "@/utils/format";
import SuggestionChip from "@/components/analysis/SuggestionChip";
import ApprovedItem from "@/components/analysis/ApprovedItem";
import CheckboxRow from "@/components/primitives/CheckboxRow";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  Paperclip,
} from "lucide-react";

/** How long the assistant "types" before its reply lands. */
const REPLY_DELAY_MS = 600;

/**
 * One reporting requirement, answered in conversation.
 *
 * The requirement's question is the assistant's opening message rather than a
 * heading above the chat, and the data points it surfaces are chips under the
 * message that raised them. Approving a chip is the only thing the user does
 * with a suggestion - they can leave one alone, but they can't delete it.
 *
 * Mounted with a key of its requirement index, so moving between questions gets
 * a fresh composer - its focus and scroll position belong to the question being
 * answered rather than carrying over from the last one.
 */
export default function QuestionStep({
  requirementIndex,
  requirement,
  conversation,
  approved,
  datumFor,
  toggleApproved,
  grantId,
  updateReport,
  addFiles,
  addLink,
  addRepositoryChat,
  setStep,
  saveAndContinue,
}: {
  requirementIndex: number;
  requirement: ReportingRequirement;
  conversation: ReportConversationState;
  // Approval is report-wide, keyed by Datum.id - the same map the review step
  // writes, so the two can't drift.
  approved: Record<number, boolean>;
  datumFor: (id: number) => Datum | undefined;
  toggleApproved: (id: number) => void;
  grantId: string;
  updateReport: (id: string, fn: (r: ReportState) => ReportState) => void;
  // Both file this report's new sources in the org-wide repository and attach
  // them here, exactly as the context step does.
  addFiles: (files: File[]) => string[];
  addLink: (link: string) => string;
  addRepositoryChat: (content: string) => string;
  setStep: (step: number) => void;
  saveAndContinue: (n: number) => void;
}) {
  const draft = conversation.draft ?? "";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const [linkDraft, setLinkDraft] = useState("");
  // Set when the link field holds something that isn't a URL, cleared as soon
  // as the user edits it again so the message doesn't outlive the mistake.
  const [linkError, setLinkError] = useState(false);
  const [rejectedFile, setRejectedFile] = useState<string | null>(null);

  // Keep the newest message in view as the conversation grows (including the
  // assistant's reply, which lands a beat after the user's).
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation.messages.length]);

  // Every edit below touches this one conversation, so the nesting that reaches
  // it lives here rather than in each handler.
  const patchConversation = (
    r: ReportState,
    patch: (prev: ReportConversationState) => Partial<ReportConversationState>,
  ): ReportState => ({
    ...r,
    conversations: r.conversations.map((c, i) =>
      i === requirementIndex ? { ...c, ...patch(c) } : c,
    ),
  });

  const setDraft = (text: string) =>
    updateReport(grantId, (r) => patchConversation(r, () => ({ draft: text })));

  /**
   * The assistant's turn, a beat after whatever the user just did.
   *
   * Computed inside the update so it reads the conversation as it actually
   * stands - what has already been raised, and what the user has approved
   * since. `sourceId` is resolved to a data point id here rather than passed
   * in, so the id minted by the write below is the one referred to.
   */
  const respond = (event: ConversationEvent, sourceId: string | null) => {
    setTimeout(() => {
      updateReport(grantId, (r) => {
        const c = r.conversations[requirementIndex];
        if (!c) return r;
        const recorded = sourceId
          ? Object.entries(r.chatData)
              .filter(([, id]) => id === sourceId)
              .map(([datumId]) => Number(datumId))
          : [];
        const response = reportConversationTurn({
          requirement,
          event,
          raised: suggestedIds(c),
          approved: Object.entries(r.approved)
            .filter(([, on]) => on)
            .map(([id]) => Number(id)),
          recorded,
          // The opening message carries the initial round, so the follow-up
          // rounds are the assistant's replies after it.
          replies: c.messages.filter((m) => m.from === "ai").length - 1,
        });
        return patchConversation(r, (prev) => ({
          messages: [
            ...prev.messages,
            {
              from: "ai",
              text: response.message,
              suggestions: response.suggestions,
            },
          ],
        }));
      });
    }, REPLY_DELAY_MS);
  };

  /**
   * Send a message.
   *
   * What the user says is theirs, so anything that carries information is
   * recorded verbatim as a `ChatSource` and offered back as a data point in the
   * assistant's reply. It is offered, not approved: the running list of
   * approved data points is the user's to add to, never ours.
   */
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const sourceId = recordsDataPoint(text) ? addRepositoryChat(text) : null;
    updateReport(grantId, (r) => {
      // Filed in the repository, where the user can see and delete it, but not
      // added to this report's attached sources - those are the ones they
      // deliberately handed over, and a sentence typed into a chat isn't one.
      const withSource = sourceId
        ? {
            ...r,
            chatData: { ...r.chatData, [nextDatumId(r.chatData)]: sourceId },
          }
        : r;
      return patchConversation(withSource, (prev) => ({
        messages: [...prev.messages, { from: "user", text }],
        // Clears the composer in the same write that records the message, so
        // the box can never hold a message that has already been sent.
        draft: "",
      }));
    });
    respond({ kind: "message", text }, sourceId);
  };

  // A file attached here is filed in the repository and attached to this
  // report, the same as one added on the context step - it's a source the
  // assistant can read, not a data point in itself.
  const attach = (file: File) => {
    if (!documentType(file.name)) {
      setRejectedFile(file.name);
      return;
    }
    setRejectedFile(null);
    addFiles([file]);
    updateReport(grantId, (r) =>
      patchConversation(r, (prev) => ({
        messages: [
          ...prev.messages,
          { from: "user", text: `Attached ${file.name}` },
        ],
      })),
    );
    respond({ kind: "document", name: file.name }, null);
  };

  const submitLink = () => {
    if (!linkDraft.trim()) return;
    const url = normalizeWebpageUrl(linkDraft);
    if (!url) {
      setLinkError(true);
      return;
    }
    addLink(url);
    setLinkDraft("");
    setLinkError(false);
    updateReport(grantId, (r) =>
      patchConversation(r, (prev) => ({
        messages: [...prev.messages, { from: "user", text: `Added ${url}` }],
      })),
    );
    respond({ kind: "webpage", link: url }, null);
  };

  const toggleMarkedComplete = () =>
    updateReport(grantId, (r) =>
      patchConversation(r, (prev) => ({
        markedComplete: !prev.markedComplete,
      })),
    );

  // Everything raised here that the user has approved. Approval is report-wide,
  // so a data point approved under another question shows as approved here too
  // the moment it is raised.
  const approvedHere = suggestedIds(conversation).filter((id) => approved[id]);
  const waiting =
    conversation.messages[conversation.messages.length - 1]?.from === "user";

  return (
    <div>
      <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
        Question {requirementIndex + 1} · {requirement.shortName}
      </div>
      <p className="mb-5 max-w-2xl text-sm leading-relaxed text-ink-muted">
        {requirement.statement}
      </p>

      {/* One chat window: a titled header, the thread, and the composer all live
          inside a single frame so they read as one interface rather than three
          stacked panels. */}
      <div className="mb-5 overflow-hidden rounded-2xl border border-border bg-surface-alt">
        <div className="flex items-center gap-2.5 border-b border-divider px-5 py-4">
          <div className="text-accent-ink">
            <Sparkles size={16} />
          </div>
          <div className="text-sm font-bold">AI assistant</div>
        </div>

        {/* The thread: tall enough to hold roughly ten back-and-forth exchanges
            before it scrolls. It is never empty - the assistant opens with the
            funder's question. */}
        <div
          ref={threadRef}
          className="flex h-104 flex-col gap-2.5 overflow-y-auto bg-white p-5"
        >
          {conversation.messages.map((m, i) => {
            // A data point can be raised more than once - the assistant
            // reconsiders the data on every turn - but it is one data point, so
            // it is chipped under the message that raised it first.
            const chips =
              m.from === "ai"
                ? firstMentionIds(conversation, i).flatMap(
                    (id) => datumFor(id) ?? [],
                  )
                : [];
            return (
              <div key={i} className="contents">
                <div
                  className={`max-w-4/5 rounded-xl border px-3.5 py-2.5 text-sm leading-normal ${
                    m.from === "user"
                      ? "self-end border-accent bg-accent text-white"
                      : "self-start border-border-strong bg-surface-alt text-ink-body"
                  }`}
                >
                  {m.text}
                </div>
                {chips.length > 0 && (
                  <div className="flex max-w-4/5 flex-col gap-1.5 self-start">
                    {chips.map((datum) => (
                      <SuggestionChip
                        key={datum.id}
                        datum={datum}
                        approved={!!approved[datum.id]}
                        onToggle={() => toggleApproved(datum.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {/* The assistant "types" between the user's message landing and its
              reply arriving, giving the exchange a live feel. */}
          {waiting && (
            <div className="max-w-4/5 self-start rounded-xl border border-border-strong bg-surface-alt px-3.5 py-2.5 text-sm text-ink-muted">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse [animation-delay:0.15s]">●</span>
                <span className="animate-pulse [animation-delay:0.3s]">●</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2.5 border-t border-divider px-5 py-4">
          <input
            ref={inputRef}
            // Focused on load so the user can just start typing.
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Tell the assistant anything in your own words..."
            aria-label={`Response to: ${requirement.question}`}
            className="w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) attach(file);
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

        {/* Sources can be added here as well as on the context step - a link is
            one more thing the assistant can read while answering this
            question. */}
        <div className="flex flex-wrap items-center gap-2.5 px-5 pb-4">
          <LinkIcon size={14} className="shrink-0 text-ink-muted" />
          <input
            value={linkDraft}
            onChange={(e) => {
              setLinkDraft(e.target.value);
              setLinkError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && submitLink()}
            placeholder="Add a webpage for us to read, e.g. yourorg.org/impact"
            aria-label="Add a webpage link"
            className="min-w-64 flex-1 rounded-lg border border-border-strong bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <button
            onClick={submitLink}
            className="inline-flex flex-none items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
          >
            Add link
          </button>
          {linkError && (
            <p role="alert" className="w-full text-xs text-accent-ink">
              That doesn&apos;t look like a web address. Try something like
              yourorg.org/impact.
            </p>
          )}
          {rejectedFile && (
            <p role="alert" className="w-full text-xs text-accent-ink">
              We can&apos;t read {rejectedFile} - try a document or spreadsheet
              instead.
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-surface-alt p-6">
        <div className="mb-1 text-sm font-bold">
          Your approved data for this question
        </div>
        <p className="mb-3 text-xs leading-relaxed text-ink-muted">
          Everything you&apos;ve added above. Uncheck a data point to remove it
          from this list.
        </p>
        {approvedHere.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-sm text-ink-muted">
            You haven&apos;t approved any data yet. Click on a data point in the
            conversation above to add it here.
          </p>
        ) : (
          <div className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
            {approvedHere.flatMap((id) => {
              const datum = datumFor(id);
              return datum
                ? [
                    <ApprovedItem
                      key={id}
                      datum={datum}
                      onRemove={() => toggleApproved(id)}
                    />,
                  ]
                : [];
            })}
          </div>
        )}
        <div className="mt-4 border-t border-border-strong pt-4">
          <CheckboxRow
            checked={conversation.markedComplete}
            onToggle={toggleMarkedComplete}
            label="I've finished answering this question"
            hint="You can come back and change your answer at any time."
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2.5">
        <button
          onClick={() => setStep(requirementIndex + 1)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={16} className="shrink-0" /> Previous step
        </button>
        <button
          onClick={() => saveAndContinue(requirementIndex + 2)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save and continue <ArrowRight size={16} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}
