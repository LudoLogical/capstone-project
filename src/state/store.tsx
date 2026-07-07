import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Issue } from "../../types/constants";
import { GrantLifecycleStage } from "../../types/grantRecord";
import { GRANTS, currentOrg, GRANT_DISPLAY, type GrantKey } from "../data";

export type Page =
  | "onboarding"
  | "dashboard"
  | "explore"
  | "grantDetail"
  | "collect"
  | "collab"
  | "orgProfile"
  | "reportSelect"
  | "flow"
  | "brief"
  | "profile"
  | "track";

export type FlowMode = "write" | "report";

export type Modal =
  | { kind: "save"; grantId: string }
  | { kind: "unsave"; grantId: string }
  | { kind: "disc"; grantId: string }
  | { kind: "share"; grantId: string }
  | { kind: "aiInfo" }
  | { kind: "email"; orgId: string; grantId: string }
  | { kind: "sourceInfo"; title: string; detail: string; origin: string };

export type TrackMetric = {
  id: string;
  label: string;
  unit: string;
  target: number;
  current: number;
  why: string;
  source: string;
  included: boolean;
  recent: { text: string; when: string }[];
};

export type TrackStory = { id: string; text: string; when: string };

export type TrackState = {
  accepted: boolean;
  metrics: TrackMetric[];
  stories: TrackStory[];
};

type Nav = { grantId?: string; orgId?: string; flowMode?: FlowMode; fromGrantId?: string };

