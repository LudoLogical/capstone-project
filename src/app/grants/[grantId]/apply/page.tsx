"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { NSRService } from "@/types/data";
import { useGrantView } from "@/store/derived";
import { DATA_DETAILS, RUEA_SECTIONS, SHARE_KEYS } from "@/data/seed";
import Modal from "@/components/primitives/Modal";
import BackButton from "@/components/primitives/BackButton";
import ApplyStepRail from "@/app/grants/[grantId]/apply/ApplyStepRail";
import ContextStep from "@/components/analysis/ContextStep";
import ApplyReviewStep from "@/app/grants/[grantId]/apply/ApplyReviewStep";
import ApplyAnalysisStep from "@/app/grants/[grantId]/apply/ApplyAnalysisStep";

/**
 * The application flow is three steps: share your context, review the data we
 * found, then analyze it.
 */
function stepPlan() {
  return {
    labels: ["Share your context", "Review", "Analysis"],
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

export default function ApplyWizardPage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const view = useGrantView(grantId);
  const wizard = useAppStore((s) => s.getWizard(grantId));
  const updateWizard = useAppStore((s) => s.updateWizard);
  const [usageKey, setUsageKey] = useState<NSRService | null>(null);

  // Once a data form is completed, auto-check its "Share your context" box so
  // it's included by default. Tracked per key so a manual uncheck afterward
  // isn't undone on the next render.
  const autoCheckedRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    SHARE_KEYS.forEach((key) => {
      const completed = DATA_DETAILS[key].completed;
      if (!completed || autoCheckedRef.current[key]) return;
      autoCheckedRef.current[key] = true;
      updateWizard(grantId, (w) =>
        w.share[key] ? w : { ...w, share: { ...w.share, [key]: true } },
      );
    });
  }, [wizard.share, grantId, updateWizard]);

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

  const setRueaExpanded = (id: string, value: boolean) =>
    updateWizard(grantId, (w) => ({
      ...w,
      rueaExpanded: { ...w.rueaExpanded, [id]: value },
    }));

  const foundSections = RUEA_SECTIONS.filter((s) => isFound(s.id));

  // Export selection on the Analyze step. Each card's checkbox starts unchecked;
  // the user opts cards in. Reuses the persisted `analysisAdded` map, keyed by
  // section id.
  const isExportSelected = (key: string) => !!wizard.analysisAdded[key];
  const setExportSelected = (key: string, value: boolean) =>
    updateWizard(grantId, (w) => ({
      ...w,
      analysisAdded: { ...w.analysisAdded, [key]: value },
    }));
  const exportKeys = foundSections.map((s) => s.id);
  const allExportSelected =
    exportKeys.length > 0 && exportKeys.every((k) => isExportSelected(k));
  // Only the cards on screen are touched, so ticks belonging to data points the
  // user has since deselected on Review are left as they were.
  const toggleAllExport = () =>
    updateWizard(grantId, (w) => ({
      ...w,
      analysisAdded: {
        ...w.analysisAdded,
        ...Object.fromEntries(exportKeys.map((k) => [k, !allExportSelected])),
      },
    }));

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
    updateWizard(grantId, (w) => ({
      ...w,
      analysisAdded: {},
      rueaExpanded: {},
      analysisUnlocked: false,
      step: 1,
      visited: { 1: true },
    }));
  };

  return (
    <div className="animate-nc-rise mx-auto w-full max-w-6xl px-8 pt-7 pb-16">
      <BackButton fallback={`/grants/${grant.id}`} />
      <div className="mb-6">
        <h1 className="max-w-4xl font-serif text-3xl leading-tight font-bold">
          Gather data for {grant.name}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          Share what you already have, review what we found, and turn it into an
          analysis you can use in your application.
        </p>
      </div>
      <div className="flex items-start gap-7">
        {/* Same shell as the report flow: a sticky step rail beside the work. */}
        <ApplyStepRail
          wizard={wizard}
          STEP_LABELS={STEP_LABELS}
          STEP_GROUPS={STEP_GROUPS}
          REVIEW_STEP={REVIEW_STEP}
          ANALYSIS_STEP={ANALYSIS_STEP}
          analysisUnlocked={analysisUnlocked}
          analysisHasData={foundSections.length > 0}
          reviewHasSelection={foundSections.length > 0}
          setStep={setStep}
          resetAnalysis={resetAnalysis}
        />

        <div className="min-w-0 max-w-3xl flex-1">
          {wizard.step === 1 && (
            <ContextStep
              share={wizard.share}
              uploads={wizard.uploads}
              toggleShare={toggleShare}
              setUsageKey={setUsageKey}
              addUploads={addUploads}
              removeUpload={removeUpload}
              onContinue={() => setStep(REVIEW_STEP)}
            />
          )}

          {wizard.step === REVIEW_STEP && (
            <ApplyReviewStep
              isFound={isFound}
              toggleFound={toggleFound}
              allFound={allFound}
              toggleAllFound={toggleAllFound}
              analysisUnlocked={analysisUnlocked}
              unlockAnalysis={unlockAnalysis}
              setStep={setStep}
              REVIEW_STEP={REVIEW_STEP}
            />
          )}

          {wizard.step === ANALYSIS_STEP && (
            <ApplyAnalysisStep
              wizard={wizard}
              foundSections={foundSections}
              setRueaExpanded={setRueaExpanded}
              isExportSelected={isExportSelected}
              setExportSelected={setExportSelected}
              allExportSelected={allExportSelected}
              toggleAllExport={toggleAllExport}
              setStep={setStep}
              REVIEW_STEP={REVIEW_STEP}
            />
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
    </div>
  );
}
