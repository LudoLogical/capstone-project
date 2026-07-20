import { GrantLifecycleStage } from "@/types/grantRecord";
import type GrantRecord from "@/types/grantRecord";
import type Grant from "@/types/grant";
import { ALL_GRANTS, INITIATIVE_HILLTOP_WELLNESS } from "@/data/seed";
import {
  useAppStore,
  isTerminalStatus,
  type GrantStatus,
  type ReportState,
  type WizardState,
} from "./useAppStore";

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
  // The application window has closed - the grant can no longer be worked on,
  // saved, or listed for collaboration.
  isClosed: boolean;
  // Where this grant sits in its lifecycle, or undefined if the user has done
  // nothing with it beyond saving.
  status: GrantStatus | undefined;
  // The report deadline this grant is working toward, or null once every report
  // it owes has been filed.
  reportDue: Date | null;
  // Past its deadline with no word from the user on what happened. It stays put
  // on the board, flagged, until they resolve it - only they know whether they
  // actually submitted.
  needsAttention: boolean;
  // Whether the user has actually opened the application / report flow. Their
  // state only exists once they've engaged with it, so the dashboard can offer
  // "Start" rather than "Continue" the first time.
  writingStarted: boolean;
  reportStarted: boolean;
  alignmentAnalysis: GrantRecord["alignmentAnalysis"] | null;
  hasWritingProgress: boolean;
  hasReportingProgress: boolean;
  // Coarse completion signals used by the dashboard cards. `writingProgress`
  // counts supporting data points gathered for an application draft;
  // `reportProgress` counts report questions answered.
  writingProgress: Progress;
  reportProgress: Progress;
};

// Stand-in names used until the user gives their own, so the portal never shows
// a blank where a name belongs.
export const DEFAULT_PERSON_NAME = "Your Name";
export const DEFAULT_ORG_NAME = "Your Organization";

/** The user's name, or the "Your Name" placeholder. */
export function usePersonName(): string {
  const person = useAppStore((s) => s.onboardOrg.person);
  return person.trim() || DEFAULT_PERSON_NAME;
}

/** The org's name, or the "Your Organization" placeholder. */
export function useOrgName(): string {
  const name = useAppStore((s) => s.onboardOrg.name);
  return name.trim() || DEFAULT_ORG_NAME;
}

/**
 * True once a grant's application window has closed. Read at render time rather
 * than module load so the state is right whenever the page is open.
 */
export function isPastDeadline(grant: Grant): boolean {
  return grant.timeline.applicationWindowEnd.getTime() < Date.now();
}

/** True once the funder's own decision deadline has come and gone. */
export function isPastDecisionDate(grant: Grant): boolean {
  return grant.timeline.notificationDate.getTime() < Date.now();
}

/**
 * The report deadline a grant is currently working toward, or null when every
 * report it owes has been filed. Multi-report grants step forward one
 * `reportFrequency` at a time; reporting stops once the schedule runs past the
 * end of the award period (plus a window for the final report).
 */
export function nextReportDeadline(
  grant: Grant,
  reportsSubmitted: number,
): Date | null {
  const { firstReportDeadline, reportFrequency, awardEndDate } = grant.timeline;
  if (reportFrequency < 0) return null; // this grant asks for no reports
  if (reportsSubmitted === 0) return firstReportDeadline;
  if (reportFrequency === 0) return null; // a single report, already filed
  const next = new Date(firstReportDeadline);
  next.setMonth(next.getMonth() + reportsSubmitted * reportFrequency);
  // The last report falls due shortly after the award period ends; anything
  // past that window means the grant is done reporting.
  const FINAL_REPORT_WINDOW_MS = 90 * 86_400_000;
  if (next.getTime() > awardEndDate.getTime() + FINAL_REPORT_WINDOW_MS)
    return null;
  return next;
}

/**
 * Whole days between now and `date`, rounded up. Negative once the date is past.
 */
export function daysUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

// The application flow has 4 steps; the dashboard reports how many the user has
// opened as n/WRITING_TARGET.
const WRITING_TARGET = 3;