type StoreValue = {
  page: Page;
  nav: Nav;
  modal: Modal | null;

  // lifecycle
  stages: Record<string, GrantLifecycleStage>;
  discoverable: Set<string>;

  // onboarding
  onboardStep: number;
  orgName: string;
  onboardIssues: Set<Issue>;
  onboardAreas: Set<string>;

  // explore
  exploreIssues: Set<Issue>;
  orgTypeFilters: Set<string>;
  locationFilters: Set<string>;
  sortBy: string;

  // per-grant working state
  tracking: Record<string, TrackState>;
  answers: Record<string, Record<number, string>>;

  // actions
  go: (page: Page, nav?: Nav) => void;
  setModal: (m: Modal | null) => void;

  isSaved: (grantId: string) => boolean;
  stageOf: (grantId: string) => GrantLifecycleStage;
  saveGrant: (grantId: string) => void;
  unsaveGrant: (grantId: string, alsoRemoveDisc: boolean) => void;
  setStage: (grantId: string, stage: GrantLifecycleStage) => void;

  isDiscoverable: (grantId: string) => boolean;
  setDiscoverable: (grantId: string, on: boolean) => void;

  toggleOnboardIssue: (i: Issue) => void;
  toggleOnboardArea: (a: string) => void;
  setOrgName: (v: string) => void;
  setOnboardStep: (n: number) => void;

  toggleExploreIssue: (i: Issue) => void;
  toggleOrgType: (t: string) => void;
  toggleLocation: (l: string) => void;
  clearExploreFilters: () => void;
  setSortBy: (s: string) => void;

  ensureTracking: (grantId: string) => TrackState;
  updateTracking: (grantId: string, fn: (t: TrackState) => TrackState) => void;

  getAnswer: (grantId: string, q: number) => string;
  setAnswer: (grantId: string, q: number, v: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function seedStages(): Record<string, GrantLifecycleStage> {
  const out: Record<string, GrantLifecycleStage> = {};
  for (const rec of currentOrg.grantRecords.values()) {
    out[rec.grant.id] = rec.stage;
  }
  return out;
}

function seedTracking(): Record<string, TrackState> {
  const g = GRANTS.pghFoundationVibrancy;
  return {
    [g.id]: {
      accepted: true,
      metrics: [
        {
          id: "m1",
          label: "Volunteer hours",
          unit: "hours",
          target: 300,
          current: 312,
          why: "Your award letter names community leadership as the headline outcome.",
          source: "Volunteer Hours 2024-2025 (uploaded)",
          included: true,
          recent: [{ text: "+46 hrs · Spring work day", when: "Mar 1" }],
        },
        {
          id: "m2",
          label: "Vacant lots reclaimed",
          unit: "lots",
          target: 3,
          current: 3,
          why: "The primary greening output the funder expects to see.",
          source: "Programs · organization profile",
          included: true,
          recent: [{ text: "Lot #3 opened for planting", when: "May 12" }],
        },
        {
          id: "m3",
          label: "Weekly market attendance",
          unit: "avg visitors",
          target: 120,
          current: 142,
          why: "Shows the vibrancy investment is drawing residents in.",
          source: "Spring 2025 Market Sign-in Sheets",
          included: true,
          recent: [{ text: "142 avg · spring season", when: "Jun 2" }],
        },
        {
          id: "m4",
          label: "Public celebrations hosted",
          unit: "events",
          target: 1,
          current: 0,
          why: "The award requires one public open house or celebration.",
          source: "Award requirement · The Pittsburgh Foundation",
          included: true,
          recent: [],
        },
      ],
      stories: [
        {
          id: "s1",
          text: "A neighbor who used the empty lot as a dumping ground now runs our compost station.",
          when: "Apr 20",
        },
      ],
    },
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>("onboarding");
  const [nav, setNav] = useState<Nav>({});
  const [modal, setModal] = useState<Modal | null>(null);

  const [stages, setStages] = useState<Record<string, GrantLifecycleStage>>(seedStages);
  const [discoverable, setDiscoverable] = useState<Set<string>>(
    () => new Set([GRANTS.heinzFreshFood.id]),
  );

  const [onboardStep, setOnboardStep] = useState(0);
  const [orgName, setOrgName] = useState("");
  const [onboardIssues, setOnboardIssues] = useState<Set<Issue>>(new Set());
  const [onboardAreas, setOnboardAreas] = useState<Set<string>>(new Set());

  const [exploreIssues, setExploreIssues] = useState<Set<Issue>>(new Set());
  const [orgTypeFilters, setOrgTypeFilters] = useState<Set<string>>(
    () => new Set(["fiscally-sponsored"]),
  );
  const [locationFilters, setLocationFilters] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("Best fit");

  const [tracking, setTracking] = useState<Record<string, TrackState>>(seedTracking);
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});

  const value = useMemo<StoreValue>(() => {
    const isSavedStage = (s: GrantLifecycleStage) =>
      s !== GrantLifecycleStage.NotSaved &&
      s !== GrantLifecycleStage.Unsaved &&
      s !== GrantLifecycleStage.ConfirmedNotApplied;

    const toggleIn = <T,>(
      setter: React.Dispatch<React.SetStateAction<Set<T>>>,
      item: T,
    ) =>
      setter((prev) => {
        const next = new Set(prev);
        next.has(item) ? next.delete(item) : next.add(item);
        return next;
      });

    return {
      page,
      nav,
      modal,
      stages,
      discoverable,
      onboardStep,
      orgName,
      onboardIssues,
      onboardAreas,
      exploreIssues,
      orgTypeFilters,
      locationFilters,
      sortBy,
      tracking,
      answers,

      go: (p, n = {}) => {
        setPage(p);
        setNav(n);
        if (typeof window !== "undefined") window.scrollTo(0, 0);
      },
      setModal,

      isSaved: (id) => isSavedStage(stages[id] ?? GrantLifecycleStage.NotSaved),
      stageOf: (id) => stages[id] ?? GrantLifecycleStage.NotSaved,
      saveGrant: (id) =>
        setStages((prev) => ({ ...prev, [id]: GrantLifecycleStage.Saved })),
      unsaveGrant: (id, alsoRemoveDisc) => {
        setStages((prev) => ({ ...prev, [id]: GrantLifecycleStage.Unsaved }));
        if (alsoRemoveDisc)
          setDiscoverable((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
      },
      setStage: (id, stage) => setStages((prev) => ({ ...prev, [id]: stage })),

      isDiscoverable: (id) => discoverable.has(id),
      setDiscoverable: (id, on) =>
        setDiscoverable((prev) => {
          const next = new Set(prev);
          on ? next.add(id) : next.delete(id);
          return next;
        }),

      toggleOnboardIssue: (i) => toggleIn(setOnboardIssues, i),
      toggleOnboardArea: (a) => toggleIn(setOnboardAreas, a),
      setOrgName,
      setOnboardStep,

      toggleExploreIssue: (i) => toggleIn(setExploreIssues, i),
      toggleOrgType: (t) => toggleIn(setOrgTypeFilters, t),
      toggleLocation: (l) => toggleIn(setLocationFilters, l),
      clearExploreFilters: () => {
        setExploreIssues(new Set());
        setLocationFilters(new Set());
      },
      setSortBy,

      ensureTracking: (id) => {
        if (tracking[id]) return tracking[id];
        const fresh = defaultPlan(id);
        setTracking((prev) => ({ ...prev, [id]: fresh }));
        return fresh;
      },
      updateTracking: (id, fn) =>
        setTracking((prev) => ({ ...prev, [id]: fn(prev[id] ?? defaultPlan(id)) })),

      getAnswer: (id, q) => answers[id]?.[q] ?? "",
      setAnswer: (id, q, v) =>
        setAnswers((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}), [q]: v } })),
    };
  }, [
    page,
    nav,
    modal,
    stages,
    discoverable,
    onboardStep,
    orgName,
    onboardIssues,
    onboardAreas,
    exploreIssues,
    orgTypeFilters,
    locationFilters,
    sortBy,
    tracking,
    answers,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function defaultPlan(grantId: string): TrackState {
  const key = (Object.keys(GRANTS) as GrantKey[]).find((k) => GRANTS[k].id === grantId);
  const name = key ? GRANT_DISPLAY[key].name : "this grant";
  return {
    accepted: false,
    metrics: [
      {
        id: "d1",
        label: "Households reached",
        unit: "households",
        target: 200,
        current: 0,
        why: `A core outcome funders expect from ${name}.`,
        source: "Suggested from this funder's past requirements",
        included: true,
        recent: [],
      },
      {
        id: "d2",
        label: "Volunteer hours",
        unit: "hours",
        target: 250,
        current: 0,
        why: "Evidence of community ownership.",
        source: "Suggested from your commitment",
        included: true,
        recent: [],
      },
      {
        id: "d3",
        label: "Pounds of fresh produce distributed",
        unit: "lbs",
        target: 4000,
        current: 0,
        why: "Ties spending directly to a tangible output.",
        source: "Suggested from this funder's past requirements",
        included: true,
        recent: [],
      },
    ],
    stories: [],
  };
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within AppProvider");
  return ctx;
}
