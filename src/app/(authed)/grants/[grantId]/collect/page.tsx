"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView } from "@/store/derived";
import { DATA_DETAILS, RUEA_SECTIONS } from "@/data/seed";
import CheckboxRow from "@/components/CheckboxRow";
import RueaCard from "@/components/RueaCard";
import Modal from "@/components/Modal";
import BackButton from "@/components/BackButton";
import DataUploadField from "@/components/DataUploadField";
import AddDataChatBox from "@/components/AddDataChatBox";
import ResetAnalysisButton from "@/components/ResetAnalysisButton";
import ShareModal from "@/components/ShareModal";
import Icon from "@/components/Icon";

/**
 * The application flow is three steps: share your context, review the data we
 * found, then analyze it.
 */
function stepPlan() {
  return {
    labels: ["Share Your Context", "Review", "Analysis"],
    reviewStep: 2,
    analysisStep: 3,
    total: 3,
    groups: [
      { title: "Data collection", steps: [1] },
      { title: "Review your data", steps: [2] },
      { title: "Data analysis", steps: [3] },
    ],
  };
}

export default function DataCollectionWizardPage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const wizard = useAppStore((s) => s.getWizard(grantId));
  const updateWizard = useAppStore((s) => s.updateWizard);
  const dataForms = useAppStore((s) => s.dataForms);
  const [dataModalKey, setDataModalKey] = useState<string | null>(null);
  const [usageKey, setUsageKey] = useState<string | null>(null);
  // Export controls on the Analyze step.
  const [exportMode, setExportMode] = useState<"selected" | "all">("selected");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  // The ticks in place before "Export all cards" auto-selected everything, so
  // switching back to "Export selected cards" can restore them.
  const picksBeforeAllRef = useRef<Record<string, boolean> | null>(null);

  // Once a data form is completed, auto-check its "Share your context" box so
  // it's included by default. Tracked per key so a manual uncheck afterward
  // isn't undone on the next render.
  const autoCheckedRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    (["surveys", "budget", "orgAssess"] as const).forEach((key) => {
      const completed = DATA_DETAILS[key].completed || !!dataForms[key];
      if (!completed || autoCheckedRef.current[key]) return;
      autoCheckedRef.current[key] = true;
      updateWizard(grantId, (w) =>
        w.share[key] ? w : { ...w, share: { ...w.share, [key]: true } },
      );
    });
  }, [dataForms, wizard.share, grantId, updateWizard]);

  // Landing on the wizard records the current step as visited (and persists the
  // wizard), so the dashboard progress starts counting immediately. Also clamp
  // any step persisted from the old 4-step flow into the current 3-step range.
  const totalSteps = 3;
  useEffect(() => {
    updateWizard(grantId, (w) => {
      const step = Math.min(w.step, totalSteps);
      if (w.step === step && w.visited[step]) return w;
      return { ...w, step, visited: { ...w.visited, [step]: true } };
    });
  }, [grantId, updateWizard, totalSteps]);

  if (!view) return null;
  const { grant } = view;
  const {
    labels: STEP_LABELS,
    reviewStep: REVIEW_STEP,
    analysisStep: ANALYSIS_STEP,
    groups: STEP_GROUPS,
  } = stepPlan();

  // Navigating to a step records it as visited, which drives the n/4 progress
  // shown on the dashboard.
  const setStep = (step: number) =>
    updateWizard(grantId, (w) => ({
      ...w,
      step,
      visited: { ...w.visited, [step]: true },
    }));

  const toggleShare = (key: keyof typeof wizard.share) =>
    updateWizard(grantId, (w) => ({
      ...w,
      share: { ...w.share, [key]: !w.share[key] },
    }));

  const addUploads = (names: string[]) =>
    updateWizard(grantId, (w) => ({
      ...w,
      uploads: [...w.uploads, ...names],
    }));

  const removeUpload = (index: number) =>
    updateWizard(grantId, (w) => ({
      ...w,
      uploads: w.uploads.filter((_, i) => i !== index),
    }));

  // Data points start unchecked; the user opts them in on the review step.
  const isFound = (id: string) => !!wizard.found[id];

  const toggleFound = (id: string) =>
    updateWizard(grantId, (w) => ({
      ...w,
      found: { ...w.found, [id]: !w.found[id] },
    }));

  const allFound = RUEA_SECTIONS.every((s) => isFound(s.id));
  const toggleAllFound = () =>
    updateWizard(grantId, (w) => ({
      ...w,
      found: Object.fromEntries(RUEA_SECTIONS.map((s) => [s.id, !allFound])),
    }));

  const addCustomFound = (text: string) =>
    updateWizard(grantId, (w) => ({
      ...w,
      customFound: [...w.customFound, text],
    }));

  const removeCustomFound = (index: number) =>
    updateWizard(grantId, (w) => ({
      ...w,
      customFound: w.customFound.filter((_, i) => i !== index),
    }));

  const setRueaExpanded = (id: string, value: boolean) =>
    updateWizard(grantId, (w) => ({
      ...w,
      rueaExpanded: { ...w.rueaExpanded, [id]: value },
    }));

  const foundSections = RUEA_SECTIONS.filter((s) => isFound(s.id));
  // Custom entries are also selected by default; a `custom:` prefix keeps their
  // selection in the same map without colliding with section ids.
  const foundCustom = wizard.customFound.filter((t) => isFound(`custom:${t}`));

  // Export selection on the Analyze step. Each card's checkbox starts unchecked;
  // the user opts cards in. Reuses the persisted `analysisAdded` map (section
  // id, or "custom:<text>").
  const isExportSelected = (key: string) => !!wizard.analysisAdded[key];
  const setExportSelected = (key: string, value: boolean) => {
    if (!value) setExportMode("selected");
    // A manual tick makes the pre-"all" snapshot stale: this is now their choice.
    picksBeforeAllRef.current = null;
    updateWizard(grantId, (w) => ({
      ...w,
      analysisAdded: { ...w.analysisAdded, [key]: value },
    }));
  };
  const exportKeys = [
    ...foundSections.map((s) => s.id),
    ...foundCustom.map((t) => `custom:${t}`),
  ];
  const allExportSelected =
    exportKeys.length > 0 && exportKeys.every((k) => isExportSelected(k));
  const selectAllForExport = () => {
    // Remember what was ticked so switching back to "selected" can restore it.
    if (exportMode !== "all") picksBeforeAllRef.current = wizard.analysisAdded;
    setExportMode("all");
    updateWizard(grantId, (w) => ({
      ...w,
      analysisAdded: {
        ...w.analysisAdded,
        ...Object.fromEntries(exportKeys.map((k) => [k, true])),
      },
    }));
  };
  // Switching back to "selected" undoes the automatic select-all, restoring the
  // ticks the user had before.
  const useSelectedExportMode = () => {
    setExportMode("selected");
    const snapshot = picksBeforeAllRef.current;
    if (!snapshot) return;
    picksBeforeAllRef.current = null;
    updateWizard(grantId, (w) => ({ ...w, analysisAdded: snapshot }));
  };

  // The Analysis step stays locked until the user unlocks it from Review, so
  // they see their data before an analysis is built from it.
  const analysisUnlocked = !!wizard.analysisUnlocked;
  const unlockAnalysis = () => {
    updateWizard(grantId, (w) => ({
      ...w,
      analysisUnlocked: true,
      step: ANALYSIS_STEP,
      visited: { ...w.visited, [ANALYSIS_STEP]: true },
    }));
  };

  // Resetting starts the application over: back to Share Your Context, with the
  // analysis cleared and locked again.
  const resetAnalysis = () => {
    setExportMode("selected");
    picksBeforeAllRef.current = null;
    updateWizard(grantId, (w) => ({
      ...w,
      analysisAdded: {},
      rueaExpanded: {},
      analysisUnlocked: false,
      step: 1,
      visited: { 1: true },
    }));
  };

  const dataModal = dataModalKey ? DATA_DETAILS[dataModalKey] : null;
  // A form completed in the new tab has no seed summary; fall back to the
  // values the user submitted.
  const dataModalSummary =
    dataModal?.summary ??
    (dataModalKey && dataForms[dataModalKey]
      ? Object.entries(dataForms[dataModalKey]).map(([question, answer]) => ({
          question,
          answer,
        }))
      : null);

  return (
    <div className="mx-auto w-full animate-nc-rise px-8 pt-7 pb-20">
      <BackButton fallback={`/grants/${grant.id}`} />
      <div className="flex items-start gap-7">
        {/* Same shell as the report flow: a sticky step rail beside the work. */}
        <aside className="sticky top-22 w-56 flex-none rounded-2xl border border-border bg-surface p-4">
          <div className="mb-1 text-sm font-bold">{grant.name}</div>
          <button
            onClick={() => router.push("/account")}
            className="mb-4 inline-block p-0 text-xs font-semibold text-accent-ink-2 underline"
          >
            Manage Your Data
          </button>
          <div className="flex flex-col gap-3">
            {STEP_GROUPS.map((group, gi) => (
              <div
                key={group.title}
                className={gi > 0 ? "border-t border-divider-2 pt-3" : ""}
              >
                <div className="mb-1.5 px-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
                  {group.title}
                </div>
                <div className="flex flex-col gap-0.5">
                  {group.steps.map((n) => {
                    const label = STEP_LABELS[n - 1];
                    const current = wizard.step === n;
                    const visited = !!wizard.visited[n];
                    // Analysis stays locked until unlocked from Review.
                    const locked = n === ANALYSIS_STEP && !analysisUnlocked;
                    return (
                      <button
                        key={n}
                        onClick={() => {
                          if (!locked) setStep(n);
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
                              : !locked && visited
                                ? "bg-success-ink-2 text-white"
                                : "bg-divider-2 text-ink-muted"
                          }`}
                        >
                          {locked ? <Icon name="bookmark" size={11} /> : !current && visited ? <Icon name="check" size={12} /> : n}
                        </div>
                        <span
                          className={`text-sm ${
                            current
                              ? "font-bold text-ink"
                              : locked
                                ? "font-medium text-ink-muted"
                                : "font-medium text-ink-muted"
                          }`}
                        >
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
      {wizard.step === 1 && (
        <div>
          <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
            Share Your Context
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-ink-muted">
            The AI only reads what you check below. Your data remains private and
            is never used to train our AI.
          </p>

          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            From the Vibrancy Portal
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
                    checked={wizard.share[key]}
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
            <p className="mb-3.5 text-sm leading-relaxed text-ink-muted">
              Attendance sheets, surveys, photos, past reports, participant
              counts, or letters of support all help.
            </p>
            <DataUploadField
              uploads={wizard.uploads}
              onAddFiles={addUploads}
              onAddLink={(link) => addUploads([link])}
              onRemove={removeUpload}
            />
          </div>

          <div className="flex items-center justify-between gap-2.5">
            <div />
            <button
              onClick={() => setStep(REVIEW_STEP)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save and Continue →
            </button>
          </div>
        </div>
      )}

      {wizard.step === REVIEW_STEP && (
        <div>
          <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
            Review Your Data
          </h1>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm leading-relaxed text-ink-muted">
              Based on the data sources you approved and data from the Vibrancy
              Portal, we identified{" "}
              {RUEA_SECTIONS.length + wizard.customFound.length} data points that
              are relevant to this grant.
            </p>
            <button
              onClick={toggleAllFound}
              className="inline-flex flex-none items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
            >
              {allFound ? "Remove all" : "Add all"}
            </button>
          </div>

          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            From the Vibrancy Portal
          </div>
          <div className="mb-5 flex flex-col gap-2.5">
            {RUEA_SECTIONS.map((s) => {
              const selected = isFound(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleFound(s.id)}
                  aria-pressed={selected}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left ${
                    selected
                      ? "border-accent bg-accent-tint-soft"
                      : "border-border bg-surface"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                      selected ? "border-accent bg-accent" : "border-ink-muted"
                    }`}
                  >
                    {selected ? <Icon name="check" size={14} /> : null}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">
                      {s.analysis.datum.content}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {s.analysis.datum.citation}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            From Your Organization
          </div>
          <div className="mb-4 flex flex-col gap-2.5">
            {wizard.customFound.length === 0 ? (
              <p className="text-sm leading-relaxed text-ink-muted">
                Nothing added yet. Use the box below to add a data point in your
                own words.
              </p>
            ) : (
              wizard.customFound.map((text, i) => {
                const selected = isFound(`custom:${text}`);
                return (
                  <div key={`custom-${i}`} className="relative">
                    <button
                      onClick={() => toggleFound(`custom:${text}`)}
                      aria-pressed={selected}
                      className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 pr-11 text-left ${
                        selected
                          ? "border-accent bg-accent-tint-soft"
                          : "border-border bg-surface"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                          selected
                            ? "border-accent bg-accent"
                            : "border-ink-muted"
                        }`}
                      >
                        {selected ? <Icon name="check" size={14} /> : null}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">{text}</div>
                        <div className="text-xs text-ink-muted">
                          Added by you
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => removeCustomFound(i)}
                      aria-label={`Delete ${text}`}
                      title="Delete"
                      className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-base text-ink-muted transition duration-150 hover:bg-accent-tint hover:text-accent-ink"
                    >
                      <Icon name="x" size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <div className="mb-6">
            <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
              Add more data
            </div>
            <AddDataChatBox onAdd={addCustomFound} />
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => setStep(REVIEW_STEP - 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={unlockAnalysis}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analysisUnlocked
                ? "See updated analysis →"
                : "Unlock your analysis →"}
            </button>
          </div>
        </div>
      )}

      {wizard.step === ANALYSIS_STEP && (
        <div>
          <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
            Analyze Your Data
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-ink-muted">
            Each card below breaks down each of the data points you selected:
            what it means in plain English (In Other Words), how it compares to
            county and peer benchmarks (In Context), and how to use it in your
            grant writing or reporting (In Your Application). Review each card and
            use the language in “In Your Application” to strengthen your
            application.
          </p>
          <div className="mb-6 flex flex-col gap-3">
            {foundSections.length === 0 && foundCustom.length === 0 ? (
              <p className="text-sm leading-relaxed text-ink-muted">
                Go back and select at least one data point to see it explained
                here.
              </p>
            ) : (
              <>
                {foundSections.map((s, i) => {
                  // Default the first card open, the rest collapsed; an explicit
                  // toggle (stored value) always wins.
                  const expanded = wizard.rueaExpanded[s.id] ?? i === 0;
                  return (
                    <RueaCard
                      key={s.id}
                      section={s}
                      expanded={expanded}
                      onToggle={() => setRueaExpanded(s.id, !expanded)}
                      selected={isExportSelected(s.id)}
                      onSelectChange={() =>
                        setExportSelected(s.id, !isExportSelected(s.id))
                      }
                    />
                  );
                })}
                {foundCustom.map((text, i) => {
                  const key = `custom:${text}`;
                  const selected = isExportSelected(key);
                  return (
                    <div
                      key={`custom-${i}`}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-5 py-4"
                    >
                      <button
                        onClick={() => setExportSelected(key, !selected)}
                        aria-pressed={selected}
                        aria-label={selected ? "Deselect card" : "Select card"}
                        className="flex flex-none items-start pt-0.5"
                      >
                        <span
                          aria-hidden
                          className={`flex h-[22px] w-[22px] items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                            selected
                              ? "border-accent bg-accent"
                              : "border-ink-muted"
                          }`}
                        >
                          {selected ? <Icon name="check" size={14} /> : null}
                        </span>
                      </button>
                      <div>
                        <div className="mb-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
                          Added by you
                        </div>
                        <div className="text-sm font-bold">{text}</div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {(foundSections.length > 0 || foundCustom.length > 0) && (
            <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
              {/* Selected / all segmented toggle */}
              <div className="mb-4 inline-flex rounded-lg border border-border-strong bg-surface-alt p-1">
                <button
                  onClick={useSelectedExportMode}
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
                  onClick={selectAllForExport}
                  aria-pressed={exportMode === "all"}
                  className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition duration-150 ${
                    exportMode === "all" && allExportSelected
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
                    className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 hover:bg-accent-ink-2 active:translate-y-px"
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
                <button
                  onClick={() => setShareOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
                >
                  Share link
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2.5">
            <button
              onClick={() => setStep(REVIEW_STEP)}
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save and exit →
            </button>
          </div>

          {(foundSections.length > 0 || foundCustom.length > 0) && (
            <div className="mt-8 border-t border-divider pt-6">
              <ResetAnalysisButton onReset={resetAnalysis} />
            </div>
          )}
        </div>
      )}
        </div>
      </div>

      {shareOpen && (
        <ShareModal
          title="Share this data analysis"
          name={`${grant.name} - Data Analysis`}
          link={
            typeof window !== "undefined"
              ? window.location.href
              : `/grants/${grant.id}/collect`
          }
          onClose={() => setShareOpen(false)}
        />
      )}

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
                    inputMode={f.kind === "number" ? "decimal" : undefined}
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
