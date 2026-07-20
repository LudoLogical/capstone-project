import type { ReportState } from "@/store/useAppStore";

export const STEP_NAV = [
  { n: 1, label: "Share your context" },
  { n: 2, label: "Commitment" },
  { n: 3, label: "Events run" },
  { n: 4, label: "Community served" },
  { n: 5, label: "Outcomes" },
  { n: 6, label: "Review" },
  { n: 7, label: "Analysis" },
];

// The seven steps are three distinct phases of work, so the sidebar groups them
// rather than presenting one flat list.
export const STEP_GROUPS = [
  { title: "Data collection", steps: STEP_NAV.slice(0, 5) },
  { title: "Review your data", steps: STEP_NAV.slice(5, 6) },
  { title: "Data analysis", steps: STEP_NAV.slice(6, 7) },
];

// What funders most commonly ask for in a report, offered as one-click starters
// so the user doesn't face an empty box.
export const REQUIREMENT_SUGGESTIONS = [
  "A narrative summary of outcomes",
  "Number of people served",
  "A budget-to-actuals breakdown",
  "Participant stories or quotes",
  "Demographics of who you reached",
  "Photos or documentation from events",
];

/**
 * Data points start unchecked: the user opts each one in. Unset therefore reads
 * as unchecked.
 */
export const isPicked = (picks: Record<string, boolean>, id: string) =>
  !!picks[id];

export type QuestionStepId = keyof ReportState["chat"];

export const QUESTION_STEP_ID_BY_INDEX: Record<number, QuestionStepId> = {
  2: "commitment",
  3: "events",
  4: "community",
  5: "outcomes",
};

/**
 * A stand-in for the reporting assistant's reply in the live chat. Keyed to the
 * step topic and always reminding the user that what they share is captured
 * with a source, so every figure in the report stays traceable.
 */
export function assistantReply(topic: string, text: string): string {
  const t = topic.toLowerCase();
  const openers = [
    `Got it - we've added that to your ${t} notes below and tagged it "shared by you" so it stays traceable to a source.`,
    `Thanks, that's helpful for the ${t} section. We've saved it below with a "shared by you" source so reviewers can see where it came from.`,
    `Noted for ${t}. It's now in your data below, cited as "shared by you." Anything else you'd like to capture?`,
  ];
  // Vary the reply per message so repeated sends don't read identically
  // (Math.random is unavailable here and would break persistence anyway).
  return openers[text.length % openers.length];
}

/** One section of the consolidated review on step 6. */
export type ReviewGroup = {
  stepId: QuestionStepId;
  label: string;
  items: {
    stepId: QuestionStepId;
    itemId: string;
    label: string;
    source: string;
    picked: boolean;
  }[];
};
