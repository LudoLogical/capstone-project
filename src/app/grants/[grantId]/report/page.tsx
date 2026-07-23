"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { NSRService } from "@/types/data";
import type { Datum } from "@/types/data";
import type { ReportState } from "@/store/useAppStore";
import type { ReportingRequirement } from "@/types/grant";
import { useGrantView } from "@/store/derived";
import { DATA_DETAILS } from "@/data/seed";
import Modal from "@/components/primitives/Modal";
import BackButton from "@/components/primitives/BackButton";
import {
  CONTEXT_STEP,
  analysisStep,
  approvedAnalysisSections,
  buildReviewGroups,
  openConversation,
  requirementIndexForStep,
  resolveDatum,
  reviewStep,
  totalSteps,
} from "@/app/grants/[grantId]/report/reportModel";
import ReportRequirementsGate from "@/app/grants/[grantId]/report/ReportRequirementsGate";
import ReportStepRail from "@/app/grants/[grantId]/report/ReportStepRail";
import ContextStep from "@/components/analysis/ContextStep";
import QuestionStep from "@/app/grants/[grantId]/report/ReportQuestionStep";
import ReportReviewStep from "@/app/grants/[grantId]/report/ReportReviewStep";
import AnalysisStep from "@/components/analysis/AnalysisStep";

