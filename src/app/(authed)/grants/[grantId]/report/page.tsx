"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { ReportState } from "@/store/useAppStore";
import { useGrantView } from "@/store/derived";
import {
  ACCOUNT_ORG_NAME,
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
import AddDataChatBox from "@/components/AddDataChatBox";
import DataPackExport, {
  type DataPackItem,
} from "@/components/DataPackExport";

const STEP_NAV = [
  { n: 1, label: "Share your context" },
  { n: 2, label: "Commitment" },
  { n: 3, label: "Events run" },
  { n: 4, label: "Community served" },
  { n: 5, label: "Outcomes" },
  { n: 6, label: "Supporting data" },
  { n: 7, label: "Analysis" },
];

// Every step before the final Analysis step must be marked complete before the
// report can be saved to the grant.
const REQUIRED_STEPS = [1, 2, 3, 4, 5, 6];

const SUPPORTING_YOUR_DATA = ["ruea-served", "ruea-retention"];
const SUPPORTING_VP_DATA = ["ruea-cvd", "ruea-produce"];

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
  const [dataModalKey, setDataModalKey] = useState<string | null>(null);
  const [usageKey, setUsageKey] = useState<string | null>(null);
  const [reqDraft, setReqDraft] = useState("");
  // Inline edit state for a user-added analysis on the Analysis step.
  const [editingCustom, setEditingCustom] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");

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

  const toggleStepComplete = (n: number) =>
    updateReport(grantId, (r) => ({
      ...r,
      stepStatus: {
        ...r.stepStatus,
        [n]: r.stepStatus[n] === "complete" ? "in-progress" : "complete",
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
  const toggleSupporting = (id: string) =>
    updateReport(grantId, (r) => ({
      ...r,
      supportingPicks: {
        ...r.supportingPicks,
        [id]: !r.supportingPicks[id],
      },
    }));
  const SUPPORTING_IDS = [...SUPPORTING_YOUR_DATA, ...SUPPORTING_VP_DATA];
  const allSupporting = SUPPORTING_IDS.every((id) => report.supportingPicks[id]);
  const toggleAllSupporting = () =>
    updateReport(grantId, (r) => ({
      ...r,
      supportingPicks: Object.fromEntries(
        SUPPORTING_IDS.map((id) => [id, !allSupporting]),
      ),
    }));
  const addCustomSupporting = (text: string) =>
    updateReport(grantId, (r) => ({
      ...r,
      customSupporting: [...r.customSupporting, text],
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

  const selectedSupporting = RUEA_SECTIONS.filter(
    (s) => report.supportingPicks[s.id],
  );
  const analysisSections = (
    selectedSupporting.length > 0 ? selectedSupporting : RUEA_SECTIONS
  ).filter((s) => !report.removedAnalyses[s.id]);

  const deleteAnalysis = (id: string) =>
    updateReport(grantId, (r) => ({
      ...r,
      removedAnalyses: { ...r.removedAnalyses, [id]: true },
    }));
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

  // The report data pack: selected supporting data with their analysis, plus
  // anything the user added themselves.
  const reportPackItems: DataPackItem[] = [
    ...analysisSections.map((s) => ({
      title: s.analysis.datum.content,
      detail: s.analysis.datum.citation,
      analysis: [
        ...s.analysis.result.understand,
        s.evalNote,
        ...s.analysis.result.apply,
      ],
    })),
    ...report.customSupporting.map((text) => ({
      title: text,
      detail: "Added by you",
    })),
  ];

  const submitRequirements = () =>
    updateReport(grantId, (r) => ({
      ...r,
      requirements: reqDraft.trim(),
      requirementsSet: true,
    }));

  const incompleteSteps = REQUIRED_STEPS.filter((n) => !isComplete(n));
  const canSave = incompleteSteps.length === 0;

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
    if (!canSave) return;
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
              const complete = isComplete(s.n);
              const current = report.step === s.n;
              const inProgress =
                !complete && report.stepStatus[s.n] === "in-progress";
              return (
                <button
                  key={s.n}
                  onClick={() => setStep(s.n)}
                  aria-current={current ? "step" : undefined}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-2 py-2 text-left transition duration-150 ${
                    current
                      ? "border-accent bg-accent-tint"
                      : "border-transparent hover:bg-surface-alt"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${
                      complete
                        ? "bg-success-ink-2 text-white"
                        : current
                          ? "bg-accent text-white"
                          : inProgress
                            ? "bg-readiness-warn text-white"
                            : "bg-divider-2 text-ink-muted"
                    }`}
                  >
                    {complete ? "✓" : s.n}
                  </div>
                  <span
                    className={`text-sm ${
                      current
                        ? "font-bold text-ink"
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
                <div className="flex gap-2.5">
                  <MarkCompleteButton
                    complete={isComplete(1)}
                    onClick={() => toggleStepComplete(1)}
                  />
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
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
                  />
                  <div className="mt-5 flex items-center justify-between gap-2.5">
                    <button
                      onClick={() => setStep(report.step - 1)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Back
                    </button>
                    <div className="flex gap-2.5">
                      <MarkCompleteButton
                        complete={isComplete(report.step)}
                        onClick={() => toggleStepComplete(report.step)}
                      />
                      <button
                        onClick={() => setStep(report.step + 1)}
                        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

          {report.step === 6 && (
            <div>
              <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
                Data Overview
              </h1>
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm leading-relaxed text-ink-muted">
                  Select which data points to include as citable evidence in
                  your report.
                </p>
                <button
                  onClick={toggleAllSupporting}
                  className="inline-flex flex-none items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
                >
                  {allSupporting ? "✕ Remove all" : "✓ Add all"}
                </button>
              </div>

              <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
                Your data
              </div>
              <div className="mb-5 flex flex-col gap-2.5">
                {SUPPORTING_YOUR_DATA.map((id) => {
                  const s = RUEA_SECTIONS.find((x) => x.id === id)!;
                  return (
                    <SupportingCard
                      key={id}
                      section={s}
                      picked={!!report.supportingPicks[id]}
                      onToggle={() => toggleSupporting(id)}
                    />
                  );
                })}
              </div>

              <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
                Vibrancy Portal data
              </div>
              <div className="mb-5 flex flex-col gap-2.5">
                {SUPPORTING_VP_DATA.map((id) => {
                  const s = RUEA_SECTIONS.find((x) => x.id === id)!;
                  return (
                    <SupportingCard
                      key={id}
                      section={s}
                      picked={!!report.supportingPicks[id]}
                      onToggle={() => toggleSupporting(id)}
                    />
                  );
                })}
              </div>

              {report.customSupporting.length > 0 && (
                <div className="mb-5 flex flex-col gap-2.5">
                  {report.customSupporting.map((text, i) => (
                    <div
                      key={`custom-${i}`}
                      className="flex items-center gap-3.5 rounded-2xl border border-accent bg-surface p-4"
                    >
                      <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 border-accent bg-accent text-xs text-white">
                        ✓
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{text}</div>
                        <div className="text-xs text-ink-faint">Added by you</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-5">
                <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
                  Add more data
                </div>
                <AddDataChatBox onAdd={addCustomSupporting} />
              </div>

              <div className="mb-5 text-sm text-ink-muted">
                Surfaced indices:{" "}
                {Object.values(report.supportingPicks).filter(Boolean).length +
                  report.customSupporting.length}{" "}
                included
              </div>

              <div className="flex items-center justify-between gap-2.5">
                <button
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
                <div className="flex gap-2.5">
                  <MarkCompleteButton
                    complete={isComplete(6)}
                    onClick={() => toggleStepComplete(6)}
                  />
                  <button
                    onClick={() => setStep(7)}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
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
                  // The topmost card starts open so it's clear what these cards
                  // are; once a user toggles a card, their choice wins.
                  const expanded = report.analysisExpanded[s.id] ?? i === 0;
                  return (
                    <div key={s.id} className="flex flex-col gap-1.5">
                      <RueaCard
                        section={s}
                        expanded={expanded}
                        onToggle={() => toggleAnalysis(s.id, expanded)}
                        applyLabel="In your report"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => deleteAnalysis(s.id)}
                          className="text-xs font-semibold text-ink-muted underline underline-offset-2 transition hover:text-warning-ink"
                        >
                          Delete analysis
                        </button>
                      </div>
                    </div>
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
                      All analyses have been removed. Go back to Data Overview to
                      add data points.
                    </p>
                  )}
              </div>

              <div className="mb-6">
                <DataPackExport
                  grantName={grant.name}
                  orgName={ACCOUNT_ORG_NAME}
                  items={reportPackItems}
                  uploads={report.uploads}
                  sections={analysisSections}
                  customItems={report.customSupporting}
                  applyLabel="In your report"
                  shareUrl={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/grants/${grant.id}`
                      : `/grants/${grant.id}`
                  }
                />
              </div>

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

              {!canSave && (
                <div className="mb-4 rounded-2xl border border-warning-border bg-warning-bg px-5 py-4">
                  <div className="mb-1 text-sm font-bold text-warning-ink">
                    Finish every step before saving
                  </div>
                  <p className="text-sm leading-normal text-warning-ink">
                    Mark these as complete first:{" "}
                    {incompleteSteps
                      .map((n) => STEP_NAV.find((s) => s.n === n)?.label)
                      .join(", ")}
                    .
                  </p>
                </div>
              )}

              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep(6)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={saveToGrant}
                  disabled={!canSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save and exit →
                </button>
              </div>
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

/** Toggle a report step's completion. Only this marks a step complete. */
function MarkCompleteButton({
  complete,
  onClick,
}: {
  complete: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold whitespace-nowrap transition duration-150 ${
        complete
          ? "border-success-border bg-success-bg text-success-ink"
          : "border-border-strong bg-white text-ink enabled:hover:border-accent"
      }`}
    >
      {complete ? "✓ Marked as complete" : "Mark as complete"}
    </button>
  );
}

function SupportingCard({
  section,
  picked,
  onToggle,
}: {
  section: (typeof RUEA_SECTIONS)[number];
  picked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={picked}
      className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border bg-surface p-4 text-left ${
        picked ? "border-accent" : "border-border"
      }`}
    >
      <div
        className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 text-xs text-white ${
          picked ? "border-accent bg-accent" : "border-checkbox bg-transparent"
        }`}
      >
        {picked ? "✓" : ""}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">
          {section.analysis.datum.content}
        </div>
        <div className="font-mono text-xs text-ink-faint">
          {section.analysis.datum.citation}
        </div>
      </div>
    </button>
  );
}
