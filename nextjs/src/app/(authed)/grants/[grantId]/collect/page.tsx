"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView } from "@/store/derived";
import { DATA_DETAILS, RUEA_SECTIONS } from "@/data/seed";
import CheckboxRow from "@/components/CheckboxRow";
import RueaCard from "@/components/RueaCard";
import Modal from "@/components/Modal";

const STEP_LABELS = ["Share your context", "Data we found", "Explain my data"];

export default function DataCollectionWizardPage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const wizard = useAppStore((s) => s.getWizard(grantId));
  const updateWizard = useAppStore((s) => s.updateWizard);
  const addToast = useAppStore((s) => s.addToast);
  const [urlDraft, setUrlDraft] = useState("");
  const [dataModalKey, setDataModalKey] = useState<string | null>(null);

  if (!view) return null;
  const { grant } = view;

  const setStep = (step: number) =>
    updateWizard(grantId, (w) => ({ ...w, step }));

  const toggleShare = (key: keyof typeof wizard.share) =>
    updateWizard(grantId, (w) => ({
      ...w,
      share: { ...w.share, [key]: !w.share[key] },
    }));

  const addUpload = () => {
    if (!urlDraft.trim()) return;
    updateWizard(grantId, (w) => ({
      ...w,
      uploads: [...w.uploads, urlDraft.trim()],
    }));
    setUrlDraft("");
  };

  const toggleFound = (id: string) =>
    updateWizard(grantId, (w) => ({
      ...w,
      found: { ...w.found, [id]: !w.found[id] },
    }));

  const toggleRuea = (id: string) =>
    updateWizard(grantId, (w) => ({
      ...w,
      rueaExpanded: { ...w.rueaExpanded, [id]: !w.rueaExpanded[id] },
    }));

  const finish = () => {
    addToast("Supporting data added to your grant.");
    router.push("/dashboard");
  };

  const foundSections = RUEA_SECTIONS.filter((s) => wizard.found[s.id]);
  const dataModal = dataModalKey ? DATA_DETAILS[dataModalKey] : null;

  return (
    <div className="mx-auto max-w-3xl animate-nc-rise px-8 pt-7 pb-20">
      <button
        onClick={() =>
          wizard.step === 1
            ? router.push(`/grants/${grant.id}`)
            : setStep(wizard.step - 1)
        }
        className="mb-4 inline-block text-sm font-semibold text-ink-muted hover:text-ink"
      >
        ← Back
      </button>

      <div className="mb-6 flex gap-1">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex-1">
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
            <div className="text-xs text-ink-muted">{label}</div>
          </div>
        ))}
      </div>

      {wizard.step === 1 && (
        <div>
          <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
            Share your context (optional)
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-ink-muted">
            The AI only reads what you check below. Your data remains private and
            is never used to train our AI.
          </p>

          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Vibrancy Portal data
          </div>
          <div className="mb-5 flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-6">
            {(["surveys", "budget", "orgAssess"] as const).map((key) => {
              const d = DATA_DETAILS[key];
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3"
                >
                  <CheckboxRow
                    checked={wizard.share[key]}
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

          <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Your own initiative data
          </div>
          <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
            <p className="mb-3.5 text-sm leading-relaxed text-ink-muted">
              Attendance sheets, surveys, photos, past reports, participant
              counts, or letters of support all help.
            </p>
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
            {wizard.uploads.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {wizard.uploads.map((u, i) => (
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
            Supporting data we found
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-ink-muted">
            Based on what you shared, here&apos;s what could help support this
            application. Pick what&apos;s relevant.
          </p>
          <div className="mb-6 flex flex-col gap-2.5">
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
              Explain my data →
            </button>
          </div>
        </div>
      )}

      {wizard.step === 3 && (
        <div>
          <h1 className="mb-2 font-serif text-2xl leading-tight font-medium">
            Your supporting data, explained
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-ink-muted">
            Remember the number, understand what it means, see it in context, and
            use it in your application.
          </p>
          <div className="mb-6 flex flex-col gap-3">
            {foundSections.length === 0 ? (
              <p className="text-sm leading-relaxed text-ink-muted">
                Go back and select at least one data point to see it explained
                here.
              </p>
            ) : (
              foundSections.map((s) => (
                <RueaCard
                  key={s.id}
                  section={s}
                  expanded={!!wizard.rueaExpanded[s.id]}
                  onToggle={() => toggleRuea(s.id)}
                  onAdd={finish}
                />
              ))
            )}
          </div>
          <button
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>
        </div>
      )}

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
