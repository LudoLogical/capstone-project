import type { Datum, InitiativeSource } from "@/types/data";
import type { ReportingRequirement } from "@/types/grant";
import type {
  ReportConversationState,
  ReportState,
} from "@/store/useAppStore";
import type { AnalysisCardSection } from "@/components/analysis/RueaCard";
import {
  SEED_MAX_DATUM_ID,
  analysisForDatum,
  chatDatum,
  seedDatumById,
} from "@/data/seed";
import { initialReportSuggestions } from "@/ai/local";

/**
 * The report flow's shape comes from its requirements: share your context,
 * then one question per reporting requirement, then review, then analysis.
 *
 * Everything below is derived from `requirements.length` rather than written
 * down, because the number of questions is whatever the funder asks for.
 */
export const CONTEXT_STEP = 1;

/** The step number of the question for `requirements[index]`. */
export const questionStep = (index: number) => index + 2;

/** The step that reviews everything gathered, for `n` requirements. */
export const reviewStep = (n: number) => n + 2;

/** The step that analyses what survived review, for `n` requirements. */
export const analysisStep = (n: number) => n + 3;

/** How many steps the flow has in total, for `n` requirements. */
export const totalSteps = (n: number) => n + 3;

/**
 * Which requirement a step number is asking about, or null if the step isn't a
 * question step.
 */
export function requirementIndexForStep(
  step: number,
  n: number,
): number | null {
  const index = step - 2;
  return index >= 0 && index < n ? index : null;
}

/** The rail's entries, labelled by each requirement's own short name. */
export function stepNav(
  requirements: ReportingRequirement[],
): { n: number; label: string }[] {
  return [
    { n: CONTEXT_STEP, label: "Share your context" },
    ...requirements.map((r, i) => ({
      n: questionStep(i),
      label: r.shortName,
    })),
    { n: reviewStep(requirements.length), label: "Review" },
    { n: analysisStep(requirements.length), label: "Analysis" },
  ];
}

// The steps are three distinct phases of work, so the sidebar groups them
// rather than presenting one flat list.
export function stepGroups(requirements: ReportingRequirement[]) {
  const nav = stepNav(requirements);
  const questionCount = requirements.length;
  return [
    { title: "Data collection", steps: nav.slice(0, questionCount + 1) },
    { title: "Review your data", steps: nav.slice(questionCount + 1, questionCount + 2) },
    { title: "Data analysis", steps: nav.slice(questionCount + 2) },
  ];
}

/**
 * What funders most commonly ask for in a report, offered as one-click starters
 * so a user whose grant has no reporting requirements on file doesn't face an
 * empty box.
 */
export const REQUIREMENT_SUGGESTIONS = [
  "A narrative summary of outcomes",
  "Number of people served",
  "A budget-to-actuals breakdown",
  "Participant stories or quotes",
  "Demographics of who you reached",
  "Photos or documentation from events",
];

/**
 * Every data point ever raised in one conversation, in the order it was first
 * raised.
 *
 * The same datum can be offered more than once - the assistant reconsiders the
 * data on every turn - but it is one data point, so it appears once here, under
 * the message that first raised it.
 */
export function suggestedIds(conversation: ReportConversationState): number[] {
  const seen = new Set<number>();
  const ordered: number[] = [];
  conversation.messages.forEach((m) =>
    (m.suggestions ?? []).forEach((id) => {
      if (seen.has(id)) return;
      seen.add(id);
      ordered.push(id);
    }),
  );
  return ordered;
}

/**
 * The ids to chip beneath the message at `index`: the ones it raised that no
 * earlier message in this conversation raised first.
 */
export function firstMentionIds(
  conversation: ReportConversationState,
  index: number,
): number[] {
  const earlier = new Set(
    conversation.messages
      .slice(0, index)
      .flatMap((m) => m.suggestions ?? []),
  );
  return [...new Set(conversation.messages[index]?.suggestions ?? [])].filter(
    (id) => !earlier.has(id),
  );
}

/**
 * A fresh conversation for one requirement.
 *
 * It opens already holding the assistant's first message - the funder's
 * question, put to the user as though the assistant asked it - and the data
 * points that first round surfaced. That is the round `reportSuggestions.md`
 * describes, and running it here means it runs exactly once per requirement.
 */
export function openConversation(
  requirement: ReportingRequirement,
): ReportConversationState {
  return {
    messages: [
      {
        from: "ai",
        text: requirement.question,
        suggestions: initialReportSuggestions(requirement),
      },
    ],
    draft: "",
    markedComplete: false,
  };
}

/**
 * The Datum behind a suggested id: a seeded one, or one recorded from this
 * report's own conversations.
 *
 * Recorded data points are rebuilt from the repository rather than stored
 * whole, so a source the user deletes there stops resolving - and a data point
 * with nothing behind it simply drops out of the list rather than rendering
 * blank.
 */
export function resolveDatum(
  id: number,
  chatData: Record<number, string>,
  repository: InitiativeSource[],
): Datum | undefined {
  const seeded = seedDatumById(id);
  if (seeded) return seeded;
  const sourceId = chatData[id];
  if (!sourceId) return undefined;
  const source = repository.find((s) => s.id === sourceId);
  return source ? chatDatum(id, source) : undefined;
}

/**
 * The next id to give a data point recorded from a conversation.
 *
 * Numbered above every seeded id and above everything this report has already
 * recorded, so an id identifies one data point for good - which is what lets
 * approval be stored against it. Derived from the state rather than from a
 * counter or a clock, so it survives a reload.
 */
export const nextDatumId = (chatData: Record<number, string>) =>
  Math.max(SEED_MAX_DATUM_ID, ...Object.keys(chatData).map(Number)) + 1;

/** One requirement's section of the consolidated review. */
export type ReviewGroup = {
  requirementIndex: number;
  label: string;
  items: { datum: Datum; approved: boolean }[];
};

/**
 * The consolidated review: every data point the assistant raised, grouped by
 * the question that raised it.
 *
 * Nothing is filtered out by approval - a data point the user passed over is
 * still one they were shown, and this step is where they see the whole set. The
 * tick comes off the report-wide approval map, so a datum raised under two
 * questions reads the same in both groups.
 */
export function buildReviewGroups(
  report: ReportState,
  repository: InitiativeSource[],
): ReviewGroup[] {
  return report.conversations
    .map((conversation, i) => ({
      requirementIndex: i,
      label: report.requirements[i]?.shortName ?? `Question ${i + 1}`,
      items: suggestedIds(conversation).flatMap((id) => {
        const datum = resolveDatum(id, report.chatData, repository);
        return datum ? [{ datum, approved: !!report.approved[id] }] : [];
      }),
    }))
    .filter((g) => g.items.length > 0);
}

/**
 * One analysis card per approved data point.
 *
 * Deduped across questions: a datum raised under two requirements is still one
 * data point, and would otherwise be analysed twice. Ordered by where it was
 * first raised, so the cards run in the order the user met them.
 */
export function approvedAnalysisSections(
  report: ReportState,
  repository: InitiativeSource[],
): AnalysisCardSection[] {
  return [...new Set(report.conversations.flatMap(suggestedIds))]
    .filter((id) => report.approved[id])
    .flatMap((id) => {
      const datum = resolveDatum(id, report.chatData, repository);
      return datum ? [analysisForDatum(datum)] : [];
    });
}
