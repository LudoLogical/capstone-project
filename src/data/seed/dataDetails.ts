// Content behind the "View summary" / "Open form" data-detail modal in the
// "Share your context" step of both the Data Collection Wizard and the
// Repository Report Flow.
export type DataDetailEntry = {
  key: string;
  label: string;
  meta: string;
  completed: boolean;
  // Plain-language explanation of how this data source feeds the analysis,
  // shown behind the "How is this used?" button.
  usage: string;
  summary?: { question: string; answer: string }[];
  formFields?: { label: string; placeholder: string }[];
};

export const DATA_DETAILS: Record<string, DataDetailEntry> = {
  surveys: {
    key: "surveys",
    label: "Annual Impact Surveys",
    meta: "2 completed",
    completed: true,
    usage:
      "Your Annual Impact Surveys are the backbone of your outcome data. The AI pulls the figures you reported - residents served, retention, program reach - and turns them into cited evidence, then compares each one against county and peer benchmarks so your numbers land in context.",
    summary: [
      { question: "How many unique residents did you serve in 2025?", answer: "1,240" },
      { question: "What percentage of participants returned for a second season?", answer: "68%" },
      { question: "What was your biggest program challenge this year?", answer: "Winter attendance drop-off in the walking groups." },
    ],
  },
  budget: {
    key: "budget",
    label: "Budget Records",
    meta: "2 active · 1 archived",
    completed: true,
    usage:
      "Your Budget Records let the AI ground your work in dollars. It uses your operating budget, grant-funded share, and largest expense categories to show funders the efficiency and scale of your programs, and to frame a realistic funding ask.",
    summary: [
      { question: "Total annual operating budget", answer: "$420,000" },
      { question: "Percentage grant-funded", answer: "~60%" },
      { question: "Largest single expense category", answer: "Program staff salaries" },
    ],
  },
  orgAssess: {
    key: "orgAssess",
    label: "Organizational Assessment",
    meta: "Not completed yet",
    completed: false,
    usage:
      "Your Organizational Assessment tells the AI about your capacity - years of operation, board and staff size. It uses this to establish your organization's readiness and stability, which reviewers weigh heavily when deciding who can deliver.",
    formFields: [
      { label: "Years of operation", placeholder: "e.g. 8" },
      { label: "Board size", placeholder: "e.g. 7" },
      { label: "Staff size (FTE)", placeholder: "e.g. 4.5" },
    ],
  },
};
