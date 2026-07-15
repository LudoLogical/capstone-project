"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView } from "@/store/derived";
import { ACCOUNT_ORG_NAME, DATA_DETAILS, RUEA_SECTIONS } from "@/data/seed";
import CheckboxRow from "@/components/CheckboxRow";
import RueaCard from "@/components/RueaCard";
import Modal from "@/components/Modal";
import BackButton from "@/components/BackButton";
import DataUploadField from "@/components/DataUploadField";
import AddDataChatBox from "@/components/AddDataChatBox";
import DataPackExport, {
  type DataPackItem,
} from "@/components/DataPackExport";

// Progress-bar labels are kept identical to each step's page title.
const STEP_LABELS = [
  "Share Your Context",
  "Review Your Data",
  "Analyze Your Data",
  "Export Data Analysis",
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
  // wizard), so the dashboard n/4 progress starts counting immediately.
  useEffect(() => {
    updateWizard(grantId, (w) =>
      w.visited[w.step]
        ? w
        : { ...w, visited: { ...w.visited, [w.step]: true } },
    );
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

  const toggleFound = (id: string) =>
    updateWizard(grantId, (w) => ({
      ...w,
      found: { ...w.found, [id]: !w.found[id] },
    }));

  const allFound = RUEA_SECTIONS.every((s) => wizard.found[s.id]);
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

  const toggleRuea = (id: string) =>
    updateWizard(grantId, (w) => ({
      ...w,
      rueaExpanded: { ...w.rueaExpanded, [id]: !w.rueaExpanded[id] },
    }));

  // "Add to Data Analysis" now persists, so the export can reflect exactly what
  // the user added.
  const added = wizard.analysisAdded;
  const markAdded = (key: string) =>
    updateWizard(grantId, (w) => ({
      ...w,
      analysisAdded: { ...w.analysisAdded, [key]: true },
    }));

  const foundSections = RUEA_SECTIONS.filter((s) => wizard.found[s.id]);

  // The export uses the cards the user explicitly added on the Analyze step.
  // If they haven't added any yet, fall back to everything they selected so the
  // pack is never surprisingly empty.
  const addedFound = foundSections.filter((s) => added[s.id]);
  const addedCustom = wizard.customFound.filter((t) => added[`custom:${t}`]);
  const anyAdded = addedFound.length + addedCustom.length > 0;
  const exportSections = anyAdded ? addedFound : foundSections;
  const exportCustom = anyAdded ? addedCustom : wizard.customFound;

  // The compiled data pack: the added (or, as a fallback, selected) data
  // analysis cards plus anything the user added themselves.
  const dataPackItems: DataPackItem[] = [
    ...exportSections.map((s) => ({
      title: s.analysis.datum.content,
      detail: s.analysis.datum.citation,
      analysis: [
        ...s.analysis.result.understand,
        s.evalNote,
        ...s.analysis.result.apply,
      ],
    })),
    ...exportCustom.map((text) => ({ title: text, detail: "Added by you" })),
  ];
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
            {RUEA_SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleFound(s.id)}
                aria-pressed={!!wizard.found[s.id]}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-surface p-4 text-left ${
                  wizard.found[s.id] ? "border-accent" : "border-border"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">
                    {s.analysis.datum.content}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {s.analysis.datum.citation}
                  </div>
                </div>
                <div className="text-base">
                  {wizard.found[s.id] ? "✓" : "+"}
                </div>
              </button>
            ))}
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
              wizard.customFound.map((text, i) => (
                <div
                  key={`custom-${i}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-accent bg-surface p-4 text-left"
                >
                  <div>
                    <div className="text-sm font-semibold">{text}</div>
                    <div className="text-xs text-ink-muted">Added by you</div>
                  </div>
                  <div className="text-base">✓</div>
                </div>
              ))
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
            {foundSections.length === 0 && wizard.customFound.length === 0 ? (
              <p className="text-sm leading-relaxed text-ink-muted">
                Go back and select at least one data point to see it explained
                here.
              </p>
            ) : (
              <>
                {foundSections.map((s) => (
                  <RueaCard
                    key={s.id}
                    section={s}
                    expanded={!!wizard.rueaExpanded[s.id]}
                    onToggle={() => toggleRuea(s.id)}
                    onAdd={() => markAdded(s.id)}
                    added={!!added[s.id]}
                  />
                ))}
                {wizard.customFound.map((text, i) => {
                  const key = `custom:${text}`;
                  const isAdded = !!added[key];
                  return (
                    <div
                      key={`custom-${i}`}
                      className="flex items-center justify-between gap-3.5 rounded-2xl border border-border bg-surface px-5 py-4"
                    >
                      <div>
                        <div className="mb-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
                          Added by you
                        </div>
                        <div className="text-sm font-bold">{text}</div>
                      </div>
                      <button
                        onClick={() => markAdded(key)}
                        disabled={isAdded}
                        className={`inline-flex flex-none items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition duration-150 disabled:cursor-default ${
                          isAdded
                            ? "border border-success-border bg-success-bg text-success-ink"
                            : "bg-accent text-white shadow-cta hover:brightness-105"
                        }`}
                      >
                        {isAdded
                          ? "Added to Data Analysis!"
                          : "Add to Data Analysis ✓"}
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Compile data pack →
            </button>
          </div>
        </div>
      )}

      {wizard.step === 4 && (
        <div>
          <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
            Export Data Analysis
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-ink-muted">
            Everything you gathered, compiled into one document you can download
            or share.
          </p>
          <DataPackExport
            grantName={grant.name}
            orgName={ACCOUNT_ORG_NAME}
            items={dataPackItems}
            uploads={wizard.uploads}
            sections={exportSections}
            customItems={exportCustom}
            shareUrl={
              typeof window !== "undefined"
                ? `${window.location.origin}/grants/${grant.id}`
                : `/grants/${grant.id}`
            }
          />
          <div className="mt-5 flex items-center justify-between gap-2.5">
            <button
              onClick={() => setStep(3)}
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
