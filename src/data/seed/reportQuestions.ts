import type { RueaBar } from "./rueaContent";

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
 * Analysis for data points that have no authoritative datum behind them (a
 * commitment, a qualitative reach statement, an activity count). They get the
 * same card as the benchmark-backed ones - what it means and how to use it -
 * with comparison bars only where a real comparison exists.
 */
export type PointAnalysis = {
  understand: string[];
  bars?: RueaBar[];
  evalNote?: string;
  apply: string[];
};

export const POINT_ANALYSES: Record<string, PointAnalysis> = {
  c1: {
    understand: [
      "You promised a standing weekly presence on four specific blocks, not a one-off event series.",
      "Reviewers read 'weekly' as a staffing and consistency commitment, so it's the bar you'll be measured against.",
    ],
    apply: [
      "State the commitment first, then your delivered session count, so the promise and the proof sit together.",
      "Name the four blocks - specificity signals you know your service area.",
    ],
  },
  c3: {
    understand: [
      "You committed to screening at roughly half your walking-group sessions, tying a clinical touchpoint to a social one.",
      "This is what turns a walking program into a health intervention in a reviewer's eyes.",
    ],
    apply: [
      "Pair this with your screening session count to show you held the cadence.",
      "If you fell short, say so plainly and explain what you learned - funders read candor as maturity.",
    ],
  },
  e1: {
    understand: [
      "You held a walking group roughly four times a month across the year.",
      "Against the weekly cadence you committed to (52), 42 sessions is about 81% delivery.",
    ],
    bars: [
      { label: "Committed (weekly)", value: 52, unit: "sessions", role: "other" },
      { label: "Delivered", value: 42, unit: "sessions", role: "me" },
    ],
    evalNote: "10 sessions short of a weekly cadence, or about 81% delivered.",
    apply: [
      "Lead with the 42 sessions, then account for the gap - an unexplained shortfall reads worse than an explained one.",
    ],
  },
  e2: {
    understand: [
      "You delivered exactly the monthly cadence you committed to: 12 workshops, one per month.",
      "Hitting a commitment exactly is the cleanest evidence of reliable delivery.",
    ],
    bars: [
      { label: "Committed (monthly)", value: 12, unit: "workshops", role: "other" },
      { label: "Delivered", value: 12, unit: "workshops", role: "me" },
    ],
    evalNote: "Commitment met exactly - 12 of 12.",
    apply: [
      "Say 'we committed to monthly workshops and delivered 12' - matching promise to result in one sentence is the strongest form.",
    ],
  },
  e3: {
    understand: [
      "You screened at 18 sessions, against a commitment of every other walking group (about 21 of your 42).",
      "That's most of the cadence you promised, with a small shortfall.",
    ],
    bars: [
      { label: "Committed (every other)", value: 21, unit: "sessions", role: "other" },
      { label: "Delivered", value: 18, unit: "sessions", role: "me" },
    ],
    evalNote: "3 sessions short of the promised cadence, or about 86% delivered.",
    apply: [
      "Report the 18 alongside your 42 walking groups so the reader can see the ratio you actually achieved.",
    ],
  },
  m2: {
    understand: [
      "Your reach concentrated in four Hilltop neighborhoods rather than spreading thin across the county.",
      "Depth in a defined service area is usually a strength, not a limitation.",
    ],
    apply: [
      "Name the neighborhoods and tie them to the need data - it shows you served where the gap is widest.",
    ],
  },
};

export const REPORT_QUESTION_STEPS: ReportQuestionStep[] = [
  {
    id: "commitment",
    index: 2,
    topic: "COMMITMENT",
    question: "What did you commit to doing with this grant?",
    items: [
      { id: "c1", label: "Weekly neighborhood walking groups across 4 Hilltop blocks", source: "From your application" },
      { id: "c2", label: "Monthly nutrition workshops using locally sourced produce", source: "From your application", analysisId: "ruea-produce" },
      { id: "c3", label: "Blood-pressure screening every other walking-group session", source: "From your application" },
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
    items: [
      { id: "e1", label: "42 walking-group sessions held across 2025", source: "From your Annual Impact Survey" },
      { id: "e2", label: "12 nutrition workshops held across 2025", source: "From your Annual Impact Survey" },
      { id: "e3", label: "18 blood-pressure screening sessions", source: "From your Annual Impact Survey" },
    ],
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
      { id: "m1", label: "1,240 unique residents served across all programs", source: "From your Annual Impact Survey", analysisId: "ruea-served" },
      { id: "m2", label: "Primarily Mount Oliver, Knoxville, St. Clair, and Bon Air residents", source: "From your Account Profile" },
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
      { id: "o1", label: "68% of participants returned for a second season", source: "From your Annual Impact Survey", analysisId: "ruea-retention" },
      { id: "o2", label: "Hilltop's cardiovascular disease rate sits 36% below the county average", source: "From the Vibrancy Index", analysisId: "ruea-cvd" },
    ],
    suggestions: [
      "We also measured...",
      "A participant told us...",
      "Something unexpected happened...",
      "What we'd do differently...",
    ],
  },
];
