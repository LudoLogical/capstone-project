"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { NSRService } from "@/types/data";
import type { ReportState } from "@/store/useAppStore";
import { useGrantView } from "@/store/derived";
import {
  DATA_DETAILS,
  POINT_ANALYSES,
  POINT_CONTEXT,
  REPORT_QUESTION_STEPS,
  RUEA_SECTIONS,
  userPointAnalysis,
} from "@/data/seed";
import { type AnalysisCardSection } from "@/components/analysis/RueaCard";
import Modal from "@/components/primitives/Modal";
import BackButton from "@/components/primitives/BackButton";
import {
  STEP_NAV,
  isPicked,
  QUESTION_STEP_ID_BY_INDEX,
  type QuestionStepId,
} from "@/app/grants/[grantId]/report/reportModel";
import ReportRequirementsGate from "@/app/grants/[grantId]/report/ReportRequirementsGate";
import ReportStepRail from "@/app/grants/[grantId]/report/ReportStepRail";
import ContextStep from "@/components/analysis/ContextStep";
import ReportChatStepPane from "@/app/grants/[grantId]/report/ReportChatStepPane";
import ReportReviewStep from "@/app/grants/[grantId]/report/ReportReviewStep";
import AnalysisStep from "@/components/analysis/AnalysisStep";

