import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GrantLifecycleStage } from "@/types/grantRecord";
import type { SearchFilters, SortOption } from "@/data/selectors";
import { DEFAULT_FILTERS } from "@/data/selectors";

export type OnboardOrg = {
  // The person filling this out - their name greets them across the portal.
  person: string;
  name: string;
  // Issue and service-area tags, drawn from the same lists as the Explore
  // search filter (ISSUE_TAGS / LOCATION_OPTIONS), so they're plain strings.
  issues: string[];
  areas: string[];
};

const emptyOnboardOrg = (): OnboardOrg => ({
  person: "",
  name: "",
  issues: [],
  areas: [],
});

export type ChatMessage = { from: "user" | "ai"; text: string };

export type ReportChatState = {
  messages: ChatMessage[];
  marked: boolean;
  picks: Record<string, boolean>;
  // Entries the user typed in themselves (or that were surfaced from an attached
  // file). They join the "Here's what I found" list as extra, pre-selected items
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
  share: { surveys: boolean; budget: boolean; orgAssess: boolean };
  uploads: string[];
  chat: {
    commitment: ReportChatState;
    events: ReportChatState;
    community: ReportChatState;
    outcomes: ReportChatState;
  };
  supportingPicks: Record<string, boolean>;
  // Extra data points the user typed in themselves on the supporting-data step.
  // Always treated as included.
  customSupporting: string[];
  // Seed analyses the user deleted from the Analysis step, keyed by section id.
  removedAnalyses: Record<string, boolean>;
  analysisExpanded: Record<string, boolean>;
  analysisCardIndex: number;
};

export type WizardState = {
  step: number;
  share: { surveys: boolean; budget: boolean; orgAssess: boolean };
  uploads: string[];
  found: Record<string, boolean>;
  // Extra data points the user typed in themselves on the "supporting data we
  // found" step. Always treated as selected.
  customFound: string[];
  rueaExpanded: Record<string, boolean>;
  // Data-analysis cards the user explicitly added on the "Analyze Your Data"
  // step (keyed by section id, or "custom:<text>"). When any are added, the
  // exported pack is limited to them.
  analysisAdded: Record<string, boolean>;
  // Which of the 4 application steps the user has actually opened. Drives the
  // n/4 progress shown on the dashboard.
  visited: Record<number, boolean>;
};

const emptyChat = (): ReportChatState => ({
  messages: [],
  marked: false,
  picks: {},
  custom: [],
});

export function makeWizardState(): WizardState {
  return {
    step: 1,
    share: { surveys: true, budget: true, orgAssess: false },
    uploads: [],
    found: {},
    customFound: [],
    rueaExpanded: {},
    analysisAdded: {},
    visited: { 1: true },
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
    customFound: w.customFound ?? base.customFound,
    analysisAdded: w.analysisAdded ?? base.analysisAdded,
    visited: w.visited ?? base.visited,
  };
}

