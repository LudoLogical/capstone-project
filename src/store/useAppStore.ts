import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GrantLifecycleStage } from "@/types/grantRecord";
import type { SearchFilters, SortOption } from "@/data/selectors";
import { DEFAULT_FILTERS } from "@/data/selectors";
import { NSRService } from "@/types/data";

export type OnboardOrg = {
  // The person filling this out - their name greets them across the app.
  person: string;
  name: string;
  // Where collaborators reach the org - shown as the sender on warm intros.
  email: string;
  // Issue and service-area tags, drawn from the same lists as the Explore
  // search filter (ISSUE_TAGS / LOCATION_OPTIONS), so they're plain strings.
  issues: string[];
  areas: string[];
};

const emptyOnboardOrg = (): OnboardOrg => ({
  person: "",
  name: "",
  email: "",
  issues: [],
  areas: [],
});

export type ChatMessage = { from: "user" | "ai"; text: string };

export type ReportChatState = {
  messages: ChatMessage[];
  marked: boolean;
  // The unsent message box contents. Kept per section so each page's chat box
  // holds its own draft rather than sharing one across the flow.
  draft: string;
  picks: Record<string, boolean>;
  // Entries the user typed in themselves (or that were surfaced from an attached
  // file). They join the found-data list as extra, pre-selected items
  // (keyed "custom-<index>" in `picks`).
  custom: string[];
  // Optional per-custom source label, keyed by the custom entry's index. When
  // absent, the item is shown as "Added by you"; a file attachment sets the
  // file name here so the surfaced fact is traceable.
  customSources?: Record<number, string>;
  // Found items the user deleted, keyed by item id (seed item id, or
  // "custom-<index>"). Soft-deleted so indexes/picks stay stable.
  removed?: Record<string, boolean>;
};

// Per-step completion, keyed by step number (1-7). A step is only ever
// "complete" when the user explicitly marks it so; navigating to a step (via
// Next/Back/sidebar) marks it "in-progress", never complete. Absent = not
// started. The whole report can only be finished once every step is complete.
export type StepStatus = "in-progress" | "complete";

export type ReportState = {
  // The funder's reporting requirements, supplied by the user up front and then
  // kept visible throughout the flow so every step is framed by them.
  requirements: string;
  requirementsSet: boolean;
  step: number;
  stepStatus: Record<number, StepStatus>;
  share: Record<NSRService, boolean>;
  uploads: string[];
  chat: {
    commitment: ReportChatState;
    events: ReportChatState;
    community: ReportChatState;
    outcomes: ReportChatState;
  };
  supportingPicks: Record<string, boolean>;
  // Seed analyses the user deleted from the Analysis step, keyed by section id.
  removedAnalyses: Record<string, boolean>;
  analysisExpanded: Record<string, boolean>;
  analysisCardIndex: number;
};

export type WizardState = {
  step: number;
  share: Record<NSRService, boolean>;
  uploads: string[];
  found: Record<string, boolean>;
  rueaExpanded: Record<string, boolean>;
  // Data-analysis cards the user explicitly added on the "Analyze Your Data"
  // step, keyed by section id. When any are added, the exported pack is limited
  // to them.
  analysisAdded: Record<string, boolean>;
  // Which of the application steps the user has actually opened. Drives the
  // n/3 progress shown on the dashboard.
  visited: Record<number, boolean>;
  // The Analysis step is locked until the user unlocks it from Review.
  analysisUnlocked: boolean;
};

const emptyChat = (): ReportChatState => ({
  messages: [],
  marked: false,
  draft: "",
  picks: {},
  custom: [],
});

export function makeWizardState(): WizardState {
  return {
    step: 1,
    share: {
      [NSRService.AnnualImpactSurvey]: true,
      [NSRService.BudgetManagementSystem]: true,
      [NSRService.OrganizationalAssessmentTool]: false,
    },
    uploads: [],
    found: {},
    rueaExpanded: {},
    analysisAdded: {},
    visited: { 1: true },
    analysisUnlocked: false,
  };
}

/** Backfill a persisted wizard with fields added since it was saved. */
function hydrateWizard(w: WizardState | undefined): WizardState {
  const base = makeWizardState();
  if (!w) return base;
  return {
    ...base,
    ...w,
    share: { ...base.share, ...w.share },
    analysisAdded: w.analysisAdded ?? base.analysisAdded,
    visited: w.visited ?? base.visited,
    analysisUnlocked: w.analysisUnlocked ?? base.analysisUnlocked,
  };
}

