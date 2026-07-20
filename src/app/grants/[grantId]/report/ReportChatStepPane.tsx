"use client";

import { REPORT_QUESTION_STEPS } from "@/data/seed";
import type { ReportState } from "@/store/useAppStore";
import {
  isPicked,
  assistantReply,
  type QuestionStepId,
} from "@/app/grants/[grantId]/report/reportModel";
import ReportQuestionStep from "@/components/analysis/ReportQuestionStep";
import { ArrowRight } from "lucide-react";

/** Steps 2-5: one chat-style question section, wrapped in Back/Continue. */
export default function ReportChatStepPane({
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
  dontAskDeleteFound: boolean;
  setDontAskDeleteFound: () => void;
  setStep: (step: number) => void;
  saveAndContinue: (n: number) => void;
}) {
  const stepDef = REPORT_QUESTION_STEPS.find((q) => q.id === questionStepId)!;
  const chat = report.chat[questionStepId];
  return (
    <div>
      <ReportQuestionStep
        // Remount per section so the box (and its focus) belongs to
        // this page alone.
        key={questionStepId}
        stepDef={stepDef}
        chat={chat}
        onDraftChange={(text) =>
          updateReport(grantId, (r) => ({
            ...r,
            chat: {
              ...r.chat,
              [questionStepId]: {
                ...r.chat[questionStepId],
                draft: text,
              },
            },
          }))
        }
        onTogglePick={(itemId) =>
          updateReport(grantId, (r) => ({
            ...r,
            chat: {
              ...r.chat,
              [questionStepId]: {
                ...r.chat[questionStepId],
                picks: {
                  ...r.chat[questionStepId].picks,
                  [itemId]: !isPicked(r.chat[questionStepId].picks, itemId),
                },
              },
            },
          }))
        }
        onSend={(text) => {
          // Live conversation: the user's message lands immediately
          // (along with a pre-selected "shared by you" data item),
          // then the assistant replies a beat later.
          updateReport(grantId, (r) => {
            const prev = r.chat[questionStepId];
            const custom = prev.custom ?? [];
            const newId = `custom-${custom.length}`;
            return {
              ...r,
              chat: {
                ...r.chat,
                [questionStepId]: {
                  ...prev,
                  custom: [...custom, text],
                  picks: { ...prev.picks, [newId]: true },
                  messages: [...prev.messages, { from: "user", text }],
                },
              },
            };
          });
          setTimeout(() => {
            updateReport(grantId, (r) => {
              const prev = r.chat[questionStepId];
              return {
                ...r,
                chat: {
                  ...r.chat,
                  [questionStepId]: {
                    ...prev,
                    messages: [
                      ...prev.messages,
                      {
                        from: "ai",
                        text: assistantReply(stepDef.topic, text),
                      },
                    ],
                  },
                },
              };
            });
          }, 600);
        }}
        onAttach={(fileName) => {
          // Attaching a file drops it into the chat and surfaces a
          // fact from it into the found list (pre-selected,
          // sourced to the file).
          updateReport(grantId, (r) => {
            const prev = r.chat[questionStepId];
            const custom = prev.custom ?? [];
            const newIndex = custom.length;
            const newId = `custom-${newIndex}`;
            return {
              ...r,
              chat: {
                ...r.chat,
                [questionStepId]: {
                  ...prev,
                  custom: [...custom, `Key figures pulled from ${fileName}`],
                  customSources: {
                    ...(prev.customSources ?? {}),
                    [newIndex]: fileName,
                  },
                  picks: { ...prev.picks, [newId]: true },
                  messages: [
                    ...prev.messages,
                    { from: "user", text: `Attached ${fileName}` },
                  ],
                },
              },
            };
          });
          setTimeout(() => {
            updateReport(grantId, (r) => {
              const prev = r.chat[questionStepId];
              return {
                ...r,
                chat: {
                  ...r.chat,
                  [questionStepId]: {
                    ...prev,
                    messages: [
                      ...prev.messages,
                      {
                        from: "ai",
                        text: `Thanks - we read “${fileName}” and pulled the key figures into the list below, tagged to the file so reviewers can trace them.`,
                      },
                    ],
                  },
                },
              };
            });
          }, 600);
        }}
        onDelete={(itemId) =>
          updateReport(grantId, (r) => ({
            ...r,
            chat: {
              ...r.chat,
              [questionStepId]: {
                ...r.chat[questionStepId],
                removed: {
                  ...(r.chat[questionStepId].removed ?? {}),
                  [itemId]: true,
                },
                // Drop it from the selection too, so it isn't carried
                // forward anywhere that reads picks.
                picks: {
                  ...r.chat[questionStepId].picks,
                  [itemId]: false,
                },
              },
            },
          }))
        }
        skipDeleteConfirm={dontAskDeleteFound}
        onSkipDeleteConfirm={setDontAskDeleteFound}
      />
      <div className="mt-5 flex items-center justify-between gap-2.5">
        <button
          onClick={() => setStep(report.step - 1)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
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