export function makeReportState(): ReportState {
  return {
    requirements: "",
    requirementsSet: false,
    step: 1,
    stepStatus: { 1: "in-progress" },
    share: { surveys: true, budget: true, orgAssess: false },
    uploads: [],
    chat: {
      commitment: emptyChat(),
      events: emptyChat(),
      community: emptyChat(),
      outcomes: emptyChat(),
    },
    supportingPicks: {},
    customSupporting: [],
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
  signedIn: boolean;
  privacyAcked: boolean;
  // Set once the user picks "Yes, don't ask again" when deleting a found data
  // point in the report flow; suppresses the confirmation afterward.
  dontAskDeleteFound: boolean;

  // First-run onboarding: a signed-in user who has not finished onboarding is
  // shown the welcome + org-details flow before the dashboard.
  onboarded: boolean;
  onboardStep: number;
  onboardOrg: OnboardOrg;

  // Grant lifecycle overrides layered on top of the seed catalog. Only
  // grants the user has explicitly acted on (saved, unsaved, applied, ...)
  // appear here; everything else falls back to the seed's default stage.
  stageOverrides: Record<string, GrantLifecycleStage>;
  discoverable: Record<string, boolean>;

  // Grants the user has explicitly started an application for. This is what
  // moves a grant from "Saved Grants" into "Grant Applications" on the
  // dashboard; saving alone never does. One grant is seeded as an in-progress
  // application so the column isn't empty on first run.
  applicationStarted: Record<string, boolean>;

  // Grants the user has marked as awarded ("we won this"). Moves the grant into
  // the reports column, on top of any grants seeded as awarded.
  awardedGrants: Record<string, boolean>;

  draftFilters: SearchFilters;
  appliedFilters: SearchFilters;
  sortBy: SortOption;
  relevanceMode: boolean;

  wizard: Record<string, WizardState>;
  report: Record<string, ReportState>;
  collabPicks: Record<string, string[]>;
  collabSent: Record<string, boolean>;
  collabSorted: Record<string, boolean>;
  contactRequested: Record<string, boolean>;

  accountEdits: Record<string, string>;
  accountExpanded: Record<string, boolean>;

  // Vibrancy Portal data forms the user has filled out, keyed by data-detail
  // key (e.g. "orgAssess"). Presence of an entry means the form is completed;
  // the map holds the submitted field values so the summary view can show them.
  // Submitted from a separate browser tab, so this is synced across tabs via
  // the storage event in StoreHydrator.
  dataForms: Record<string, Record<string, string>>;

  couplingModal: CouplingModal;

  // Lightweight navigation history stack (transient, not persisted). The last
  // entry is the current route; the one before it is where Back goes. Revisits
  // truncate the stack back to that page, so bouncing between two pages can't
  // create a Back loop that traps the user.
  navStack: string[];

  toasts: Toast[];

  // actions
  recordNav: (path: string) => void;
  signIn: () => void;
  ackPrivacy: () => void;
  setDontAskDeleteFound: () => void;

  setOnboardStep: (step: number) => void;
  patchOnboardOrg: (patch: Partial<OnboardOrg>) => void;
  toggleOnboardIssue: (issue: string) => void;
  toggleOnboardArea: (area: string) => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
  setStage: (grantId: string, stage: GrantLifecycleStage) => void;
  toggleDiscoverable: (grantId: string) => void;
  setDiscoverable: (grantId: string, on: boolean) => void;

  // Mark a grant as an application in progress (and save it, so it's
  // bookmarked). Moves it into the Grant Applications column.
  startApplication: (grantId: string) => void;

  // Mark / unmark a grant as awarded. Moves it into / out of the reports column.
  setAwarded: (grantId: string, won: boolean) => void;

  // Save/collaborate coupling - surfaced through prompts, not locked. Opening
  // a modal is what a Save/Unsave/collaborate control does; the confirm*
  // actions apply the choice (optionally doing the coupled action too, per the
  // checkbox the prompt offers). Saving and collaborating can therefore
  // diverge if the user opts out.
  openCouplingModal: (type: NonNullable<CouplingModal>["type"], grantId: string) => void;
  closeCouplingModal: () => void;
  confirmSave: (grantId: string, alsoDiscover: boolean) => void;
  confirmUnsave: (grantId: string, alsoStopDiscover: boolean) => void;
  confirmDiscover: (grantId: string, alsoSave: boolean) => void;
  confirmUncollab: (grantId: string, alsoUnsave: boolean) => void;

  setDraftFilters: (filters: Partial<SearchFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  setSortBy: (sortBy: SortOption) => void;
  setRelevanceMode: (on: boolean) => void;

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

  toggleCollabPick: (
    grantId: string,
    initiativeId: string,
    cap: number,
  ) => void;
  sendCollabRequest: (grantId: string) => void;
  toggleCollabSort: (grantId: string) => void;
  requestContact: (initiativeId: string) => void;

  setAccountEdit: (factId: string, body: string | null) => void;
  toggleAccountSection: (sectionId: string) => void;

  submitDataForm: (key: string, values: Record<string, string>) => void;

  addToast: (text: string) => void;
  removeToast: (id: number) => void;
};

let toastCounter = 0;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      signedIn: false,
      privacyAcked: false,
      dontAskDeleteFound: false,
      onboarded: false,
      onboardStep: 0,
      onboardOrg: emptyOnboardOrg(),
      stageOverrides: {},
      discoverable: {},
      applicationStarted: { "g-healthy-neighborhoods": true },
      awardedGrants: {},

      draftFilters: DEFAULT_FILTERS,
      appliedFilters: DEFAULT_FILTERS,
      sortBy: "relevance",
      relevanceMode: false,

      wizard: {},
      report: {},
      collabPicks: {},
      collabSent: {},
      collabSorted: {},
      contactRequested: {},

      accountEdits: {},
      accountExpanded: {},

      dataForms: {},

      couplingModal: null,

      navStack: [],

      toasts: [],

      recordNav: (path) =>
        set((state) => {
          const stack = state.navStack;
          if (stack[stack.length - 1] === path) return state;
          // Revisiting a page already in the stack means the user went back to
          // it (via a Back control or the browser); truncate to that point
          // instead of pushing a duplicate, which keeps Back moving strictly
          // outward and prevents A→B→A→B loops.
          const existing = stack.indexOf(path);
          if (existing >= 0) return { navStack: stack.slice(0, existing + 1) };
          return { navStack: [...stack, path] };
        }),

      signIn: () => set({ signedIn: true }),
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
      // Finishing (or skipping) onboarding is now the entry point - there's no
      // separate landing/sign-in step - so it also signs the user in.
      completeOnboarding: () =>
        set({ onboarded: true, onboardStep: 0, signedIn: true }),
      restartOnboarding: () => set({ onboarded: false, onboardStep: 0 }),

      setStage: (grantId, stage) =>
        set((state) => ({
          stageOverrides: { ...state.stageOverrides, [grantId]: stage },
        })),

      toggleDiscoverable: (grantId) =>
        set((state) => ({
          discoverable: {
            ...state.discoverable,
            [grantId]: !state.discoverable[grantId],
          },
        })),
      setDiscoverable: (grantId, on) =>
        set((state) => ({
          discoverable: { ...state.discoverable, [grantId]: on },
        })),

      startApplication: (grantId) =>
        set((state) => ({
          applicationStarted: {
            ...state.applicationStarted,
            [grantId]: true,
          },
          // Starting an application implies the grant is saved/bookmarked.
          stageOverrides: {
            ...state.stageOverrides,
            [grantId]: GrantLifecycleStage.Saved,
          },
        })),

      setAwarded: (grantId, won) =>
        set((state) => ({
          awardedGrants: { ...state.awardedGrants, [grantId]: won },
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
      setRelevanceMode: (on) => set({ relevanceMode: on }),

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

      toggleCollabPick: (grantId, initiativeId, cap) =>
        set((state) => {
          const current = state.collabPicks[grantId] ?? [];
          const has = current.includes(initiativeId);
          if (!has && current.length >= cap) {
            return state;
          }
          const next = has
            ? current.filter((id) => id !== initiativeId)
            : [...current, initiativeId];
          return { collabPicks: { ...state.collabPicks, [grantId]: next } };
        }),

      sendCollabRequest: (grantId) =>
        set((state) => ({
          collabSent: { ...state.collabSent, [grantId]: true },
        })),

      toggleCollabSort: (grantId) =>
        set((state) => ({
          collabSorted: {
            ...state.collabSorted,
            [grantId]: !state.collabSorted[grantId],
          },
        })),

      requestContact: (initiativeId) =>
        set((state) => ({
          contactRequested: { ...state.contactRequested, [initiativeId]: true },
        })),

      setAccountEdit: (factId, body) =>
        set((state) => {
          const next = { ...state.accountEdits };
          if (body === null) {
            delete next[factId];
          } else {
            next[factId] = body;
          }
          return { accountEdits: next };
        }),

      toggleAccountSection: (sectionId) =>
        set((state) => ({
          accountExpanded: {
            ...state.accountExpanded,
            [sectionId]: !state.accountExpanded[sectionId],
          },
        })),

      submitDataForm: (key, values) =>
        set((state) => ({
          dataForms: { ...state.dataForms, [key]: values },
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
      name: "vibrancy-portal-store",

      // localStorage does not exist on the server. Without this, zustand would
      // rehydrate during module init on the client and the very first client
      // render would disagree with the server-rendered HTML (signedIn: true vs
      // false), which React reports as a hydration mismatch. Deferring
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
        signedIn: state.signedIn,
        privacyAcked: state.privacyAcked,
        dontAskDeleteFound: state.dontAskDeleteFound,
        onboarded: state.onboarded,
        onboardStep: state.onboardStep,
        onboardOrg: state.onboardOrg,
        stageOverrides: state.stageOverrides,
        discoverable: state.discoverable,
        applicationStarted: state.applicationStarted,
        awardedGrants: state.awardedGrants,
        wizard: state.wizard,
        report: state.report,
        collabPicks: state.collabPicks,
        collabSent: state.collabSent,
        collabSorted: state.collabSorted,
        contactRequested: state.contactRequested,
        accountEdits: state.accountEdits,
        accountExpanded: state.accountExpanded,
        dataForms: state.dataForms,
      }),
    },
  ),
);
