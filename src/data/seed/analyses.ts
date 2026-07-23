import type { DatumAnalysis } from "@/types/analysis";
import type { AISDatum, AuthoritativeDatum, Datum } from "@/types/data";
import type { RueaBar } from "@/components/analysis/StatBars";
import type { AnalysisCardSection } from "@/components/analysis/RueaCard";
import {
  ANALYSIS_CVD_RATE,
  ANALYSIS_PRODUCE_ACCESS,
  ANALYSIS_PROGRAM_RETENTION,
  ANALYSIS_RESIDENTS_REACHED,
  DATUM_COMMIT_SCREENING,
  DATUM_COMMIT_WALKING_GROUPS,
  DATUM_COMMIT_WORKSHOPS,
  DATUM_CVD_RATE,
  DATUM_NEIGHBORHOODS_SERVED,
  DATUM_NUTRITION_WORKSHOPS,
  DATUM_PRODUCE_ACCESS,
  DATUM_PROGRAM_RETENTION,
  DATUM_RESIDENTS_REACHED,
  DATUM_SCREENING_SESSIONS,
  DATUM_WALKING_SESSIONS,
} from "./datum";

/**
 * Bars for an AuthoritativeDatum: this org's value against the county average
 * and ceiling. Exactly what VisualizationMethod.BarChart describes, so the
 * numbers come off the datum rather than being restated here.
 *
 * The display unit is passed in: `Datum.unit` is prose ("% of adults") where
 * the bars want a symbol.
 */
const authoritativeBars = (
  datum: AuthoritativeDatum,
  unit: string,
): RueaBar[] => [
  { label: "Hilltop (you)", value: datum.value, unit, role: "me" },
  {
    label: "County average",
    value: datum.context.average,
    unit,
    role: "average",
  },
  { label: "County max", value: datum.context.maximum, unit, role: "max" },
];

/**
 * Bars for a quantitative AISDatum: one per survey year, with the most recent
 * marked as this org's own figure.
 */
const sampleBars = (datum: AISDatum, unit: string): RueaBar[] =>
  (datum.samples ?? []).map((sample) => ({
    label: `${sample.year}`,
    value: sample.value,
    unit,
    role: "me" as const,
  }));

/**
 * Everything the app knows about how to present one data point, keyed by
 * `Datum.id`.
 *
 * One entry per datum, shared by both flows: a data point that turns up in an
 * application and in a report is analysed the same way in each, and a data
 * point suggested for two different reporting requirements yields one card,
 * not two.
 *
 * `analysis` is the canonical DatumAnalysis. `bars` and `evalNote` are
 * presentation extras - a comparison to draw and a one-line reading of it - and
 * only exist where there is something real to show. Nothing here describes the
 * datum's provenance: the citation modal reads that off the datum itself.
 */
type AnalysisEntry = {
  analysis: DatumAnalysis;
  bars?: RueaBar[];
  evalNote?: string;
};

export const ANALYSIS_REGISTRY: Record<number, AnalysisEntry> = {
  [DATUM_CVD_RATE.id]: {
    analysis: ANALYSIS_CVD_RATE,
    bars: authoritativeBars(DATUM_CVD_RATE, "%"),
    evalNote: "36% below the county average.",
  },
  [DATUM_PRODUCE_ACCESS.id]: {
    analysis: ANALYSIS_PRODUCE_ACCESS,
    bars: authoritativeBars(DATUM_PRODUCE_ACCESS, "%"),
    evalNote:
      "27% above the county average, but still 28 points behind the best-served neighborhoods.",
  },
  [DATUM_RESIDENTS_REACHED.id]: {
    analysis: ANALYSIS_RESIDENTS_REACHED,
    bars: sampleBars(DATUM_RESIDENTS_REACHED, "residents"),
    evalNote: "27% growth in unique residents served, year over year.",
  },
  [DATUM_PROGRAM_RETENTION.id]: {
    analysis: ANALYSIS_PROGRAM_RETENTION,
    bars: sampleBars(DATUM_PROGRAM_RETENTION, "%"),
    evalNote: "14-point improvement in season-over-season retention.",
  },

  // The commitments and delivery counts behind a report. Where a commitment
  // has a delivered figure to sit beside it, the bars compare the two - that
  // relationship is neither a year series nor a budget fraction, so it has no
  // canonical Datum encoding and stays presentational.
  [DATUM_COMMIT_WALKING_GROUPS.id]: {
    analysis: {
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
  },
  [DATUM_COMMIT_WORKSHOPS.id]: {
    analysis: {
      datum: DATUM_COMMIT_WORKSHOPS,
      relevance: null,
      result: {
        understand: [
          "You committed to a monthly workshop cadence and to sourcing the produce locally.",
          "That second half is a commitment too - a funder reading this expects the sourcing claim to be evidenced, not just the count.",
        ],
        apply: [
          "Pair this with your delivered workshop count, then name a local grower or two so the sourcing claim stands up.",
        ],
      },
    },
  },
  [DATUM_COMMIT_SCREENING.id]: {
    analysis: {
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
  },
  [DATUM_WALKING_SESSIONS.id]: {
    analysis: {
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
    bars: [
      { label: "Committed (weekly)", value: 52, unit: "sessions", role: "other" },
      { label: "Delivered", value: 42, unit: "sessions", role: "me" },
    ],
    evalNote: "10 sessions short of a weekly cadence, or about 81% delivered.",
  },
  [DATUM_NUTRITION_WORKSHOPS.id]: {
    analysis: {
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
  [DATUM_SCREENING_SESSIONS.id]: {
    analysis: {
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
  [DATUM_NEIGHBORHOODS_SERVED.id]: {
    analysis: {
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
  },
};

/**
 * Both halves of the analysis shown for a data point with no analysis of its
 * own. The two sections say the same thing because in a live build both would
 * be model output, and there is no model behind this prototype.
 */
const AI_PENDING = [
  "This section is normally written by AI, which reads the data point above in the context of your grant.",
  "That model isn't wired up in this prototype - in the production version of the app, the generated analysis will appear here instead of this note.",
];

/**
 * The analysis for a data point that has none of its own - anything recorded
 * from a report conversation, and any datum with no registry entry. Every
 * approved data point gets exactly one card, so a point with nothing behind it
 * still needs an analysis rather than being dropped from the step.
 */
export const pendingAnalysis = (datum: Datum): DatumAnalysis => ({
  datum,
  // The type documents `null` as meaning the user added this point manually.
  relevance: null,
  result: { understand: AI_PENDING, apply: AI_PENDING },
});

/**
 * The Analysis step's card for one data point. Total over every Datum: a point
 * the user approved always yields a card, benchmarked where there is something
 * to benchmark it against and plain where there isn't.
 *
 * Cards are keyed by datum id, so the same data point approved for two
 * different reporting requirements is one card with one open/ticked state.
 */
export function analysisForDatum(datum: Datum): AnalysisCardSection {
  const entry = ANALYSIS_REGISTRY[datum.id];
  return {
    id: `datum-${datum.id}`,
    analysis: entry?.analysis ?? pendingAnalysis(datum),
    bars: entry?.bars,
    evalNote: entry?.evalNote,
  };
}