export function makeReportState(): ReportState {
  return {
    requirements: "",
    requirementsSet: false,
    step: 1,
    stepStatus: { 1: "in-progress" },
    share: {
      [NSRService.AnnualImpactSurvey]: true,
      [NSRService.BudgetManagementSystem]: true,
      [NSRService.OrganizationalAssessmentTool]: false,
    },
    uploads: [],
    chat: {
      commitment: emptyChat(),
      events: emptyChat(),
      community: emptyChat(),
      outcomes: emptyChat(),
    },
    supportingPicks: {},
    removedAnalyses: {},
    analysisExpanded: {},
    analysisCardIndex: 0,
  };
}

/**
 * Backfill a report read out of persisted state with any fields added since it
 * was saved. Reports persisted before `stepStatus` existed have no such key, so
 * reading `report.stepStatus[n]` would throw - merging over a fresh default
 * (and deep-merging the nested objects) keeps old saves working.
 */
function hydrateReport(r: ReportState | undefined): ReportState {
  const base = makeReportState();
  if (!r) return base;
  return {
    ...base,
    ...r,
    requirements: r.requirements ?? base.requirements,
    requirementsSet: r.requirementsSet ?? base.requirementsSet,
    removedAnalyses: r.removedAnalyses ?? base.removedAnalyses,
    stepStatus: r.stepStatus ?? base.stepStatus,
    share: { ...base.share, ...r.share },
    chat: { ...base.chat, ...r.chat },
  };
}

/**
 * Where a grant sits in its lifecycle. One field rather than a spread of
 * booleans: the states are mutually exclusive, and a grant that is "submitted"
 * cannot also be "awarded". Absent = the user hasn't started anything with it
 * beyond saving it.
 *
 * This app can't submit applications or hear verdicts, so every transition
 * past `applying` is the user telling us what happened.
 */
export type GrantStatus =
  // Active - the grant is live work and shows in a working column.
  | "applying" // an application is being put together
  | "submitted" // sent to the funder; waiting on a verdict
  | "awarded" // won; the award period is running
  | "report-overdue" // a report deadline passed without one being submitted
  // Terminal - the grant is done and lives in Archived, labelled with why.
  | "reported" // the outcome report is done
  | "withdrawn" // the user pulled the application
  | "not-awarded" // the funder said no
  | "deadline-past"; // a date passed and the grant can no longer be acted on

/** Terminal statuses: the grant is finished and belongs in Archived. */
export const TERMINAL_STATUSES: GrantStatus[] = [
  "reported",
  "withdrawn",
  "not-awarded",
  "deadline-past",
];

export const isTerminalStatus = (s: GrantStatus | undefined): boolean =>
  !!s && TERMINAL_STATUSES.includes(s);

export const STATUS_LABEL: Record<GrantStatus, string> = {
  applying: "Applying",
  submitted: "Submitted",
  awarded: "Awarded",
  "report-overdue": "Report Overdue",
  reported: "Report Completed",
  withdrawn: "Withdrawn",
  "not-awarded": "Not Awarded",
  "deadline-past": "Deadline Passed",
};

/**
 * Terminal statuses that mean the grant ended without a win. Shown in red, not
 * green - filing something away is not the same as finishing it.
 */
export const UNSUCCESSFUL_STATUSES: GrantStatus[] = [
  "not-awarded",
  "deadline-past",
  "withdrawn",
];

/** The Archived filter chips, in display order. */
export const ARCHIVE_FILTERS: { key: GrantStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "deadline-past", label: "Deadline Passed" },
  { key: "withdrawn", label: "Withdrawn" },
  { key: "not-awarded", label: "Not Awarded" },
  { key: "reported", label: "Report Completed" },
];

export type Toast = { id: number; text: string };

// The save/collaborate coupling is surfaced through confirmation prompts
// rather than being locked together: saving offers to also list you as a
// collaborator, unsaving offers to also stop, and each collaborate toggle
// offers the reverse. `couplingModal` names which prompt is open (transient;
// not persisted). See CouplingModals for the UI.
export type CouplingModal = {
  type: "save" | "unsave" | "discover" | "uncollab";
  grantId: string;
} | null;

