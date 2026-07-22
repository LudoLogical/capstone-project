import type { DatumAnalysis } from "@/types/analysis";
import type { RueaBar } from "@/components/analysis/StatBars";
import { VisualizationMethod } from "@/types/data";
import {
  DATUM_COMMIT_WALKING_GROUPS,
  DATUM_COMMIT_SCREENING,
  DATUM_WALKING_SESSIONS,
  DATUM_NUTRITION_WORKSHOPS,
  DATUM_SCREENING_SESSIONS,
  DATUM_NEIGHBORHOODS_SERVED,
  SRC_USER_CHAT,
} from "./datum";

// Content for the 4 chat-style Q&A steps of the Repository Report Flow.
// Each step asks one question every funder asks about an awarded grant, and
// offers AI-prefilled checklist items pulled from the org's application or
// uploaded data.
export type ReportQuestionItem = {
  id: string;
  label: string;
  source: string;
  // The RUEA analysis (by section id) this data point drives. The Analysis step
  // only shows cards whose data point is still selected in Review.
  analysisId?: string;
};

export type ReportQuestionStep = {
  id: "commitment" | "events" | "community" | "outcomes";
  index: number;
  topic: string;
  question: string;
  items: ReportQuestionItem[];
  // Short starter prompts shown above the chat input. Clicking one drops it into
  // the message box for the user to finish in their own words.
  suggestions: string[];
};

/**
 * Analysis for the data points that have no RUEA section behind them. Keyed by
 * the item id, which is also the persisted selection key - the numeric
 * `Datum.id` lives inside the analysis rather than being used as a key.
 */
export const POINT_ANALYSES: Record<string, DatumAnalysis> = {
  c1: {
    datum: DATUM_COMMIT_WALKING_GROUPS,
    relevance: null,
    result: {
      understand: [
        "You promised a standing weekly presence on four specific blocks, not a one-off event series.",
        "Reviewers read 'weekly' as a staffing and consistency commitment, so it's the bar you'll be measured against.",
      ],
      apply: [
        "State the commitment first, then your delivered session count, so the promise and the proof sit together.",
        "Name the four blocks - specificity signals you know your service area.",
      ],
    },
  },
  c3: {
    datum: DATUM_COMMIT_SCREENING,
    relevance: null,
    result: {
      understand: [
        "You committed to screening at roughly half your walking-group sessions, tying a clinical touchpoint to a social one.",
        "This is what turns a walking program into a health intervention in a reviewer's eyes.",
      ],
      apply: [
        "Pair this with your screening session count to show you held the cadence.",
        "If you fell short, say so plainly and explain what you learned - funders read candor as maturity.",
      ],
    },
  },
  e1: {
    datum: DATUM_WALKING_SESSIONS,
    relevance: null,
    result: {
      understand: [
        "You held a walking group roughly four times a month across the year.",
        "Against the weekly cadence you committed to (52), 42 sessions is about 81% delivery.",
      ],
      apply: [
        "Lead with the 42 sessions, then account for the gap - an unexplained shortfall reads worse than an explained one.",
      ],
    },
  },
  e2: {
    datum: DATUM_NUTRITION_WORKSHOPS,
    relevance: null,
    result: {
      understand: [
        "You delivered exactly the monthly cadence you committed to: 12 workshops, one per month.",
        "Hitting a commitment exactly is the cleanest evidence of reliable delivery.",
      ],
      apply: [
        "Say 'we committed to monthly workshops and delivered 12' - matching promise to result in one sentence is the strongest form.",
      ],
    },
  },
  e3: {
    datum: DATUM_SCREENING_SESSIONS,
    relevance: null,
    result: {
      understand: [
        "You screened at 18 sessions, against a commitment of every other walking group (about 21 of your 42).",
        "That's most of the cadence you promised, with a small shortfall.",
      ],
      apply: [
        "Report the 18 alongside your 42 walking groups so the reader can see the ratio you actually achieved.",
      ],
    },
  },
  m2: {
    datum: DATUM_NEIGHBORHOODS_SERVED,
    relevance: null,
    result: {
      understand: [
        "Your reach concentrated in four Hilltop neighborhoods rather than spreading thin across the county.",
        "Depth in a defined service area is usually a strength, not a limitation.",
      ],
      apply: [
        "Name the neighborhoods and tie them to the need data - it shows you served where the gap is widest.",
      ],
    },
  },
};

/**
 * Comparison bars for the points that have a real comparison to draw: a
 * committed cadence against what was delivered. That relationship is neither a
 * year series nor a budget fraction, so it has no canonical Datum encoding and
 * stays presentational.
 */
export const POINT_CONTEXT: Record<
  string,
  { bars: RueaBar[]; evalNote: string }
