"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { ReportState } from "@/store/useAppStore";
import { useGrantView } from "@/store/derived";
import {
  DATA_DETAILS,
  REPORT_QUESTION_STEPS,
  RUEA_SECTIONS,
} from "@/data/seed";
import CheckboxRow from "@/components/CheckboxRow";
import ReportQuestionStep from "@/components/ReportQuestionStep";
import RueaCard from "@/components/RueaCard";
import Modal from "@/components/Modal";
import BackButton from "@/components/BackButton";
import DataUploadField from "@/components/DataUploadField";
import DeleteDataConfirmModal from "@/components/DeleteDataConfirmModal";
import ResetAnalysisButton from "@/components/ResetAnalysisButton";

const STEP_NAV = [
  { n: 1, label: "Share your context" },
  { n: 2, label: "Commitment" },
  { n: 3, label: "Events run" },
  { n: 4, label: "Community served" },
  { n: 5, label: "Outcomes" },
  { n: 6, label: "Review" },
  { n: 7, label: "Analysis" },
];

type QuestionStepId = keyof ReportState["chat"];

const QUESTION_STEP_ID_BY_INDEX: Record<number, QuestionStepId> = {
  2: "commitment",
  3: "events",
  4: "community",
  5: "outcomes",
};

/**
 * A stand-in for the reporting assistant's reply in the live chat. Keyed to the
 * step topic and always reminding the user that what they share is captured
 * with a source, so every figure in the report stays traceable.
 */
function assistantReply(topic: string, text: string): string {
  const t = topic.toLowerCase();
  const openers = [
    `Got it - I've added that to your ${t} notes below and tagged it "shared by you" so it stays traceable to a source.`,
    `Thanks, that's helpful for the ${t} section. I've saved it below with a "shared by you" source so reviewers can see where it came from.`,
    `Noted for ${t}. It's now in your data below, cited as "shared by you." Anything else you'd like to capture?`,
  ];
  // Vary the reply per message so repeated sends don't read identically
  // (Math.random is unavailable here and would break persistence anyway).
  return openers[text.length % openers.length];
}