type AppState = {
  privacyAcked: boolean;
  // Set once the user picks "Yes, don't ask again" when deleting a found data
  // point in the report flow; suppresses the confirmation afterward.
  dontAskDeleteFound: boolean;

  // First-run onboarding: a user who has not finished onboarding is shown the
  // welcome + org-details flow before the dashboard.
  onboarded: boolean;
  onboardStep: number;
  onboardOrg: OnboardOrg;

  // Grant lifecycle overrides layered on top of the seed catalog. Only
  // grants the user has explicitly acted on (saved, unsaved, applied, ...)
  // appear here; everything else falls back to the seed's default stage.
  stageOverrides: Record<string, GrantLifecycleStage>;
  discoverable: Record<string, boolean>;

  // Grants the user deleted from their board. They stay in the catalog (Explore
  // still lists open ones) but never reappear on the dashboard.
  deletedGrants: Record<string, boolean>;

  // How many reports the user has filed per grant. Drives which deadline in a
  // multi-report grant's schedule is the live one.
  reportsSubmitted: Record<string, number>;

  // Where each grant sits in its lifecycle. This single field replaced the old
  // applicationStarted / awardedGrants / appliedGrants / archivedGrants
  // booleans, which could contradict each other. Absent = saved-only. Which
  // dashboard column a grant lands in is derived from this; the save bookmark
  // (`stageOverrides`) and collaborate listing (`discoverable`) stay separate,
  // since they're genuinely independent of application progress.
  grantStatus: Record<string, GrantStatus>;

  draftFilters: SearchFilters;
  appliedFilters: SearchFilters;
  sortBy: SortOption;

  wizard: Record<string, WizardState>;
  report: Record<string, ReportState>;

  couplingModal: CouplingModal;

  // Lightweight navigation history stack (transient, not persisted). The last
  // entry is the current route; the one before it is where Back goes. Revisits
  // truncate the stack back to that page, so bouncing between two pages can't
  // create a Back loop that traps the user.
  navStack: string[];
  // How many in-app navigations have happened this session. Back is only
  // offered when there is real history behind the user.
  navCount: number;

  toasts: Toast[];

  // actions
  recordNav: (path: string) => void;
  ackPrivacy: () => void;
  setDontAskDeleteFound: () => void;

  setOnboardStep: (step: number) => void;
  patchOnboardOrg: (patch: Partial<OnboardOrg>) => void;
  toggleOnboardIssue: (issue: string) => void;
  toggleOnboardArea: (area: string) => void;
  completeOnboarding: () => void;
  setStage: (grantId: string, stage: GrantLifecycleStage) => void;
  setDiscoverable: (grantId: string, on: boolean) => void;

  // Move a grant to a lifecycle status, or clear it back to saved-only. Every
  // transition is explicit: the app never infers that an application was
  // submitted or a verdict received.
  setGrantStatus: (grantId: string, status: GrantStatus) => void;
  clearGrantStatus: (grantId: string) => void;

  // Start an application: marks it in progress and saves it, so it's bookmarked.
  startApplication: (grantId: string) => void;

  // Remove an archived grant from the board for good.
  deleteGrant: (grantId: string) => void;

  // Record a filed report. `done` is true when that was the last one owed, which
  // ends the grant; otherwise it stays awarded with the next deadline live.
  submitReport: (grantId: string, done: boolean) => void;

  // Save/collaborate coupling - surfaced through prompts, not locked. Opening
  // a modal is what a Save/Unsave/collaborate control does; the confirm*
  // actions apply the choice (optionally doing the coupled action too, per the
  // checkbox the prompt offers). Saving and collaborating can therefore
  // diverge if the user opts out.
  openCouplingModal: (
    type: NonNullable<CouplingModal>["type"],
    grantId: string,
  ) => void;
  closeCouplingModal: () => void;
  confirmSave: (grantId: string, alsoDiscover: boolean) => void;
  confirmUnsave: (grantId: string, alsoStopDiscover: boolean) => void;
  confirmDiscover: (grantId: string, alsoSave: boolean) => void;
  confirmUncollab: (grantId: string, alsoUnsave: boolean) => void;

  setDraftFilters: (filters: Partial<SearchFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  setSortBy: (sortBy: SortOption) => void;

  getWizard: (grantId: string) => WizardState;
  updateWizard: (
    grantId: string,
    updater: (w: WizardState) => WizardState,
  ) => void;

  getReport: (grantId: string) => ReportState;
  updateReport: (
    grantId: string,
    updater: (r: ReportState) => ReportState,
  ) => void;

  addToast: (text: string) => void;
  removeToast: (id: number) => void;
};

let toastCounter = 0;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      privacyAcked: false,
      dontAskDeleteFound: false,
      onboarded: false,
      onboardStep: 0,
      onboardOrg: emptyOnboardOrg(),
      stageOverrides: {},
      // Seeded so the board shows a past-deadline grant in both Saved and Open
      // to Collaborate - the states the user still needs to resolve.
      discoverable: { "g-senior-mobility": true, "g-green-spaces": true },
      // g-neighborhood-health reports every 6 months and has one in already, so
      // its next deadline is the one the board should be counting down to.
      reportsSubmitted: { "g-neighborhood-health": 1 },
      deletedGrants: {},
      // One in-progress application so the board isn't empty on first run, plus
      // seeded past grants so Archived shows the range of reasons a grant lands
      // there.
      grantStatus: {
        // Active work, one per column state.
        "g-healthy-neighborhoods": "applying", // open, in progress
        "g-youth-digital-wellness": "applying", // open, in progress
        "g-green-spaces": "submitted", // awaiting a decision that isn't due yet
        "g-parks-access": "submitted", // decision date passed: needs attention
        "g-food-access": "awarded", // report not due yet
        "g-neighborhood-health": "awarded", // multi-report, next one due soon
        "g-wellness-pilot": "awarded", // final report already overdue
        // Terminal, one per archive reason.
        "g-arts-microgrant": "deadline-past",
        "g-safety-innovation": "not-awarded",
        "g-summer-youth": "reported",
        "g-civic-tech": "withdrawn",
      },
      draftFilters: DEFAULT_FILTERS,
      appliedFilters: DEFAULT_FILTERS,
      sortBy: "relevance",

      wizard: {},
      report: {},

      couplingModal: null,

      navStack: [],
      navCount: 0,

      toasts: [],

      recordNav: (path) =>
        set((state) => {
          const stack = state.navStack;
          if (stack[stack.length - 1] === path) return state;
          // `navCount` counts real in-app navigations. Back uses it only to ask
          // "is there anywhere to go back to?" - the browser's own history is
          // what decides where, so Back always lands on the page the user was
          // actually just on.
          const navCount = state.navCount + 1;
          // Revisiting a page already in the stack means the user went back to
          // it (via a Back control or the browser); truncate to that point
          // instead of pushing a duplicate.
          const existing = stack.indexOf(path);
          if (existing >= 0)
            return { navStack: stack.slice(0, existing + 1), navCount };
          return { navStack: [...stack, path], navCount };
        }),

      setDontAskDeleteFound: () => set({ dontAskDeleteFound: true }),
      ackPrivacy: () => set({ privacyAcked: true }),

      setOnboardStep: (step) => set({ onboardStep: step }),
      patchOnboardOrg: (patch) =>
        set((state) => ({ onboardOrg: { ...state.onboardOrg, ...patch } })),
      toggleOnboardIssue: (issue) =>
        set((state) => {
          const has = state.onboardOrg.issues.includes(issue);
          return {
            onboardOrg: {
              ...state.onboardOrg,
              issues: has
                ? state.onboardOrg.issues.filter((i) => i !== issue)
                : [...state.onboardOrg.issues, issue],
            },
          };
        }),
      toggleOnboardArea: (area) =>
        set((state) => {
          const has = state.onboardOrg.areas.includes(area);
          return {
            onboardOrg: {
              ...state.onboardOrg,
              areas: has
                ? state.onboardOrg.areas.filter((a) => a !== area)
                : [...state.onboardOrg.areas, area],
            },
          };
        }),
      // Finishing (or skipping) onboarding is the entry point - there's no
      // separate landing step - so it drops the user straight onto the dashboard.
      completeOnboarding: () => set({ onboarded: true }),

      setStage: (grantId, stage) =>
        set((state) => ({
          stageOverrides: { ...state.stageOverrides, [grantId]: stage },
        })),

      setDiscoverable: (grantId, on) =>
        set((state) => ({
          discoverable: { ...state.discoverable, [grantId]: on },
        })),

      setGrantStatus: (grantId, status) =>
        set((state) => ({
          grantStatus: { ...state.grantStatus, [grantId]: status },
        })),
      clearGrantStatus: (grantId) =>
        set((state) => {
          const next = { ...state.grantStatus };
          delete next[grantId];
          return { grantStatus: next };
        }),

      deleteGrant: (grantId) =>
        set((state) => ({
          deletedGrants: { ...state.deletedGrants, [grantId]: true },
        })),

      submitReport: (grantId, done) =>
        set((state) => ({
          reportsSubmitted: {
            ...state.reportsSubmitted,
            [grantId]: (state.reportsSubmitted[grantId] ?? 0) + 1,
          },
          grantStatus: {
            ...state.grantStatus,
            [grantId]: done ? "reported" : "awarded",
          },
        })),

      startApplication: (grantId) =>
        set((state) => ({
          grantStatus: { ...state.grantStatus, [grantId]: "applying" },
          // Starting an application implies the grant is saved/bookmarked.
          stageOverrides: {
            ...state.stageOverrides,
            [grantId]: GrantLifecycleStage.Saved,
          },
        })),

      openCouplingModal: (type, grantId) =>
        set({ couplingModal: { type, grantId } }),
      closeCouplingModal: () => set({ couplingModal: null }),

      confirmSave: (grantId, alsoDiscover) =>
        set((state) => ({
          stageOverrides: {
            ...state.stageOverrides,
            [grantId]: GrantLifecycleStage.Saved,
          },
          discoverable: alsoDiscover
            ? { ...state.discoverable, [grantId]: true }
            : state.discoverable,
          couplingModal: null,
        })),
      confirmUnsave: (grantId, alsoStopDiscover) =>
        set((state) => ({
          stageOverrides: {
            ...state.stageOverrides,
            [grantId]: GrantLifecycleStage.Unsaved,
          },
          discoverable: alsoStopDiscover
            ? { ...state.discoverable, [grantId]: false }
            : state.discoverable,
          couplingModal: null,
        })),
      confirmDiscover: (grantId, alsoSave) =>
        set((state) => ({
          discoverable: { ...state.discoverable, [grantId]: true },
          stageOverrides: alsoSave
            ? { ...state.stageOverrides, [grantId]: GrantLifecycleStage.Saved }
            : state.stageOverrides,
          couplingModal: null,
        })),
      confirmUncollab: (grantId, alsoUnsave) =>
        set((state) => ({
          discoverable: { ...state.discoverable, [grantId]: false },
          stageOverrides: alsoUnsave
            ? {
                ...state.stageOverrides,
                [grantId]: GrantLifecycleStage.Unsaved,
              }
            : state.stageOverrides,
          couplingModal: null,
        })),

      setDraftFilters: (filters) =>
        set((state) => ({
          draftFilters: { ...state.draftFilters, ...filters },
        })),
      applyFilters: () =>
        set((state) => ({ appliedFilters: state.draftFilters })),
      clearFilters: () =>
        set({ draftFilters: DEFAULT_FILTERS, appliedFilters: DEFAULT_FILTERS }),
      setSortBy: (sortBy) => set({ sortBy }),

      getWizard: (grantId) => hydrateWizard(get().wizard[grantId]),
      updateWizard: (grantId, updater) =>
        set((state) => ({
          wizard: {
            ...state.wizard,
            [grantId]: updater(hydrateWizard(state.wizard[grantId])),
          },
        })),

      getReport: (grantId) => hydrateReport(get().report[grantId]),
      updateReport: (grantId, updater) =>
        set((state) => ({
          report: {
            ...state.report,
            [grantId]: updater(hydrateReport(state.report[grantId])),
          },
        })),

      addToast: (text) => {
        const id = ++toastCounter;
        set((state) => ({ toasts: [...state.toasts, { id, text }] }));
        setTimeout(() => get().removeToast(id), 2800);
      },
      removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "vibrant-grants-store",

      // localStorage does not exist on the server. Without this, zustand would
      // rehydrate during module init on the client and the very first client
      // render would disagree with the server-rendered HTML (e.g. onboarded:
      // true vs false), which React reports as a hydration mismatch. Deferring
      // rehydration to <StoreHydrator/> keeps that first render identical to
      // the server's; the persisted state then lands as an ordinary update.
      skipHydration: true,

      // Backfill nested objects that gained fields since a state was persisted.
      // The default merge is a shallow spread, so a saved `onboardOrg` from
      // before `person` existed would land without it and crash `.person.trim()`
      // on first render. Deep-merge it over the empty default to stay safe.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...p,
          onboardOrg: { ...emptyOnboardOrg(), ...(p.onboardOrg ?? {}) },
        };
      },

      partialize: (state) => ({
        privacyAcked: state.privacyAcked,
        dontAskDeleteFound: state.dontAskDeleteFound,
        onboarded: state.onboarded,
        onboardStep: state.onboardStep,
        onboardOrg: state.onboardOrg,
        stageOverrides: state.stageOverrides,
        discoverable: state.discoverable,
        grantStatus: state.grantStatus,
        reportsSubmitted: state.reportsSubmitted,
        deletedGrants: state.deletedGrants,
        wizard: state.wizard,
        report: state.report,
      }),
    },
  ),
);
