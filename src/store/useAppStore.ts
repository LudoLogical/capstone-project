import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GrantLifecycleStage } from "@/types/grantRecord";
import type { Issue } from "@/types/constants";
import type { SearchFilters, SortOption } from "@/data/selectors";
import { DEFAULT_FILTERS } from "@/data/selectors";

export type OnboardOrg = {
  name: string;
  issues: Issue[];
  areas: string[];
};

const emptyOnboardOrg = (): OnboardOrg => ({ name: "", issues: [], areas: [] });

export type ChatMessage = { from: "user" | "ai"; text: string };

export type ReportChatState = {
  messages: ChatMessage[];
  marked: boolean;
  picks: Record<string, boolean>;
};

// Per-step completion, keyed by step number (1-7). A step is only ever
// "complete" when the user explicitly marks it so; navigating to a step (via
// Next/Back/sidebar) marks it "in-progress", never complete. Absent = not
// started. The whole report can only be finished once every step is complete.
export type StepStatus = "in-progress" | "complete";

export type ReportState = {
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
  analysisExpanded: Record<string, boolean>;
  analysisCardIndex: number;
};

export type WizardState = {
  step: number;
  share: { surveys: boolean; budget: boolean; orgAssess: boolean };
  uploads: string[];
  found: Record<string, boolean>;
  rueaExpanded: Record<string, boolean>;
};

const emptyChat = (): ReportChatState => ({
  messages: [],
  marked: false,
  picks: {},
});

export function makeWizardState(): WizardState {
  return {
    step: 1,
    share: { surveys: true, budget: true, orgAssess: false },
    uploads: [],
    found: {},
    rueaExpanded: {},
  };
}

export function makeReportState(): ReportState {
  return {
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
    analysisExpanded: {},
    analysisCardIndex: 0,
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

  toasts: Toast[];

  // actions
  signIn: () => void;
  ackPrivacy: () => void;

  setOnboardStep: (step: number) => void;
  patchOnboardOrg: (patch: Partial<OnboardOrg>) => void;
  toggleOnboardIssue: (issue: Issue) => void;
  toggleOnboardArea: (area: string) => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
  setStage: (grantId: string, stage: GrantLifecycleStage) => void;
  toggleDiscoverable: (grantId: string) => void;
  setDiscoverable: (grantId: string, on: boolean) => void;

  // Save/collaborate coupling — surfaced through prompts, not locked. Opening
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
      onboarded: false,
      onboardStep: 0,
      onboardOrg: emptyOnboardOrg(),
      stageOverrides: {},
      discoverable: {},

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

      toasts: [],

      signIn: () => set({ signedIn: true }),
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
      completeOnboarding: () => set({ onboarded: true, onboardStep: 0 }),
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

      getWizard: (grantId) => get().wizard[grantId] ?? makeWizardState(),
      updateWizard: (grantId, updater) =>
        set((state) => ({
          wizard: {
            ...state.wizard,
            [grantId]: updater(state.wizard[grantId] ?? makeWizardState()),
          },
        })),

      getReport: (grantId) => get().report[grantId] ?? makeReportState(),
      updateReport: (grantId, updater) =>
        set((state) => ({
          report: {
            ...state.report,
            [grantId]: updater(state.report[grantId] ?? makeReportState()),
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

      partialize: (state) => ({
        signedIn: state.signedIn,
        privacyAcked: state.privacyAcked,
        onboarded: state.onboarded,
        onboardStep: state.onboardStep,
        onboardOrg: state.onboardOrg,
        stageOverrides: state.stageOverrides,
        discoverable: state.discoverable,
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
