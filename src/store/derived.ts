import { GrantLifecycleStage } from "@/types/grantRecord";
import type Grant from "@/types/grant";
import {
  ALL_GRANTS,
  INITIATIVE_HILLTOP_WELLNESS,
  ACCOUNT_SECTIONS,
  type AccountSection,
} from "@/data/seed";
import { useAppStore } from "./useAppStore";

export type Progress = { done: number; total: number };

export type GrantView = {
  grant: Grant;
  stage: GrantLifecycleStage;
  alignmentAnalysis: string | null;
  hasWritingProgress: boolean;
  hasReportingProgress: boolean;
  // Coarse completion signals used by the dashboard cards. `writingProgress`
  // counts supporting data points gathered for an application draft;
  // `reportProgress` counts report questions answered.
  writingProgress: Progress;
  reportProgress: Progress;
};

// Nominal number of supporting data points a strong application draft gathers.
const WRITING_TARGET = 4;

function buildGrantView(
  grant: Grant,
  stageOverrides: Record<string, GrantLifecycleStage>,
): GrantView {
  const record = INITIATIVE_HILLTOP_WELLNESS.grantRecords.get(grant.id);
  const stage =
    stageOverrides[grant.id] ?? record?.stage ?? GrantLifecycleStage.NotSaved;

  const writingDone = (record?.writingAnalyses ?? []).reduce(
    (n, a) => n + a.data.length,
    0,
  );
  const reportConversations =
    record?.reportingAnalyses[0]?.conversations ?? [];
  const reportDone = reportConversations.filter(
    (c) => c.content !== undefined,
  ).length;

  return {
    grant,
    stage,
    alignmentAnalysis: record?.alignmentAnalysis ?? null,
    hasWritingProgress: (record?.writingAnalyses.length ?? 0) > 0,
    hasReportingProgress: (record?.reportingAnalyses.length ?? 0) > 0,
    writingProgress: {
      done: Math.min(writingDone, WRITING_TARGET),
      total: WRITING_TARGET,
    },
    reportProgress: {
      done: reportDone,
      total: reportConversations.length || WRITING_TARGET,
    },
  };
}

export function useGrantView(grantId: string): GrantView | undefined {
  const stageOverrides = useAppStore((s) => s.stageOverrides);
  const grant = ALL_GRANTS.find((g) => g.id === grantId);
  if (!grant) return undefined;
  return buildGrantView(grant, stageOverrides);
}

export function useAllGrantViews(): GrantView[] {
  const stageOverrides = useAppStore((s) => s.stageOverrides);
  return ALL_GRANTS.map((g) => buildGrantView(g, stageOverrides));
}

export function isSavedStage(stage: GrantLifecycleStage): boolean {
  return (
    stage !== GrantLifecycleStage.NotSaved &&
    stage !== GrantLifecycleStage.Unsaved
  );
}

export function useDashboardGroups() {
  const views = useAllGrantViews();
  const inProgress = views.filter(
    (v) => v.stage === GrantLifecycleStage.Saved && v.hasWritingProgress,
  );
  const saved = views.filter(
    (v) => v.stage === GrantLifecycleStage.Saved && !v.hasWritingProgress,
  );
  const awarded = views.filter(
    (v) =>
      v.stage === GrantLifecycleStage.Awarded ||
      v.stage === GrantLifecycleStage.Reported,
  );
  return { inProgress, saved, awarded };
}

export function useAccountSectionsView(): (AccountSection & {
  factsResolved: AccountSection["facts"];
})[] {
  const edits = useAppStore((s) => s.accountEdits);
  return ACCOUNT_SECTIONS.map((section) => ({
    ...section,
    factsResolved: section.facts.map((fact) =>
      edits[fact.id] !== undefined ? { ...fact, body: edits[fact.id] } : fact,
    ),
  }));
}
