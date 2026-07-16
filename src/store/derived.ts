import { GrantLifecycleStage } from "@/types/grantRecord";
import type Grant from "@/types/grant";
import {
  ALL_GRANTS,
  INITIATIVE_HILLTOP_WELLNESS,
  ACCOUNT_SECTIONS,
  ORG_PROFILES,
  type AccountSection,
} from "@/data/seed";
import { useAppStore, type ReportState, type WizardState } from "./useAppStore";

export type Progress = { done: number; total: number };

// A report walks through 7 steps; the dashboard reports the count marked
// complete as n/REPORT_STEP_TOTAL.
const REPORT_STEP_TOTAL = 7;

export type GrantView = {
  grant: Grant;
  // Current stage: the user's override if any, else the seed record's stage.
  // Reflects the save bookmark (save/unsave writes here).
  stage: GrantLifecycleStage;
  // The seed lifecycle stage, independent of the save bookmark. Awarded /
  // Reported grants are grouped by this so unsaving never drops them from the
  // reports column.
  seedStage: GrantLifecycleStage | null;
  // Whether the grant is a saved bookmark. Depends on an explicit save override
  // (or a seed stage of Saved) - crucially NOT on Awarded/Reported, so an
  // awarded grant is not shown as "saved" until the user actually saves it, and
  // unsaving reliably clears the saved state everywhere.
  isSaved: boolean;
  alignmentAnalysis: string | null;
  hasWritingProgress: boolean;
  hasReportingProgress: boolean;
  // Coarse completion signals used by the dashboard cards. `writingProgress`
  // counts supporting data points gathered for an application draft;
  // `reportProgress` counts report questions answered.
  writingProgress: Progress;
  reportProgress: Progress;
};

// The application flow has 4 steps; the dashboard reports how many the user has
// opened as n/WRITING_TARGET.
const WRITING_TARGET = 3;

function buildGrantView(
  grant: Grant,
  stageOverrides: Record<string, GrantLifecycleStage>,
  reportState?: ReportState,
  wizardState?: WizardState,
): GrantView {
  const record = INITIATIVE_HILLTOP_WELLNESS.grantRecords.get(grant.id);
  const override = stageOverrides[grant.id];
  const stage = override ?? record?.stage ?? GrantLifecycleStage.NotSaved;
  const isSaved =
    override !== undefined
      ? isSavedStage(override)
      : record?.stage === GrantLifecycleStage.Saved;

  // Writing progress reflects the application steps the user has actually
  // opened (out of 4). Before they've touched the flow, fall back to what the
  // seed implies so a seeded in-progress grant still reads > 0.
  const seededWritingDone = (record?.writingAnalyses ?? []).reduce(
    (n, a) => n + a.data.length,
    0,
  );
  const writingDone = wizardState
    ? Object.values(wizardState.visited ?? {}).filter(Boolean).length
    : seededWritingDone;
  // Report progress reflects the steps the user has actually marked complete
  // in the live report flow (out of 7). Before they've touched it, fall back to
  // whatever the seed conversations imply so an awarded grant still reads > 0.
  const reportConversations =
    record?.reportingAnalyses[0]?.conversations ?? [];
  const seededReportDone = reportConversations.filter(
    (c) => c.content !== undefined,
  ).length;
  const liveReportDone = reportState
    ? Object.values(reportState.stepStatus).filter((s) => s === "complete")
        .length
    : 0;
  const reportDone = Math.min(
    Math.max(seededReportDone, liveReportDone),
    REPORT_STEP_TOTAL,
  );

  return {
    grant,
    stage,
    seedStage: record?.stage ?? null,
    isSaved,
    alignmentAnalysis: record?.alignmentAnalysis ?? null,
    hasWritingProgress: (record?.writingAnalyses.length ?? 0) > 0,
    hasReportingProgress: (record?.reportingAnalyses.length ?? 0) > 0,
    writingProgress: {
      done: Math.min(writingDone, WRITING_TARGET),
      total: WRITING_TARGET,
    },
    reportProgress: {
      done: reportDone,
      total: REPORT_STEP_TOTAL,
    },
  };
}