function buildGrantView(
  grant: Grant,
  stageOverrides: Record<string, GrantLifecycleStage>,
  reportState?: ReportState,
  wizardState?: WizardState,
  status?: GrantStatus,
  reportsSubmitted = 0,
): GrantView {
  const reportDue = nextReportDeadline(grant, reportsSubmitted);
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
  const reportConversations = record?.reportingAnalyses[0]?.conversations ?? [];
  const seededReportDone = reportConversations.filter(
    (c) => c.markedComplete,
  ).length;
  const liveReportDone = reportState
    ? Object.values(reportState.stepStatus ?? {}).filter(
        (s) => s === "complete",
      ).length
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
    isClosed: isPastDeadline(grant),
    status,
    // Two things can go unanswered, and only the user knows either. Before the
    // deadline nothing is owed; after it, we ask once and then stop.
    //   - the application window closed while they were still applying (or had
    //     only saved it): did they submit?
    //   - a submitted application passed the funder's decision date: what was
    //     the verdict?
    reportDue,
    needsAttention:
      (isPastDeadline(grant) &&
        (status === undefined || status === "applying")) ||
      (status === "submitted" && isPastDecisionDate(grant)) ||
      // An awarded grant whose report deadline has come and gone: only the user
      // knows whether they filed it.
      (status === "awarded" && !!reportDue && reportDue.getTime() < Date.now()),
    writingStarted: !!wizardState,
    reportStarted: !!reportState,
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
  const grantStatus = useAppStore((s) => s.grantStatus);
  const reportsSubmitted = useAppStore((s) => s.reportsSubmitted);
  const grant = ALL_GRANTS.find((g) => g.id === grantId);
  if (!grant) return undefined;
  return buildGrantView(
    grant,
    stageOverrides,
    reports[grant.id],
    wizards[grant.id],
    grantStatus[grant.id],
    reportsSubmitted[grant.id] ?? 0,
  );
}

export function useAllGrantViews(): GrantView[] {
  const stageOverrides = useAppStore((s) => s.stageOverrides);
  const reports = useAppStore((s) => s.report);
  const wizards = useAppStore((s) => s.wizard);
  const grantStatus = useAppStore((s) => s.grantStatus);
  const reportsSubmitted = useAppStore((s) => s.reportsSubmitted);
  return ALL_GRANTS.map((g) =>
    buildGrantView(
      g,
      stageOverrides,
      reports[g.id],
      wizards[g.id],
      grantStatus[g.id],
      reportsSubmitted[g.id] ?? 0,
    ),
  );
}

export function isSavedStage(stage: GrantLifecycleStage): boolean {
  return (
    stage !== GrantLifecycleStage.NotSaved &&
    stage !== GrantLifecycleStage.Unsaved
  );
}

/**
 * The dashboard columns, derived from each grant's single lifecycle `status`.
 * They are not one pipeline: the save bookmark and the collaborate listing are
 * independent of application progress, so a grant can appear in more than one
 * working column.
 *
 * - Applications: an application is being written (`applying`).
 * - Awarded Grant Reports: `awarded`, or the award period has ended.
 * - Saved: bookmarked, and not yet active work.
 * - Open to Collaborate: listed as discoverable.
 * - Archived: a terminal status, labelled with why it ended.
 */
export function useDashboardGroups() {
  const everything = useAllGrantViews();
  const discoverable = useAppStore((s) => s.discoverable);
  const deletedGrants = useAppStore((s) => s.deletedGrants);

  // Deleting is the user's way of saying "this is not mine to think about".
  // It only affects their board; Explore still lists the grant if it's open.
  const all = everything.filter((v) => !deletedGrants[v.grant.id]);

  // A terminal status is the end of the road: the grant leaves every working
  // column and shows only under Archived, tagged with how it ended.
  const archived = all.filter((v) => isTerminalStatus(v.status));
  const views = all.filter((v) => !isTerminalStatus(v.status));

  const awarded = views.filter(
    (v) => v.status === "awarded" || v.status === "report-overdue",
  );
  const inProgress = views.filter((v) => v.status === "applying");
  // Saved is the bookmark, independent of progress; active work has its own
  // column, so it isn't repeated here.
  const saved = views.filter((v) => v.isSaved && v.status === undefined);
  const collaborating = views.filter((v) => !!discoverable[v.grant.id]);
  return { inProgress, saved, awarded, collaborating, archived };
}
