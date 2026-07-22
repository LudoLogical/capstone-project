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
import ReportAnalysisStep from "@/app/grants/[grantId]/report/ReportAnalysisStep";

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

  // The analysis always tracks the review: every data point still selected there
  // gets a card here, and unselecting one drops its card. Points backed by an
  // authoritative datum get the full benchmarked analysis; the rest get the same
  // card without comparison bars.
  const analysisSections: AnalysisCardSection[] = REPORT_QUESTION_STEPS.flatMap(
    (sd) => {
      const chat = report.chat[sd.id];
      const selected = sd.items.filter(
        (it) => !chat.removed?.[it.id] && isPicked(chat.picks, it.id),
      );
      return selected.flatMap((it) => {
        const ruea = it.analysisId
          ? RUEA_SECTIONS.find((s) => s.id === it.analysisId)
          : undefined;
        if (ruea) return [ruea];
        const pa = POINT_ANALYSES[it.id];
        if (!pa) return [];
        return [{ id: it.id, analysis: pa, ...POINT_CONTEXT[it.id] }];
      });
    },
  ).filter((s) => !report.removedAnalyses[s.id]);

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
      customSupporting: [],
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
            <ReportAnalysisStep
              report={report}
              analysisSections={analysisSections}
              toggleAnalysis={toggleAnalysis}
              isAnalysisSelected={isAnalysisSelected}
              toggleAnalysisSelected={toggleAnalysisSelected}
              allAnalysisSelected={allAnalysisSelected}
              toggleAllAnalysisSelected={toggleAllAnalysisSelected}
              editCustomSupporting={editCustomSupporting}
              deleteCustomSupporting={deleteCustomSupporting}
              setStep={setStep}
              saveToGrant={saveToGrant}
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