export function useGrantView(grantId: string): GrantView | undefined {
  const stageOverrides = useAppStore((s) => s.stageOverrides);
  const reports = useAppStore((s) => s.report);
  const wizards = useAppStore((s) => s.wizard);
  const grant = ALL_GRANTS.find((g) => g.id === grantId);
  if (!grant) return undefined;
  return buildGrantView(grant, stageOverrides, reports[grant.id], wizards[grant.id]);
}

export function useAllGrantViews(): GrantView[] {
  const stageOverrides = useAppStore((s) => s.stageOverrides);
  const reports = useAppStore((s) => s.report);
  const wizards = useAppStore((s) => s.wizard);
  return ALL_GRANTS.map((g) =>
    buildGrantView(g, stageOverrides, reports[g.id], wizards[g.id]),
  );
}

export function isSavedStage(stage: GrantLifecycleStage): boolean {
  return (
    stage !== GrantLifecycleStage.NotSaved &&
    stage !== GrantLifecycleStage.Unsaved
  );
}

/**
 * The three dashboard columns are independent memberships, not a single
 * pipeline, so a grant can appear in more than one:
 *
 * - Saved Grants: every grant the user has bookmarked (save/unsave writes the
 *   stage). Unsaving removes a grant from here and here ONLY.
 * - Grant Applications: grants the user explicitly started an application for.
 *   Independent of the save bookmark, so unsaving never removes it from here.
 * - Report for Awarded Grants: grants that are awarded (seeded, or marked by
 *   the user). Independent of the save bookmark too.
 *
 * Awarded grants are shown only under reports; they don't also clutter Saved.
 */
export function useDashboardGroups() {
  const views = useAllGrantViews();
  const applicationStarted = useAppStore((s) => s.applicationStarted);
  const awardedGrants = useAppStore((s) => s.awardedGrants);
  const discoverable = useAppStore((s) => s.discoverable);

  const isAwarded = (v: GrantView): boolean =>
    v.seedStage === GrantLifecycleStage.Awarded ||
    v.seedStage === GrantLifecycleStage.Reported ||
    !!awardedGrants[v.grant.id];

  // Saved membership uses the view's `isSaved` (override-aware, independent of
  // awarded status), so it stays consistent with every other place that shows a
  // save state - notably the Explore cards.
  const awarded = views.filter(isAwarded);
  const inProgress = views.filter(
    (v) => !isAwarded(v) && !!applicationStarted[v.grant.id],
  );
  const saved = views.filter((v) => v.isSaved);
  const collaborating = views.filter((v) => !!discoverable[v.grant.id]);
  return { inProgress, saved, awarded, collaborating };
}

/** A short, human-readable name for a route, used in "Back to ..." controls. */
export function labelForPath(path: string | null | undefined): string {
  if (!path || path === "/" || path.startsWith("/dashboard")) return "dashboard";
  if (path.startsWith("/search")) return "search";
  if (path.startsWith("/account")) return "profile";
  const m = path.match(/^\/grants\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?/);
  if (m) {
    const grant = ALL_GRANTS.find((g) => g.id === m[1]);
    const sub = m[2];
    const orgId = m[3];
    if (sub === "collaborate" && orgId)
      return ORG_PROFILES[orgId]?.name ?? "collaborators";
    if (sub === "collaborate") return "collaborators";
    if (sub === "report") return "report";
    if (sub === "collect") return "data collection";
    if (sub === "fit") return "fit analysis";
    return grant?.name ?? "grant";
  }
  return "previous page";
}

/**
 * Resolve where a Back control should go: the page the user actually came
 * from, falling back to a sensible default when there's no history (e.g. a
 * fresh load or a deep link). `href` is the target, `label` names it.
 */
export function useBackTarget(fallback: string): { href: string; label: string } {
  const navStack = useAppStore((s) => s.navStack);
  // The entry before the current one is where Back goes; fall back when there's
  // no history (fresh load or deep link).
  const prev = navStack.length >= 2 ? navStack[navStack.length - 2] : null;
  const href = prev ?? fallback;
  return { href, label: labelForPath(href) };
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