export default function ReportFlowPage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const report = useAppStore((s) => s.getReport(grantId));
  const updateReport = useAppStore((s) => s.updateReport);
  const addToast = useAppStore((s) => s.addToast);
  const dontAskDeleteFound = useAppStore((s) => s.dontAskDeleteFound);
  const setDontAskDeleteFound = useAppStore((s) => s.setDontAskDeleteFound);
  const [usageKey, setUsageKey] = useState<NSRService | null>(null);
  const [reqDraft, setReqDraft] = useState("");

  // Which sources start shared comes solely from the seeded defaults in
  // `makeReportState()` - matching the wizard, and leaving a manual uncheck
  // intact across reloads.

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
  // The card sends the value it wants stored, already flipped from the state
  // the user can actually see (the topmost card reads as open with nothing
  // stored), so this stays a plain write.
  const setAnalysisExpanded = (id: string, value: boolean) =>
    updateReport(grantId, (r) => ({
      ...r,
      analysisExpanded: { ...r.analysisExpanded, [id]: value },
    }));

  const questionStepId = QUESTION_STEP_ID_BY_INDEX[report.step];

  // The analysis always tracks the review: every data point still selected
  // there gets exactly one card here, and unselecting one drops its card. That
  // mapping is the contract the Analysis step is built on - which is why this
  // is total over the selection, with a stand-in analysis for any point that
  // has none of its own rather than a silent omission. Points backed by an
  // authoritative datum get the full benchmarked analysis; the rest get the
  // same card without comparison bars.
  const analysisSections: AnalysisCardSection[] = REPORT_QUESTION_STEPS.flatMap(
    (sd) => {
      const chat = report.chat[sd.id];
      const seeded = sd.items
        .filter((it) => !chat.removed?.[it.id] && isPicked(chat.picks, it.id))
        .map((it) => {
          const ruea = it.analysisId
            ? RUEA_SECTIONS.find((s) => s.id === it.analysisId)
            : undefined;
          if (ruea) return ruea;
          const pa = POINT_ANALYSES[it.id];
          return {
            id: it.id,
            analysis: pa ?? userPointAnalysis(it.id, it.label, it.source),
            ...POINT_CONTEXT[it.id],
          };
        });
      // Points the user typed into this step's chat. They are selected by the
      // same `custom-<i>` key the chat writes, but the card is keyed by step as
      // well - the index restarts in every step, so an unqualified id would
      // collide across them and make two cards share one open/ticked entry.
      const typed = (chat.custom ?? [])
        // Keyed off the original index, before any filtering - that is what
        // both `picks` and `customSources` are keyed by.
        .map((text, i) => ({
          text,
          itemId: `custom-${i}`,
          citation: chat.customSources?.[i]
            ? `From ${chat.customSources[i]}`
            : "Added by you",
        }))
        .filter(
          (it) => !chat.removed?.[it.itemId] && isPicked(chat.picks, it.itemId),
        )
        .map(({ text, itemId, citation }) => {
          const id = `${sd.id}-${itemId}`;
          return { id, analysis: userPointAnalysis(id, text, citation) };
        });
      return [...seeded, ...typed];
    },
  );

  // Resetting starts the report over: back to the requirements checklist, every
  // card cleared, and the Analysis step locked again until the user re-unlocks
  // it from Review.
  const resetAnalysis = () => {
    setReqDraft("");
    updateReport(grantId, (r) => ({
      ...r,
      requirements: "",
      requirementsSet: false,
      step: 1,
      // Clearing step 6 re-locks step 7; step 1 becomes the live step again.
      stepStatus: { 1: "in-progress" },
      // The analysis is derived from the Review selections, so clearing these
      // is what "resets" it: no cards deleted, nothing selected for export, and
      // it rebuilds from scratch once the user unlocks it again.
      removedAnalyses: {},
      supportingPicks: {},
      analysisExpanded: {},
    }));
  };

  // The consolidated review (step 6): every data point gathered across the four
  // question sections, grouped by section. Removed items drop out. This is the
  // single source of truth for what the report includes.
  const reviewGroups = REPORT_QUESTION_STEPS.map((sd) => {
    const chat = report.chat[sd.id];
    // Selection is shared with the section page via `picks` (unset = unchecked),
    // so checking here checks there and vice versa.
    // Every gathered point is listed. Unchecking one excludes it from the
    // analysis but keeps it here; only the × removes it outright.
    const items = [
      ...sd.items
        .filter((it) => !chat.removed?.[it.id])
        .map((it) => ({
          stepId: sd.id,
          itemId: it.id,
          label: it.label,
          source: it.source,
          picked: isPicked(chat.picks, it.id),
        })),
      ...(chat.custom ?? [])
        .map((text, i) => ({
          stepId: sd.id,
          itemId: `custom-${i}`,
          label: text,
          source: chat.customSources?.[i]
            ? `From ${chat.customSources[i]}`
            : "Added by you",
          picked: isPicked(chat.picks, `custom-${i}`),
        }))
        .filter((it) => !chat.removed?.[it.itemId]),
    ];
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
            [itemId]: !isPicked(r.chat[stepId].picks, itemId),
          },
        },
      },
    }));

  // The single gate on reaching Analysis: at least one data point is checked on
  // Review. Shared by Review's "Save and analyze" button and the rail's
  // Analysis step so the two can't disagree.
  const reviewHasSelection = reviewGroups.some((g) =>
    g.items.some((it) => it.picked),
  );

  const allReviewPicked =
    reviewGroups.length > 0 &&
    reviewGroups.every((g) => g.items.every((it) => it.picked));
  // Every point still listed flips together. Items already removed with the ×
  // aren't in `reviewGroups`, so they stay removed.
  const toggleAllReviewPicked = () => {
    const next = !allReviewPicked;
    updateReport(grantId, (r) => {
      const chat = { ...r.chat };
      reviewGroups.forEach((g) => {
        chat[g.stepId] = {
          ...chat[g.stepId],
          picks: {
            ...chat[g.stepId].picks,
            ...Object.fromEntries(g.items.map((it) => [it.itemId, next])),
          },
        };
      });
      return { ...r, chat };
    });
  };

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
  const toggleAnalysisSelected = (id: string) =>
    updateReport(grantId, (r) => ({
      ...r,
      supportingPicks: {
        ...r.supportingPicks,
        [id]: !r.supportingPicks[id],
      },
    }));
  const allAnalysisSelected =
    analysisSections.length > 0 &&
    analysisSections.every((s) => isAnalysisSelected(s.id));
  // Only the cards on screen are touched, so ticks belonging to data points the
  // user has since deselected on Review are left as they were.
  const toggleAllAnalysisSelected = () =>
    updateReport(grantId, (r) => ({
      ...r,
      supportingPicks: {
        ...r.supportingPicks,
        ...Object.fromEntries(
          analysisSections.map((s) => [s.id, !allAnalysisSelected]),
        ),
      },
    }));

  const submitRequirements = () =>
    updateReport(grantId, (r) => ({
      ...r,
      requirements: reqDraft.trim(),
      requirementsSet: true,
    }));

  // Editing reopens the gate with the current text loaded, so the user amends
  // what's there rather than retyping it.
  const editRequirements = () => {
    setReqDraft(report.requirements);
    updateReport(grantId, (r) => ({ ...r, requirementsSet: false }));
  };

  // Tapping a common requirement appends it as its own line, so the user can
  // build the list by clicking and still edit or add to it by hand.
  const addRequirement = (text: string) =>
    setReqDraft((d) =>
      d.includes(text) ? d : d.trim() ? `${d.trim()}\n- ${text}` : `- ${text}`,
    );

  // Gate: before anything else, the user supplies this grant's reporting
  // requirements. They're then kept in view and woven through every step.
  if (!report.requirementsSet) {
    return (
      <ReportRequirementsGate
        grant={grant}
        reqDraft={reqDraft}
        setReqDraft={setReqDraft}
        addRequirement={addRequirement}
        submitRequirements={submitRequirements}
      />
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
    <div className="animate-nc-rise mx-auto w-full max-w-6xl px-8 pt-7 pb-16">
      <BackButton fallback="/" />
      <div className="mb-6">
        <h1 className="max-w-4xl font-serif text-3xl leading-tight font-bold">
          Build your report for {grant.name}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          We&apos;ll walk you through each reporting requirement and help you
          pull together all of the data that you&apos;ll need.
        </p>
      </div>
      <div className="flex items-start gap-7">
        <ReportStepRail
          report={report}
          isComplete={isComplete}
          reviewHasSelection={reviewHasSelection}
          setStep={setStep}
          resetAnalysis={resetAnalysis}
          editRequirements={editRequirements}
        />

        <div className="min-w-0 max-w-3xl flex-1">
          {report.step === 1 && (
            <ContextStep
              share={report.share}
              uploads={report.uploads}
              toggleShare={toggleShare}
              setUsageKey={setUsageKey}
              addUploads={addUploads}
              removeUpload={removeUpload}
              onContinue={() => saveAndContinue(1)}
            />
          )}

          {questionStepId && (
            <ReportChatStepPane
              questionStepId={questionStepId}
              report={report}
              grantId={grantId}
              updateReport={updateReport}
              dontAskDeleteFound={dontAskDeleteFound}
              setDontAskDeleteFound={setDontAskDeleteFound}
              setStep={setStep}
              saveAndContinue={saveAndContinue}
            />
          )}

          {report.step === 6 && (
            <ReportReviewStep
              reviewGroups={reviewGroups}
              isComplete={isComplete}
              toggleReviewItem={toggleReviewItem}
              allReviewPicked={allReviewPicked}
              toggleAllReviewPicked={toggleAllReviewPicked}
              reviewHasSelection={reviewHasSelection}
              deleteReviewItem={deleteReviewItem}
              dontAskDeleteFound={dontAskDeleteFound}
              setDontAskDeleteFound={setDontAskDeleteFound}
              setStep={setStep}
              saveAndContinue={saveAndContinue}
            />
          )}

          {report.step === 7 && (
            <AnalysisStep
              sections={analysisSections}
              expanded={report.analysisExpanded}
              setExpanded={setAnalysisExpanded}
              isSelected={isAnalysisSelected}
              toggleSelected={toggleAnalysisSelected}
              allSelected={allAnalysisSelected}
              toggleAll={toggleAllAnalysisSelected}
              usageBullet="IN YOUR REPORT shows you how you can use it to demonstrate the impact you've had"
              applyLabel="In your report"
              onBack={() => setStep(6)}
              onSaveAndExit={saveToGrant}
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