> = {
  e1: {
    bars: [
      {
        label: "Committed (weekly)",
        value: 52,
        unit: "sessions",
        role: "other",
      },
      { label: "Delivered", value: 42, unit: "sessions", role: "me" },
    ],
    evalNote: "10 sessions short of a weekly cadence, or about 81% delivered.",
  },
  e2: {
    bars: [
      {
        label: "Committed (monthly)",
        value: 12,
        unit: "workshops",
        role: "other",
      },
      { label: "Delivered", value: 12, unit: "workshops", role: "me" },
    ],
    evalNote: "Commitment met exactly - 12 of 12.",
  },
  e3: {
    bars: [
      {
        label: "Committed (every other)",
        value: 21,
        unit: "sessions",
        role: "other",
      },
      { label: "Delivered", value: 18, unit: "sessions", role: "me" },
    ],
    evalNote:
      "3 sessions short of the promised cadence, or about 86% delivered.",
  },
};

/**
 * Both halves of the analysis shown for a data point the user supplied
 * themselves. The two sections say the same thing because in a live build both
 * would be model output, and there is no model behind this prototype.
 */
const AI_PENDING = [
  "This section is normally written by AI, which reads the data point above in the context of your grant.",
  "That model isn't wired up in this prototype - in the production version of the app, the generated analysis will appear here instead of this note.",
];

/**
 * A stable stand-in for `Datum.id`, derived from the point's key so it doesn't
 * change between renders. Kept negative to stay clear of the seeded ids.
 * Nothing reads it - selection and card keys are the id strings - but it still
 * has to be a number, and an honest one.
 */
const standInDatumId = (key: string) =>
  -Array.from(key).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

/**
 * The analysis for a data point that has none of its own: anything the user
 * typed into a question step's chat, and any seeded point with no entry above.
 * Every selected data point gets exactly one card, so a point with nothing
 * behind it still needs an analysis rather than being dropped from the step.
 */
export const userPointAnalysis = (
  key: string,
  content: string,
  citation: string,
): DatumAnalysis => ({
  datum: {
    id: standInDatumId(key),
    content,
    citation,
    visualizationMethod: VisualizationMethod.None,
    source: SRC_USER_CHAT,
  },
  // The type documents `null` as meaning the user added this point manually.
  relevance: null,
  result: { understand: AI_PENDING, apply: AI_PENDING },
});

/** An item whose label and source are simply its analysed datum's. */
const fromAnalysis = (id: string): ReportQuestionItem => ({
  id,
  label: POINT_ANALYSES[id].datum.content,
  source: POINT_ANALYSES[id].datum.citation,
});

export const REPORT_QUESTION_STEPS: ReportQuestionStep[] = [
  {
    id: "commitment",
    index: 2,
    topic: "COMMITMENT",
    question: "What did you commit to doing with this grant?",
    items: [
      fromAnalysis("c1"),
      {
        id: "c2",
        label: "Monthly nutrition workshops using locally sourced produce",
        source: "From your application",
        analysisId: "ruea-produce",
      },
      fromAnalysis("c3"),
    ],
    suggestions: [
      "We also committed to...",
      "One commitment below isn't quite right...",
      "We changed a commitment mid-year because...",
      "We had to drop...",
    ],
  },
  {
    id: "events",
    index: 3,
    topic: "EVENTS RUN",
    question: "What events or activities did you run?",
    items: [fromAnalysis("e1"), fromAnalysis("e2"), fromAnalysis("e3")],
    suggestions: [
      "We also ran...",
      "One of these counts is off...",
      "An event we had to cancel...",
      "A partner co-hosted...",
    ],
  },
  {
    id: "community",
    index: 4,
    topic: "COMMUNITY SERVED",
    question: "Who did this work reach?",
    items: [
      {
        id: "m1",
        label: "1,240 unique residents served across all programs",
        source: "From your Annual Impact Survey",
        analysisId: "ruea-served",
      },
      fromAnalysis("m2"),
    ],
    suggestions: [
      "We also reached...",
      "Another neighborhood we served...",
      "Who showed up most often was...",
      "A group we struggled to reach...",
    ],
  },
  {
    id: "outcomes",
    index: 5,
    topic: "OUTCOMES",
    question: "What changed as a result of this work?",
    items: [
      {
        id: "o1",
        label: "68% of participants returned for a second season",
        source: "From your Annual Impact Survey",
        analysisId: "ruea-retention",
      },
      {
        id: "o2",
        label:
          "Hilltop's cardiovascular disease rate sits 36% below the county average",
        source: "From the Vibrancy Index",
        analysisId: "ruea-cvd",
      },
    ],
    suggestions: [
      "We also measured...",
      "A participant told us...",
      "Something unexpected happened...",
      "What we'd do differently...",
    ],
  },
];
