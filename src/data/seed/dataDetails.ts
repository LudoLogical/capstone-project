// Content behind the source rows in the "Share your context" step of both the
// Data Collection Wizard and the Repository Report Flow. Each row's action
// button is wired to the corresponding Vibrancy Portal flow at deployment; in
// this app the button performs no navigation.
export type DataDetailEntry = {
  key: string;
  label: string;
  meta: string;
  completed: boolean;
  // Plain-language explanation of how this data source feeds the analysis,
  // shown behind the "How is this used?" button.
  usage: string;
};

export const DATA_DETAILS: Record<string, DataDetailEntry> = {
  surveys: {
    key: "surveys",
    label: "Annual Impact Surveys",
    meta: "2 completed",
    completed: true,
    usage:
      "Your Annual Impact Surveys are the backbone of your outcome data. The AI pulls the figures you reported - residents served, retention, program reach - and turns them into cited evidence, then compares each one against county and peer benchmarks so your numbers land in context.",
  },
  budget: {
    key: "budget",
    label: "Budget Records",
    meta: "2 active · 1 archived",
    completed: true,
    usage:
      "Your Budget Records let the AI ground your work in dollars. It uses your operating budget, grant-funded share, and largest expense categories to show funders the efficiency and scale of your programs, and to frame a realistic funding ask.",
  },
  orgAssess: {
    key: "orgAssess",
    label: "Organizational Assessment",
    meta: "Not completed yet",
    completed: false,
    usage:
      "Your Organizational Assessment tells the AI about your capacity - years of operation, board and staff size. It uses this to establish your organization's readiness and stability, which reviewers weigh heavily when deciding who can deliver.",
  },
};

/**
 * The label for a source row's action button in the "Share your context" step.
 * It depends on the source and, for some, on whether it has been completed yet.
 * The button itself does nothing in this app - the deployment integration wires
 * each one to the matching Vibrancy Portal flow.
 */
export function dataActionLabel(key: string, completed: boolean): string {
  switch (key) {
    case "surveys":
      return completed ? "Review your answers" : "Take the survey";
    case "budget":
      return "Open the BMS";
    case "orgAssess":
      return completed ? "Review your scores" : "Take the assessment";
    default:
      return completed ? "Review" : "Open form";
  }
}