export default function ReportFlowPage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const report = useAppStore((s) => s.getReport(grantId));
  const updateReport = useAppStore((s) => s.updateReport);
  const repository = useAppStore((s) => s.repository);
  const addRepositoryDocuments = useAppStore((s) => s.addRepositoryDocuments);
  const addRepositoryWebpage = useAppStore((s) => s.addRepositoryWebpage);
  const addRepositoryChat = useAppStore((s) => s.addRepositoryChat);
  const addToast = useAppStore((s) => s.addToast);
  const [usageKey, setUsageKey] = useState<NSRService | null>(null);

  // Which sources start shared comes solely from the seeded defaults in
  // `makeReportState()` - matching the wizard, and leaving a manual uncheck
  // intact across reloads.

  if (!view) return null;
  const { grant } = view;

  // The flow's shape is the requirements: one question apiece, then review,
  // then analysis.
  const requirementCount = report.requirements.length;
  const REVIEW_STEP = reviewStep(requirementCount);
  const ANALYSIS_STEP = analysisStep(requirementCount);

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

  // Anything added here is attached to this report *and* filed in the org-wide
  // repository on the Profile screen, which is where the user is told their
  // uploads are kept for reuse. Removing the chip below only detaches it from
  // this report - it stays in the repository until deleted there.
  const addFiles = (files: File[]) => {
    const ids = addRepositoryDocuments(files);
    updateReport(grantId, (r) => ({ ...r, uploads: [...r.uploads, ...ids] }));
    return ids;
  };

  const addLink = (link: string) => {
    const id = addRepositoryWebpage(link);
    updateReport(grantId, (r) => ({ ...r, uploads: [...r.uploads, id] }));
    return id;
  };

  // Attached sources are looked up rather than stored by name, so a source
  // deleted from the repository drops out of this list on its own.
  const uploadSources = report.uploads.flatMap(
    (id) => repository.find((s) => s.id === id) ?? [],
  );
  // Detaches the source from this report only - it stays in the user's
  // repository, which is the one place a source is actually deleted.
  const removeUpload = (id: string) =>
    updateReport(grantId, (r) => ({
      ...r,
      uploads: r.uploads.filter((u) => u !== id),
    }));
  // The card sends the value it wants stored, already flipped from the state
  // the user can actually see (the topmost card reads as open with nothing
  // stored), so this stays a plain write.
  const setAnalysisExpanded = (id: string, value: boolean) =>
    updateReport(grantId, (r) => ({
      ...r,
      analysisExpanded: { ...r.analysisExpanded, [id]: value },
    }));

  const requirementIndex = requirementIndexForStep(
    report.step,
    requirementCount,
  );

  const datumFor = (id: number): Datum | undefined =>
    resolveDatum(id, report.chatData, repository);

  /**
   * Approving is one decision per data point, taken here rather than inside a
   * step: the same datum can be suggested under two different requirements and
   * is listed again on Review, and every one of those places has to agree.
   */
  const toggleApproved = (id: number) =>
    updateReport(grantId, (r) => ({
      ...r,
      approved: { ...r.approved, [id]: !r.approved[id] },
    }));

  const reviewGroups = buildReviewGroups(report, repository);

  // The single gate on reaching Analysis: at least one data point is approved.
  // Shared by Review's "Save and analyze" button and the rail's Analysis step
  // so the two can't disagree.
  const reviewHasSelection = reviewGroups.some((g) =>
    g.items.some((it) => it.approved),
  );

  const allReviewPicked =
    reviewGroups.length > 0 &&
    reviewGroups.every((g) => g.items.every((it) => it.approved));
  const toggleAllReviewPicked = () => {
    const next = !allReviewPicked;
    const ids = reviewGroups.flatMap((g) => g.items.map((it) => it.datum.id));
    updateReport(grantId, (r) => ({
      ...r,
      approved: {
        ...r.approved,
        ...Object.fromEntries(ids.map((id) => [id, next])),
      },
    }));
  };

  // The analysis always tracks the review: every data point still approved
  // there gets exactly one card here, and unapproving one drops its card.
  const analysisSections = approvedAnalysisSections(report, repository);

  // Export selection on the Analysis step. Each card's checkbox starts
  // unchecked; the user opts cards in. Keyed by card id.
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
  // user has since unapproved on Review are left as they were.
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

  /**
   * Accepting the requirements is what gives the flow its questions, so it also
   * opens one conversation apiece.
   *
   * Editing them later is an amendment, not a restart: a requirement that
   * survived keeps the conversation the user already had, and only a new one
   * starts from scratch. Approvals are keyed by data point, so they hold either
   * way.
   */
  const submitRequirements = (next: ReportingRequirement[]) =>
    updateReport(grantId, (r) => {
      const existing = new Map(
        r.requirements.map((req, i) => [req.statement, r.conversations[i]]),
      );
      return {
        ...r,
        requirements: next,
        requirementsSet: true,
        conversations: next.map(
          (req) => existing.get(req.statement) ?? openConversation(req),
        ),
        // Dropping a requirement can leave the user standing on a step that no
        // longer exists.
        step: Math.min(r.step, totalSteps(next.length)),
      };
    });

  // Editing reopens the gate with the current requirements loaded, so the user
  // amends what's there rather than starting over.
  const editRequirements = () =>
    updateReport(grantId, (r) => ({ ...r, requirementsSet: false }));

  // Gate: before anything else, the user settles this grant's reporting
  // requirements. They're then kept in view and woven through every step.
  if (!report.requirementsSet) {
    return (
      <ReportRequirementsGate
        grant={grant}
        current={report.requirements}
        submitRequirements={submitRequirements}
      />
    );
  }

  // Resetting starts the report over: back to the requirements, every
  // conversation cleared, and the Analysis step locked again until the user
  // re-unlocks it from Review.
  const resetAnalysis = () =>
    updateReport(grantId, (r) => ({
      ...r,
      requirements: [],
      requirementsSet: false,
      step: 1,
      // Clearing the statuses re-locks Analysis; step 1 becomes the live step.
      stepStatus: { 1: "in-progress" },
      // The questions are rebuilt from the requirements, so the answers to the
      // old ones can't be carried over - and the analysis is derived from what
      // is approved, which is what clearing these actually resets.
      conversations: [],
      approved: {},
      chatData: {},
      supportingPicks: {},
      analysisExpanded: {},
    }));

  const saveToGrant = () => {
    updateReport(grantId, (r) => ({
      ...r,
      stepStatus: { ...r.stepStatus, [ANALYSIS_STEP]: "complete" },
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
          {report.step === CONTEXT_STEP && (
            <ContextStep
              share={report.share}
              uploads={uploadSources}
              toggleShare={toggleShare}
              setUsageKey={setUsageKey}
              addFiles={addFiles}
              addLink={addLink}
              removeUpload={removeUpload}
              onContinue={() => saveAndContinue(CONTEXT_STEP)}
            />
          )}

          {requirementIndex !== null && report.conversations[requirementIndex] && (
            <QuestionStep
              // Remount per question so the composer (and its focus) belongs to
              // this page alone.
              key={requirementIndex}
              requirementIndex={requirementIndex}
              requirement={report.requirements[requirementIndex]}
              conversation={report.conversations[requirementIndex]}
              approved={report.approved}
              datumFor={datumFor}
              toggleApproved={toggleApproved}
              grantId={grantId}
              updateReport={updateReport}
              addFiles={addFiles}
              addLink={addLink}
              addRepositoryChat={addRepositoryChat}
              setStep={setStep}
              saveAndContinue={saveAndContinue}
            />
          )}

          {report.step === REVIEW_STEP && (
            <ReportReviewStep
              reviewGroups={reviewGroups}
              isComplete={isComplete}
              toggleApproved={toggleApproved}
              allReviewPicked={allReviewPicked}
              toggleAllReviewPicked={toggleAllReviewPicked}
              reviewHasSelection={reviewHasSelection}
              reviewStep={REVIEW_STEP}
              setStep={setStep}
              saveAndContinue={saveAndContinue}
            />
          )}

          {report.step === ANALYSIS_STEP && (
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
              onBack={() => setStep(REVIEW_STEP)}
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