export default function ReportFlowPage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const report = useAppStore((s) => s.getReport(grantId));
  const updateReport = useAppStore((s) => s.updateReport);
  const dataForms = useAppStore((s) => s.dataForms);
  const addToast = useAppStore((s) => s.addToast);
  const dontAskDeleteFound = useAppStore((s) => s.dontAskDeleteFound);
  const setDontAskDeleteFound = useAppStore((s) => s.setDontAskDeleteFound);
  const [dataModalKey, setDataModalKey] = useState<string | null>(null);
  const [usageKey, setUsageKey] = useState<string | null>(null);
  const [reqDraft, setReqDraft] = useState("");
  // Inline edit state for a user-added analysis on the Analysis step.
  const [editingCustom, setEditingCustom] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  // The review data point awaiting delete confirmation on step 6.
  const [pendingReviewDelete, setPendingReviewDelete] = useState<{
    stepId: QuestionStepId;
    itemId: string;
  } | null>(null);
  // Export controls on the Analysis step.
  const [exportMode, setExportMode] = useState<"selected" | "all">("selected");
  const [downloadOpen, setDownloadOpen] = useState(false);

  // Once a data form is completed, auto-check its "Share your context" box so
  // it's included by default. Tracked per key so a manual uncheck afterward
  // isn't undone on the next render.
  const autoCheckedRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    (["surveys", "budget", "orgAssess"] as const).forEach((key) => {
      const completed = DATA_DETAILS[key].completed || !!dataForms[key];
      if (!completed || autoCheckedRef.current[key]) return;
      autoCheckedRef.current[key] = true;
      updateReport(grantId, (r) =>
        r.share[key] ? r : { ...r, share: { ...r.share, [key]: true } },
      );
    });
  }, [dataForms, report.share, grantId, updateReport]);

  if (!view) return null;
  const { grant } = view;

  const isComplete = (n: number) => report.stepStatus[n] === "complete";

  // Navigating to a step marks it in-progress - never complete. A step only
  // becomes complete when the user explicitly marks it so (below).
  const setStep = (step: number) =>
    updateReport(grantId, (r) => ({
      ...r,
      step,
      stepStatus:
        r.stepStatus[step] === "complete"
          ? r.stepStatus
          : { ...r.stepStatus, [step]: "in-progress" },
    }));

  // Non-review steps save silently: marking the step complete and advancing in
  // one action, so completion isn't a separate button on every step.
  const saveAndContinue = (n: number) =>
    updateReport(grantId, (r) => ({
      ...r,
      step: n + 1,
      stepStatus: {
        ...r.stepStatus,
        [n]: "complete",
        [n + 1]:
          r.stepStatus[n + 1] === "complete" ? "complete" : "in-progress",
      },
    }));

  const toggleShare = (key: keyof ReportState["share"]) =>
    updateReport(grantId, (r) => ({
      ...r,
      share: { ...r.share, [key]: !r.share[key] },
    }));
  const addUploads = (names: string[]) =>
    updateReport(grantId, (r) => ({
      ...r,
      uploads: [...r.uploads, ...names],
    }));
  const removeUpload = (index: number) =>
    updateReport(grantId, (r) => ({
      ...r,
      uploads: r.uploads.filter((_, i) => i !== index),
    }));
  // `current` is the card's effective open state (the first card defaults to
  // open even with no stored value), so the first click always flips what the
  // user actually sees.
  const toggleAnalysis = (id: string, current: boolean) =>
    updateReport(grantId, (r) => ({
      ...r,
      analysisExpanded: {
        ...r.analysisExpanded,
        [id]: !current,
      },
    }));

  const questionStepId = QUESTION_STEP_ID_BY_INDEX[report.step];
  const dataModal = dataModalKey ? DATA_DETAILS[dataModalKey] : null;
  // A data form completed from the new-tab form has no seed summary; fall back
  // to showing the values the user submitted.
  const dataModalSummary =
    dataModal?.summary ??
    (dataModalKey && dataForms[dataModalKey]
      ? Object.entries(dataForms[dataModalKey]).map(([question, answer]) => ({
          question,
          answer,
        }))
      : null);

  const analysisSections = RUEA_SECTIONS.filter(
    (s) => !report.removedAnalyses[s.id],
  );

  // Reset the whole analysis step back to its default state: no cards removed,
  // nothing selected for export, and expansion cleared.
  const resetAnalysis = () => {
    setExportMode("selected");
    updateReport(grantId, (r) => ({
      ...r,
      removedAnalyses: {},
      supportingPicks: {},
      analysisExpanded: {},
    }));
  };

  const editCustomSupporting = (index: number, text: string) =>
    updateReport(grantId, (r) => ({
      ...r,
      customSupporting: r.customSupporting.map((t, i) =>
        i === index ? text : t,
      ),
    }));
  const deleteCustomSupporting = (index: number) =>
    updateReport(grantId, (r) => ({
      ...r,
      customSupporting: r.customSupporting.filter((_, i) => i !== index),
    }));

  // The consolidated review (step 6): every data point gathered across the four
  // question sections, grouped by section. Removed items drop out. This is the
  // single source of truth for what the report includes.
  const reviewGroups = REPORT_QUESTION_STEPS.map((sd) => {
    const chat = report.chat[sd.id];
    // Selection is shared with the section page via `picks` (unset = unchecked),
    // so checking here checks there and vice versa.
    const items = [
      ...sd.items
        .filter((it) => !chat.removed?.[it.id])
        .map((it) => ({
          stepId: sd.id,
          itemId: it.id,
          label: it.label,
          source: it.source,
          picked: !!chat.picks[it.id],
        })),
      ...(chat.custom ?? [])
        .map((text, i) => ({
          stepId: sd.id,
          itemId: `custom-${i}`,
          label: text,
          source: chat.customSources?.[i]
            ? `From ${chat.customSources[i]}`
            : "Added by you",
          picked: !!chat.picks[`custom-${i}`],
        }))
        .filter((it) => !chat.removed?.[it.itemId]),
    ].filter((it) => it.picked); // only checked items carry into the review
    const label = STEP_NAV.find((s) => s.n === sd.index)?.label ?? sd.topic;
    return { stepId: sd.id, label, items };
  }).filter((g) => g.items.length > 0);

  const toggleReviewItem = (stepId: QuestionStepId, itemId: string) =>
    updateReport(grantId, (r) => ({
      ...r,
      chat: {
        ...r.chat,
        [stepId]: {
          ...r.chat[stepId],
          picks: {
            ...r.chat[stepId].picks,
            [itemId]: !r.chat[stepId].picks[itemId],
          },
        },
      },
    }));

  const deleteReviewItem = (stepId: QuestionStepId, itemId: string) =>
    updateReport(grantId, (r) => ({
      ...r,
      chat: {
        ...r.chat,
        [stepId]: {
          ...r.chat[stepId],
          removed: { ...(r.chat[stepId].removed ?? {}), [itemId]: true },
          picks: { ...r.chat[stepId].picks, [itemId]: false },
        },
      },
    }));

  // Export selection on the Analysis step. Each card's checkbox starts
  // unchecked; the user opts cards in. Reuses the now-free `supportingPicks`
  // map, keyed by section id.
  const isAnalysisSelected = (id: string) => !!report.supportingPicks[id];
  const toggleAnalysisSelected = (id: string) => {
    const next = !report.supportingPicks[id];
    if (!next) setExportMode("selected");
    updateReport(grantId, (r) => ({
      ...r,
      supportingPicks: { ...r.supportingPicks, [id]: next },
    }));
  };
  const allAnalysisSelected =
    analysisSections.length > 0 &&
    analysisSections.every((s) => isAnalysisSelected(s.id));
  const selectAllAnalysis = () => {
    setExportMode("all");
    updateReport(grantId, (r) => ({
      ...r,
      supportingPicks: {
        ...r.supportingPicks,
        ...Object.fromEntries(analysisSections.map((s) => [s.id, true])),
      },
    }));
  };

  const submitRequirements = () =>
    updateReport(grantId, (r) => ({
      ...r,
      requirements: reqDraft.trim(),
      requirementsSet: true,
    }));

  // Gate: before anything else, the user supplies this grant's reporting
  // requirements. They're then kept in view and woven through every step.
  if (!report.requirementsSet) {
    return (
      <div className="mx-auto w-full max-w-2xl animate-nc-rise px-8 pt-7 pb-20">
        <BackButton fallback="/" />
        <div className="mb-3 inline-flex items-center gap-1 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-xs font-bold text-accent-ink">
          ✦ AI-ASSISTED
        </div>
        <h1 className="mb-2 font-serif text-3xl leading-tight font-medium">
          What does {grant.name} ask for in a report?
        </h1>
        <p className="mb-5 text-sm leading-relaxed text-ink-muted">
          Paste or type this grant&apos;s reporting requirements. We&apos;ll keep
          them in front of you and use them to shape every step of your report -
          the questions, the data we surface, and the final pack.
        </p>
        <textarea
          value={reqDraft}
          onChange={(e) => setReqDraft(e.target.value)}
          autoFocus
          placeholder="e.g. A narrative summary of outcomes, number of residents served, a budget-to-actuals table, and two participant stories."
          className="mb-4 min-h-44 w-full resize-y rounded-xl border border-border-strong bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-accent"
        />
        <div className="flex gap-2.5">
          <button
            onClick={submitRequirements}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105"
          >
            Start report →
          </button>
          <button
            onClick={submitRequirements}
            className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  const saveToGrant = () => {
    updateReport(grantId, (r) => ({
      ...r,
      stepStatus: { ...r.stepStatus, 7: "complete" },
    }));
    addToast("Report saved to grant.");
    router.push("/");
  };

  return (
    <div className="mx-auto w-full animate-nc-rise px-8 pt-7 pb-20">
      <BackButton fallback="/" />
      <div className="flex items-start gap-7">
        <aside className="sticky top-22 w-56 flex-none rounded-2xl border border-border bg-surface p-4">
          <div className="mb-1 text-sm font-bold">
            {grant.name}
          </div>
          <button
            onClick={() => router.push("/account")}
            className="mb-4 inline-block p-0 text-xs font-semibold text-accent-ink-2 underline"
          >
            Manage my Data
          </button>
          <div className="flex flex-col gap-0.5">
            {STEP_NAV.map((s) => {
              const current = report.step === s.n;
              // The Analysis step stays locked until the Review is completed
              // (via "Unlock your analysis").
              const locked = s.n === 7 && !isComplete(6);
              return (
                <button
                  key={s.n}
                  onClick={() => {
                    if (!locked) setStep(s.n);
                  }}
                  disabled={locked}
                  aria-current={current ? "step" : undefined}
                  className={`flex items-center gap-2.5 rounded-lg border px-2 py-2 text-left transition duration-150 ${
                    current
                      ? "border-accent bg-accent-tint"
                      : "border-transparent hover:bg-surface-alt"
                  } ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${
                      current
                        ? "bg-accent text-white"
                        : "bg-divider-2 text-ink-muted"
                    }`}
                  >
                    {locked ? "🔒" : s.n}
                  </div>
                  <span
                    className={`text-sm ${
                      current
                        ? "font-bold text-ink"
                        : locked
                          ? "font-medium text-ink-faint"
                          : "font-medium text-ink-muted"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {report.requirements.trim() && (
            <div className="mb-5 rounded-2xl border border-accent-tint-border bg-accent-tint-soft p-5">
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="text-xs font-bold tracking-wider text-accent-ink uppercase">
                  This grant&apos;s reporting requirements
                </div>
                <button
                  onClick={() => {
                    setReqDraft(report.requirements);
                    updateReport(grantId, (r) => ({
                      ...r,
                      requirementsSet: false,
                    }));
                  }}
                  className="flex-none text-xs font-semibold text-accent-ink-2 underline underline-offset-2 hover:text-accent"
                >
                  Edit
                </button>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-body">
                {report.requirements}
              </p>
            </div>
          )}
          {report.step === 1 && (
            <div>
              <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
                Share your context
              </h1>
              <p className="mb-5 text-sm leading-relaxed text-ink-muted">
                This tool uses AI to help you understand your data. Sharing your
                context allows the AI to customize its explanations to your
                specific situation. You&apos;re in control - none of the
                information below will be used without your permission.
              </p>
              <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
                From Surveys by New Sun Rising
              </div>
              <div className="mb-5 flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-6">
                {(["surveys", "budget", "orgAssess"] as const).map((key) => {
                  const d = DATA_DETAILS[key];
                  const completed = d.completed || !!dataForms[key];
                  return (
                    <div
                      key={key}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <CheckboxRow
                        checked={report.share[key]}
                        onToggle={() => toggleShare(key)}
                        label={d.label}
                        hint={completed ? "Completed" : d.meta}
                      />
                      <div className="flex flex-none gap-2">
                        <button
                          onClick={() => setUsageKey(key)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
                        >
                          How is this used?
                        </button>
                        <button
                          onClick={() =>
                            completed
                              ? setDataModalKey(key)
                              : window.open(
                                  `/data/${key}`,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {completed ? "View summary" : "Open form ↗"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
                From Your Organization
              </div>
              <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
                <DataUploadField
                  uploads={report.uploads}
                  onAddFiles={addUploads}
                  onAddLink={(link) => addUploads([link])}
                  onRemove={removeUpload}
                />
              </div>
              <div className="flex items-center justify-between gap-2.5">
                <div />
                <button
                  onClick={() => saveAndContinue(1)}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save and continue →
                </button>
              </div>
            </div>
          )}

          {questionStepId &&
            (() => {
              const stepDef = REPORT_QUESTION_STEPS.find(
                (q) => q.id === questionStepId,
              )!;
              const chat = report.chat[questionStepId];
              return (
                <div>
                  <ReportQuestionStep
                    stepDef={stepDef}
                    chat={chat}
                    onTogglePick={(itemId) =>
                      updateReport(grantId, (r) => ({
                        ...r,
                        chat: {
                          ...r.chat,
                          [questionStepId]: {
                            ...r.chat[questionStepId],
                            picks: {
                              ...r.chat[questionStepId].picks,
                              [itemId]: !r.chat[questionStepId].picks[itemId],
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
                              messages: [
                                ...prev.messages,
                                { from: "user", text },
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
                      // fact from it into "Here's what I found" (pre-selected,
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
                              custom: [
                                ...custom,
                                `Key figures pulled from ${fileName}`,
                              ],
                              customSources: {
                                ...(prev.customSources ?? {}),
                                [newIndex]: fileName,
                              },
                              picks: { ...prev.picks, [newId]: true },
                              messages: [
                                ...prev.messages,
                                { from: "user", text: `📎 ${fileName}` },
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
                                    text: `Thanks — I read “${fileName}” and pulled the key figures into "Here's what I found" below, tagged to the file so reviewers can trace them.`,
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
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save and continue →
                    </button>
                  </div>
                </div>
              );
            })()}

          {report.step === 6 && (
            <div>
              <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
                Review Your Data
              </h1>
              <p className="mb-5 text-sm leading-relaxed text-ink-muted">
                Here&apos;s every data point we gathered across your report,
                grouped by section. They&apos;re all included by default — remove
                any you don&apos;t want to carry into your report.
              </p>

              {reviewGroups.length === 0 ? (
                <p className="mb-5 rounded-2xl border border-dashed border-border-strong px-4 py-8 text-center text-sm text-ink-faint">
                  No data points yet. Go back through the sections to gather some.
                </p>
              ) : (
                reviewGroups.map((group) => (
                  <div key={group.stepId} className="mb-5">
                    <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
                      {group.label}
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {group.items.map((it) => (
                        <div
                          key={it.itemId}
                          className={`relative rounded-2xl border ${
                            it.picked
                              ? "border-accent bg-accent-tint"
                              : "border-border-strong bg-white"
                          }`}
                        >
                          <button
                            onClick={() =>
                              toggleReviewItem(group.stepId, it.itemId)
                            }
                            aria-pressed={it.picked}
                            className="flex w-full items-start gap-3 px-4 py-4 pr-11 text-left"
                          >
                            <span
                              aria-hidden
                              className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                                it.picked
                                  ? "border-accent bg-accent"
                                  : "border-checkbox"
                              }`}
                            >
                              {it.picked ? "✓" : ""}
                            </span>
                            <div>
                              <div className="text-sm font-semibold">
                                {it.label}
                              </div>
                              <div className="text-xs text-ink-muted">
                                {it.source}
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              if (dontAskDeleteFound)
                                deleteReviewItem(group.stepId, it.itemId);
                              else
                                setPendingReviewDelete({
                                  stepId: group.stepId,
                                  itemId: it.itemId,
                                });
                            }}
                            aria-label={`Delete ${it.label}`}
                            title="Delete"
                            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-base text-ink-faint transition duration-150 hover:bg-white hover:text-accent-ink"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}

              <div className="flex items-center justify-between gap-2.5">
                <button
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={() => saveAndContinue(6)}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  🔓 Unlock your analysis →
                </button>
              </div>

              <DeleteDataConfirmModal
                open={pendingReviewDelete !== null}
                onClose={() => setPendingReviewDelete(null)}
                onConfirm={() => {
                  if (pendingReviewDelete)
                    deleteReviewItem(
                      pendingReviewDelete.stepId,
                      pendingReviewDelete.itemId,
                    );
                  setPendingReviewDelete(null);
                }}
                onConfirmDontAsk={() => {
                  setDontAskDeleteFound();
                  if (pendingReviewDelete)
                    deleteReviewItem(
                      pendingReviewDelete.stepId,
                      pendingReviewDelete.itemId,
                    );
                  setPendingReviewDelete(null);
                }}
              />
            </div>
          )}

          {report.step === 7 && (
            <div>
              <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
                Analysis
              </h1>
              <p className="mb-5 text-sm leading-relaxed text-ink-muted">
                Each card below breaks down each of the data points you selected:
                what it means in plain English (In Other Words), how it compares
                to county and peer benchmarks (In Context), and how to use it in
                your reporting (In Your Report). Review each card and use the
                language in “In Your Report” to strengthen your report.
              </p>

              <div className="mb-6 flex flex-col gap-3">
                {analysisSections.map((s, i) => {
                  // The topmost card is always expanded; the rest default
                  // collapsed until the user opens them.
                  const expanded =
                    i === 0 ? true : (report.analysisExpanded[s.id] ?? false);
                  return (
                    <RueaCard
                      key={s.id}
                      section={s}
                      expanded={expanded}
                      onToggle={() => toggleAnalysis(s.id, expanded)}
                      applyLabel="In your report"
                      selected={isAnalysisSelected(s.id)}
                      onSelectChange={() => toggleAnalysisSelected(s.id)}
                    />
                  );
                })}
                {report.customSupporting.map((text, i) => (
                  <div
                    key={`custom-${i}`}
                    className="rounded-2xl border border-border bg-surface px-5 py-4"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <div className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                        Added by you
                      </div>
                      {editingCustom !== i && (
                        <div className="flex flex-none gap-3">
                          <button
                            onClick={() => {
                              setEditingCustom(i);
                              setEditDraft(text);
                            }}
                            className="text-xs font-semibold text-accent-ink-2 underline underline-offset-2 hover:text-accent"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCustomSupporting(i)}
                            className="text-xs font-semibold text-ink-muted underline underline-offset-2 transition hover:text-warning-ink"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {editingCustom === i ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          autoFocus
                          className="min-h-20 w-full resize-y rounded-xl border border-border-strong bg-white px-3 py-2 text-sm leading-relaxed text-ink outline-none focus:border-accent"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const v = editDraft.trim();
                              if (v) editCustomSupporting(i, v);
                              setEditingCustom(null);
                            }}
                            disabled={!editDraft.trim()}
                            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition duration-150 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCustom(null)}
                            className="rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm font-bold">{text}</div>
                    )}
                  </div>
                ))}
                {analysisSections.length === 0 &&
                  report.customSupporting.length === 0 && (
                    <p className="text-sm leading-relaxed text-ink-muted">
                      All analyses have been removed. Go back to Review to add
                      data points.
                    </p>
                  )}
              </div>

              {analysisSections.length > 0 && (
                <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
                  {/* Selected / all segmented toggle */}
                  <div className="mb-4 inline-flex rounded-lg border border-border-strong bg-surface-alt p-1">
                    <button
                      onClick={() => setExportMode("selected")}
                      aria-pressed={exportMode === "selected"}
                      className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition duration-150 ${
                        exportMode === "selected"
                          ? "bg-white text-ink shadow-sm"
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      Export selected cards
                    </button>
                    <button
                      onClick={selectAllAnalysis}
                      aria-pressed={exportMode === "all"}
                      className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition duration-150 ${
                        exportMode === "all" && allAnalysisSelected
                          ? "bg-white text-ink shadow-sm"
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      Export all cards
                    </button>
                  </div>

                  {/* Download (with format menu) + Share link */}
                  <div className="flex flex-wrap items-start gap-2.5">
                    <div className="relative">
                      <button
                        onClick={() => setDownloadOpen((v) => !v)}
                        aria-expanded={downloadOpen}
                        className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 hover:brightness-105"
                      >
                        Download <span aria-hidden>▾</span>
                      </button>
                      {downloadOpen && (
                        <div className="absolute z-10 mt-1.5 w-64 overflow-hidden rounded-xl border border-border-strong bg-white shadow-float">
                          <button
                            onClick={() => setDownloadOpen(false)}
                            className="block w-full px-4 py-3 text-left text-sm font-semibold text-ink transition duration-150 hover:bg-surface-alt"
                          >
                            Download as PDF
                          </button>
                          <button
                            onClick={() => setDownloadOpen(false)}
                            className="block w-full border-t border-divider px-4 py-3 text-left text-sm font-semibold text-ink transition duration-150 hover:bg-surface-alt"
                          >
                            Download Word document (.docx)
                          </button>
                        </div>
                      )}
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent">
                      Share link
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
                <div className="mb-2.5 text-sm font-bold">Next steps</div>
                <ul className="flex list-disc flex-col gap-1.5 pl-4">
                  <li className="text-sm">
                    Copy language from the cards above into your narrative
                  </li>
                  <li className="text-sm">
                    Use the citations when a funder asks for a data source
                  </li>
                  <li className="text-sm">
                    Go back to add more data if something&apos;s missing
                  </li>
                  <li className="text-sm">
                    Export this report as a reference document
                  </li>
                </ul>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep(6)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={saveToGrant}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 hover:brightness-105"
                >
                  Save and exit →
                </button>
              </div>

              {analysisSections.length > 0 && (
                <div className="mt-8 border-t border-divider pt-6">
                  <ResetAnalysisButton onReset={resetAnalysis} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {usageKey && DATA_DETAILS[usageKey] && (
        <Modal
          open
          onClose={() => setUsageKey(null)}
          title={`How ${DATA_DETAILS[usageKey].label} is used`}
        >
          <p className="text-sm leading-relaxed text-ink-body">
            {DATA_DETAILS[usageKey].usage}
          </p>
        </Modal>
      )}

      {dataModal && (
        <Modal
          open
          onClose={() => setDataModalKey(null)}
          title={dataModal.label}
        >
          {dataModalSummary ? (
            <div className="flex flex-col gap-3">
              {dataModalSummary.map((row) => (
                <div key={row.question}>
                  <div className="mb-0.5 text-xs text-ink-muted">
                    {row.question}
                  </div>
                  <div className="text-sm font-semibold">{row.answer}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {dataModal.formFields?.map((f) => (
                <div key={f.label}>
                  <div className="mb-1 text-xs text-ink-muted">{f.label}</div>
                  <input
                    className="w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none"
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

