import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GrantLifecycleStage } from "@types-domain/grantRecord";
import type { SearchFilters, SortOption } from "@/data/selectors";
import { DEFAULT_FILTERS } from "@/data/selectors";

export type ChatMessage = { from: "user" | "ai"; text: string };

export type ReportChatState = {
  messages: ChatMessage[];
  marked: boolean;
  picks: Record<string, boolean>;
};

export type ReportState = {
  step: number;
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

const emptyChat = (): ReportChatState => ({ messages: [], marked: false, picks: {} });

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

type AppState = {
  signedIn: boolean;
  privacyAcked: boolean;

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

  toasts: Toast[];

  // actions
  signIn: () => void;
  ackPrivacy: () => void;
  setStage: (grantId: string, stage: GrantLifecycleStage) => void;
  toggleDiscoverable: (grantId: string) => void;

  setDraftFilters: (filters: Partial<SearchFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  setSortBy: (sortBy: SortOption) => void;
  setRelevanceMode: (on: boolean) => void;

  getWizard: (grantId: string) => WizardState;
  updateWizard: (grantId: string, updater: (w: WizardState) => WizardState) => void;

  getReport: (grantId: string) => ReportState;
  updateReport: (grantId: string, updater: (r: ReportState) => ReportState) => void;

  toggleCollabPick: (grantId: string, initiativeId: string, cap: number) => void;
  sendCollabRequest: (grantId: string) => void;
  toggleCollabSort: (grantId: string) => void;
  requestContact: (initiativeId: string) => void;

  setAccountEdit: (factId: string, body: string | null) => void;
  toggleAccountSection: (sectionId: string) => void;

  addToast: (text: string) => void;
  removeToast: (id: number) => void;
};

let toastCounter = 0;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      signedIn: false,
      privacyAcked: false,
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

      toasts: [],

      signIn: () => set({ signedIn: true }),
      ackPrivacy: () => set({ privacyAcked: true }),

      setStage: (grantId, stage) =>
        set((state) => ({ stageOverrides: { ...state.stageOverrides, [grantId]: stage } })),

      toggleDiscoverable: (grantId) =>
        set((state) => ({
          discoverable: { ...state.discoverable, [grantId]: !state.discoverable[grantId] },
        })),

      setDraftFilters: (filters) =>
        set((state) => ({ draftFilters: { ...state.draftFilters, ...filters } })),
      applyFilters: () => set((state) => ({ appliedFilters: state.draftFilters })),
      clearFilters: () => set({ draftFilters: DEFAULT_FILTERS, appliedFilters: DEFAULT_FILTERS }),
      setSortBy: (sortBy) => set({ sortBy }),
      setRelevanceMode: (on) => set({ relevanceMode: on }),

      getWizard: (grantId) => get().wizard[grantId] ?? makeWizardState(),
      updateWizard: (grantId, updater) =>
        set((state) => ({
          wizard: { ...state.wizard, [grantId]: updater(state.wizard[grantId] ?? makeWizardState()) },
        })),

      getReport: (grantId) => get().report[grantId] ?? makeReportState(),
      updateReport: (grantId, updater) =>
        set((state) => ({
          report: { ...state.report, [grantId]: updater(state.report[grantId] ?? makeReportState()) },
        })),

      toggleCollabPick: (grantId, initiativeId, cap) =>
        set((state) => {
          const current = state.collabPicks[grantId] ?? [];
          const has = current.includes(initiativeId);
          if (!has && current.length >= cap) {
            return state;
          }
          const next = has ? current.filter((id) => id !== initiativeId) : [...current, initiativeId];
          return { collabPicks: { ...state.collabPicks, [grantId]: next } };
        }),

      sendCollabRequest: (grantId) =>
        set((state) => ({ collabSent: { ...state.collabSent, [grantId]: true } })),

      toggleCollabSort: (grantId) =>
        set((state) => ({ collabSorted: { ...state.collabSorted, [grantId]: !state.collabSorted[grantId] } })),

      requestContact: (initiativeId) =>
        set((state) => ({ contactRequested: { ...state.contactRequested, [initiativeId]: true } })),

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
          accountExpanded: { ...state.accountExpanded, [sectionId]: !state.accountExpanded[sectionId] },
        })),

      addToast: (text) => {
        const id = ++toastCounter;
        set((state) => ({ toasts: [...state.toasts, { id, text }] }));
        setTimeout(() => get().removeToast(id), 2800);
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "vibrancy-portal-store",
      partialize: (state) => ({
        signedIn: state.signedIn,
        privacyAcked: state.privacyAcked,
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
      }),
    },
  ),
);
