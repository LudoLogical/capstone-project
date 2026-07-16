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

// Progress-bar labels are kept identical to each step's page title.
const STEP_LABELS = [
  "Share Your Context",
  "Review Your Data",
  "Analyze Your Data",
];

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
  useEffect(() => {
    updateWizard(grantId, (w) => {
      const step = Math.min(w.step, STEP_LABELS.length);
      if (w.step === step && w.visited[step]) return w;
      return { ...w, step, visited: { ...w.visited, [step]: true } };
    });
  }, [grantId, updateWizard]);

  if (!view) return null;
  const { grant } = view;

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

  // Data points are selected by default: an unset entry counts as found, so the
  // review step starts with everything checked and the user opts things out.
  const isFound = (id: string) => wizard.found[id] ?? true;

  const toggleFound = (id: string) =>
    updateWizard(grantId, (w) => ({
      ...w,
      found: { ...w.found, [id]: !(w.found[id] ?? true) },
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

  // Export selection on the Analyze step. Each card has a checkbox that starts
  // checked, so an unset entry counts as selected. Reuses the persisted
  // `analysisAdded` map (section id, or "custom:<text>").
  const isExportSelected = (key: string) => wizard.analysisAdded[key] ?? true;
  const setExportSelected = (key: string, value: boolean) => {
    if (!value) setExportMode("selected");
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
    setExportMode("all");
    updateWizard(grantId, (w) => ({
      ...w,
      analysisAdded: {
        ...w.analysisAdded,
        ...Object.fromEntries(exportKeys.map((k) => [k, true])),
      },
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
      {wizard.step === 1 ? (
        <BackButton fallback={`/grants/${grant.id}`} />
      ) : (
        <button
          onClick={() => setStep(wizard.step - 1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
        >
          ← Back a step
        </button>
      )}

      <div className="mb-6 flex gap-1">
        {STEP_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i + 1)}
            className="flex-1 cursor-pointer text-left"
            aria-label={`Go to step ${i + 1}: ${label}`}
          >
            <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-divider-2">
              <div
                className={`h-full rounded-full bg-linear-to-r from-accent-warm to-accent ${
                  wizard.step > i
                    ? "w-full"
                    : wizard.step === i + 1
                      ? "w-1/2"
                      : "w-0"
                }`}
              />
            </div>
            <div
              className={`text-xs ${
                wizard.step === i + 1
                  ? "font-bold text-ink"
                  : "text-ink-muted"
              }`}
            >
              {label}
            </div>
          </button>
        ))}
      </div>

      {wizard.step === 1 && (
        <div>
          <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
            Share Your Context
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-ink-muted">
            The AI only reads what you check below. Your data remains private and
            is never used to train our AI.
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

          <div className="flex gap-2.5">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Skip this step
            </button>
          </div>
        </div>
      )}

      {wizard.step === 2 && (
        <div>
          <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
            Review Your Data
          </h1>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm leading-relaxed text-ink-muted">
              Based on the data sources you approved, we identified{" "}
              {RUEA_SECTIONS.length + wizard.customFound.length} data points that
              are relevant to this grant.
            </p>
            <button
              onClick={toggleAllFound}
              className="inline-flex flex-none items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
            >
              {allFound ? "✕ Remove all" : "✓ Add all"}
            </button>
          </div>

          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            From Surveys by New Sun Rising
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
                    className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                      selected ? "border-accent bg-accent" : "border-checkbox"
                    }`}
                  >
                    {selected ? "✓" : ""}
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
                        className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                          selected
                            ? "border-accent bg-accent"
                            : "border-checkbox"
                        }`}
                      >
                        {selected ? "✓" : ""}
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
                      className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-base text-ink-faint transition duration-150 hover:bg-accent-tint hover:text-accent-ink"
                    >
                      ✕
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
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Analyze my data →
            </button>
          </div>
        </div>
      )}

      {wizard.step === 3 && (
        <div>
          <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
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
                          className={`flex h-6 w-6 items-center justify-center rounded-md border-2 text-sm font-extrabold text-white ${
                            selected
                              ? "border-accent bg-accent"
                              : "border-checkbox"
                          }`}
                        >
                          {selected ? "✓" : ""}
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

          <div className="flex gap-2.5">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save and exit →
            </button>
          </div>
        </div>
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
