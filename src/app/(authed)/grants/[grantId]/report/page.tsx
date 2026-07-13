"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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

const STEP_NAV = [
  { n: 1, label: "Share your context" },
  { n: 2, label: "Commitment" },
  { n: 3, label: "Events run" },
  { n: 4, label: "Community served" },
  { n: 5, label: "Outcomes" },
  { n: 6, label: "Supporting data" },
  { n: 7, label: "Analysis" },
];

const SUPPORTING_YOUR_DATA = ["ruea-served", "ruea-retention"];
const SUPPORTING_VP_DATA = ["ruea-cvd", "ruea-produce"];

type QuestionStepId = keyof ReportState["chat"];

const QUESTION_STEP_ID_BY_INDEX: Record<number, QuestionStepId> = {
  2: "commitment",
  3: "events",
  4: "community",
  5: "outcomes",
};

export default function ReportFlowPage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const report = useAppStore((s) => s.getReport(grantId));
  const updateReport = useAppStore((s) => s.updateReport);
  const addToast = useAppStore((s) => s.addToast);
  const [urlDraft, setUrlDraft] = useState("");
  const [dataModalKey, setDataModalKey] = useState<string | null>(null);

  if (!view) return null;
  const { grant } = view;

  const setStep = (step: number) =>
    updateReport(grantId, (r) => ({ ...r, step }));
  const toggleShare = (key: keyof ReportState["share"]) =>
    updateReport(grantId, (r) => ({
      ...r,
      share: { ...r.share, [key]: !r.share[key] },
    }));
  const addUpload = () => {
    if (!urlDraft.trim()) return;
    updateReport(grantId, (r) => ({
      ...r,
      uploads: [...r.uploads, urlDraft.trim()],
    }));
    setUrlDraft("");
  };
  const toggleSupporting = (id: string) =>
    updateReport(grantId, (r) => ({
      ...r,
      supportingPicks: {
        ...r.supportingPicks,
        [id]: !r.supportingPicks[id],
      },
    }));
  const toggleAnalysis = (id: string) =>
    updateReport(grantId, (r) => ({
      ...r,
      analysisExpanded: {
        ...r.analysisExpanded,
        [id]: !r.analysisExpanded[id],
      },
    }));

  const questionStepId = QUESTION_STEP_ID_BY_INDEX[report.step];
  const dataModal = dataModalKey ? DATA_DETAILS[dataModalKey] : null;

  const selectedSupporting = RUEA_SECTIONS.filter(
    (s) => report.supportingPicks[s.id],
  );
  const analysisSections =
    selectedSupporting.length > 0 ? selectedSupporting : RUEA_SECTIONS;
  const currentCard =
    analysisSections[report.analysisCardIndex % analysisSections.length];

  const saveToGrant = () => {
    addToast("Report saved to grant.");
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-6xl animate-nc-rise px-8 pt-7 pb-20">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 inline-block text-sm font-semibold text-ink-muted hover:text-ink"
      >
        ← Back to dashboard
      </button>
      <div className="flex items-start gap-7">
        <aside className="sticky top-22 w-56 flex-none rounded-2xl border border-border bg-surface p-4">
          <div className="mb-1 text-sm font-bold">
            {grant.purpose.split(".")[0]}
          </div>
          <button
            onClick={() => addToast("Opening Account Profile data manager...")}
            className="mb-4 inline-block p-0 text-xs font-semibold text-accent-ink-2 underline"
          >
            Manage my Data
          </button>
          <div className="flex flex-col gap-0.5">
            {STEP_NAV.map((s) => (
              <button
                key={s.n}
                onClick={() => setStep(s.n)}
                className="flex cursor-pointer items-center gap-2.5 px-1.5 py-2 text-left"
              >
                <div
                  className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${
                    report.step === s.n
                      ? "bg-accent"
                      : report.step > s.n
                        ? "bg-success-ink-2"
                        : "bg-divider-2"
                  } ${report.step >= s.n ? "text-white" : "text-ink-muted"}`}
                >
                  {report.step > s.n ? "✓" : s.n}
                </div>
                <span
                  className={`text-sm ${
                    report.step === s.n
                      ? "font-bold text-ink"
                      : "font-medium text-ink-muted"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {report.step === 1 && (
            <div>
              <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
                Share your context
              </h1>
              <p className="mb-5 text-sm leading-relaxed text-ink-muted">
                Nothing is used without your permission. Check what the AI can
                read for this report.
              </p>
              <div className="mb-5 flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-6">
                {(["surveys", "budget", "orgAssess"] as const).map((key) => {
                  const d = DATA_DETAILS[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-3"
                    >
                      <CheckboxRow
                        checked={report.share[key]}
                        onToggle={() => toggleShare(key)}
                        label={d.label}
                        hint={d.meta}
                      />
                      <button
                        onClick={() => setDataModalKey(key)}
                        className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {d.completed ? "View summary" : "Open form"}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
                <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
                  Active files collection
                </div>
                <div className="mb-3 flex gap-2.5">
                  <input
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addUpload()}
                    placeholder="Paste a link, or type a file name"
                    aria-label="Upload a file or paste a link"
                    className="w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none"
                  />
                  <button
                    onClick={addUpload}
                    className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                {report.uploads.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {report.uploads.map((u, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-alt px-3 py-1 text-xs font-bold text-ink-secondary"
                      >
                        📎 {u}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
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
                    onSend={(text) =>
                      updateReport(grantId, (r) => ({
                        ...r,
                        chat: {
                          ...r.chat,
                          [questionStepId]: {
                            ...r.chat[questionStepId],
                            messages: [
                              ...r.chat[questionStepId].messages,
                              { from: "user", text },
                              {
                                from: "ai",
                                text: "Got it — added to your report draft.",
                              },
                            ],
                          },
                        },
                      }))
                    }
                    onMarkComplete={() =>
                      updateReport(grantId, (r) => ({
                        ...r,
                        chat: {
                          ...r.chat,
                          [questionStepId]: {
                            ...r.chat[questionStepId],
                            marked: !r.chat[questionStepId].marked,
                          },
                        },
                      }))
                    }
                  />
                  <div className="mt-5 flex gap-2.5">
                    <button
                      onClick={() => setStep(report.step - 1)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(report.step + 1)}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              );
            })()}

          {report.step === 6 && (
            <div>
              <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
                Supporting data we found
              </h1>
              <p className="mb-5 text-sm leading-relaxed text-ink-muted">
                Select which data points to include as citable evidence in your
                report.
              </p>

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

              <div className="mb-5 text-sm text-ink-muted">
                Surfaced indices:{" "}
                {Object.values(report.supportingPicks).filter(Boolean).length}{" "}
                included
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(7)}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {report.step === 7 && (
            <div>
              <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
                Analysis
              </h1>
              <p className="mb-5 text-sm leading-relaxed text-ink-muted">
                Remember the number, understand what it means, see it in context,
                and use it in your report.
              </p>

              {currentCard && (
                <>
                  <RueaCard
                    section={currentCard}
                    expanded={!!report.analysisExpanded[currentCard.id]}
                    onToggle={() => toggleAnalysis(currentCard.id)}
                  />
                  <div className="my-4 flex justify-center gap-1.5">
                    {analysisSections.map((s, i) => (
                      <div
                        key={s.id}
                        className={`h-2 w-2 rounded-full ${
                          i ===
                          report.analysisCardIndex % analysisSections.length
                            ? "bg-accent"
                            : "bg-divider-2"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      updateReport(grantId, (r) => ({
                        ...r,
                        analysisCardIndex: r.analysisCardIndex + 1,
                      }))
                    }
                    className="mb-6 inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    next →
                  </button>
                </>
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
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save to grant →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {dataModal && (
        <Modal
          open
          onClose={() => setDataModalKey(null)}
          title={dataModal.label}
        >
          {dataModal.summary ? (
            <div className="flex flex-col gap-3">
              {dataModal.summary.map((row) => (
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
