// Content for the 4 chat-style Q&A steps of the Repository Report Flow.
// Each step asks one question every funder asks about an awarded grant, and
// offers AI-prefilled checklist items pulled from the org's application or
// uploaded data.
export type ReportQuestionItem = { id: string; label: string; source: string };

export type ReportQuestionStep = {
  id: "commitment" | "events" | "community" | "outcomes";
  index: number;
  topic: string;
  question: string;
  items: ReportQuestionItem[];
};

export const REPORT_QUESTION_STEPS: ReportQuestionStep[] = [
  {
    id: "commitment",
    index: 2,
    topic: "COMMITMENT",
    question: "What did you commit to doing with this grant?",
    items: [
      { id: "c1", label: "Weekly neighborhood walking groups across 4 Hilltop blocks", source: "From your application" },
      { id: "c2", label: "Monthly nutrition workshops using locally sourced produce", source: "From your application" },
      { id: "c3", label: "Blood-pressure screening every other walking-group session", source: "From your application" },
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
  },
  {
    id: "community",
    index: 4,
    topic: "COMMUNITY SERVED",
    question: "Who did this work reach?",
    items: [
      { id: "m1", label: "1,240 unique residents served across all programs", source: "From your Annual Impact Survey" },
      { id: "m2", label: "Primarily Mount Oliver, Knoxville, St. Clair, and Bon Air residents", source: "From your Account Profile" },
    ],
  },
  {
    id: "outcomes",
    index: 5,
    topic: "OUTCOMES",
    question: "What changed as a result of this work?",
    items: [
      { id: "o1", label: "68% of participants returned for a second season", source: "From your Annual Impact Survey" },
      { id: "o2", label: "Hilltop's cardiovascular disease rate sits 36% below the county average", source: "From the Vibrancy Index" },
    ],
  },
];
