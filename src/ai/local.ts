/**
 * @module ai/local
 * Stand-ins for the AI integrations in `./tasks.ts`, which is `server-only`
 * and needs a live Gemini key.
 *
 * Every function here returns the *same shape* its live counterpart does, so
 * the flows are built against the real contract:
 *
 * | here                          | live                                | schema                    |
 * | ----------------------------- | ----------------------------------- | ------------------------- |
 * | `initialReportSuggestions`    | `generateInitialReportSuggestions`  | `reportSuggestions.json`  |
 * | `reportConversationTurn`      | `generateReportConversationTurn`    | `reportConversation.json` |
 * | `initialWritingSuggestions`   | (none yet - a new integration)      | `number[]` of `Datum.id`  |
 *
 * Swapping the real thing in means replacing these call sites with awaited
 * server actions; nothing downstream of them has to change.
 *
 * The one integration with no stand-in here is the one that turns the user's
 * pasted reporting requirements into `ReportingRequirement`s. Deriving those
 * from arbitrary prose is the part a keyword stand-in does worst, so the
 * prototype uses the fixed `REPORTING_REQUIREMENTS` seed instead - see that
 * constant for what production replaces.
 *
 * Everything here is deterministic. Persisted state is rebuilt from these
 * results, so `Math.random()` and `Date.now()` would make a reloaded report
 * disagree with the one the user left.
 */

import type { ReportingRequirement } from "@/types/grant";
import type { GrantReportConversationResponse } from "@/types/analysis";
import {
  DATUM_COMMIT_SCREENING,
  DATUM_COMMIT_WALKING_GROUPS,
  DATUM_COMMIT_WORKSHOPS,
  DATUM_CVD_RATE,
  DATUM_NEIGHBORHOODS_SERVED,
  DATUM_NUTRITION_WORKSHOPS,
  DATUM_OAT_RESOURCES,
  DATUM_PRODUCE_ACCESS,
  DATUM_PROGRAM_RETENTION,
  DATUM_RESIDENTS_REACHED,
  DATUM_SCREENING_SESSIONS,
  DATUM_WALKING_SESSIONS,
  WRITING_SUGGESTIONS,
} from "@/data/seed";

// ---- Suggestion selection --------------------------------------------------

/**
 * Topic buckets, matched against whatever the user wrote their requirement as.
 *
 * `reportSuggestions.md` is explicit that keyword overlap is *not* what makes a
 * data point relevant, and it's right; this is a stand-in for judgement, not
 * judgement. A requirement that matches nothing we hold gets nothing, which
 * the schema allows and which is the honest answer - a report question about
 * spending, say, has no budget data behind it in this prototype, so the user
 * supplies that answer themselves in the conversation.
 *
 * Buckets deliberately overlap: reach is part of who you served *and* part of
 * what changed. That is how one data point comes to be suggested under two
 * different requirements.
 */
const TOPICS: { keywords: string[]; data: number[] }[] = [
  {
    // Every inflection, because a requirement about what was promised almost
    // always also mentions the activities promised - and "program activities"
    // would otherwise outscore this bucket and open the question with what was
    // delivered instead of what was committed to.
    keywords: [
      "commit",
      "commitment",
      "commitments",
      "committed",
      "promise",
      "promised",
      "propose",
      "proposed",
      "plan",
      "planned",
    ],
    data: [
      DATUM_COMMIT_WALKING_GROUPS.id,
      DATUM_COMMIT_WORKSHOPS.id,
      DATUM_COMMIT_SCREENING.id,
    ],
  },
  {
    keywords: [
      "event",
      "events",
      "activity",
      "activities",
      "ran",
      "held",
      "workshop",
      "workshops",
      "session",
      "sessions",
      "program",
      "programs",
    ],
    data: [
      DATUM_NUTRITION_WORKSHOPS.id,
      DATUM_WALKING_SESSIONS.id,
      DATUM_SCREENING_SESSIONS.id,
    ],
  },
  {
    keywords: [
      "serve",
      "served",
      "reach",
      "reached",
      "people",
      "resident",
      "residents",
      "household",
      "households",
      "participant",
      "participants",
      "demographic",
      "demographics",
      "neighborhood",
      "neighborhoods",
      "who",
    ],
    data: [DATUM_RESIDENTS_REACHED.id, DATUM_NEIGHBORHOODS_SERVED.id],
  },
  {
    keywords: [
      "outcome",
      "outcomes",
      "change",
      "changed",
      "impact",
      "result",
      "results",
      "difference",
      "retention",
      "returned",
      "health",
      "access",
    ],
    data: [
      DATUM_PROGRAM_RETENTION.id,
      DATUM_PRODUCE_ACCESS.id,
      DATUM_CVD_RATE.id,
      DATUM_RESIDENTS_REACHED.id,
    ],
  },
  {
    keywords: [
      "capacity",
      "organizational",
      "organization",
      "assessment",
      "governance",
      "staffing",
    ],
    data: [DATUM_OAT_RESOURCES.id],
  },
  {
    keywords: ["narrative", "summary", "story", "stories", "quote", "quotes"],
    data: [
      DATUM_RESIDENTS_REACHED.id,
      DATUM_PROGRAM_RETENTION.id,
      DATUM_NEIGHBORHOODS_SERVED.id,
    ],
  },
];

/** The schema caps a suggestion list at ten. */
const MAX_SUGGESTIONS = 10;

function topicMatch(requirement: ReportingRequirement): number[] {
  const haystack =
    `${requirement.shortName} ${requirement.statement} ${requirement.question}`.toLowerCase();
  const scored = TOPICS.map((topic) => ({
    topic,
    score: topic.keywords.filter((k) =>
      new RegExp(`\\b${k}\\b`).test(haystack),
    ).length,
  }))
    .filter((s) => s.score > 0)
    // Most-matched bucket first, which is as close to "most promising first"
    // as a keyword stand-in can honestly get.
    .sort((a, b) => b.score - a.score);
  const ids = scored.flatMap((s) => s.topic.data);
  return [...new Set(ids)].slice(0, MAX_SUGGESTIONS);
}

/**
 * How this requirement's data points are released: the strongest couple with
 * the question itself, the rest one at a time as the conversation goes on.
 *
 * That split is what the two integrations describe - `reportSuggestions.md`
 * runs the first round, `reportConversation.md` reconsiders the data on every
 * reply after it - and holding some back is also why a later reply can raise
 * something the opening message didn't.
 */
function suggestionPlan(requirement: ReportingRequirement): {
  initial: number[];
  followUp: number[][];
} {
  const matched = topicMatch(requirement);
  return {
    initial: matched.slice(0, 2),
    followUp: matched.slice(2).map((id) => [id]),
  };
}

/**
 * The data points raised alongside the question the first time the user opens
 * it. Mirrors `generateInitialReportSuggestions`.
 */
export function initialReportSuggestions(
  requirement: ReportingRequirement,
): number[] {
  return suggestionPlan(requirement).initial;
}

/**
 * The data points the assistant surfaces for an application. The application
 * flow has no conversation, so this is its one and only round - run when the
 * user finishes sharing their context.
 */
export function initialWritingSuggestions(): number[] {
  return WRITING_SUGGESTIONS;
}

// ---- Conversation ----------------------------------------------------------

/**
 * Whether something the user typed carries information worth recording as a
 * data point, as opposed to being a question or an aside.
 *
 * The live model makes this call by reading the message. Here it is a shape
 * test: a question isn't an answer, and an answer worth citing generally
 * carries either a figure or enough substance to stand on its own.
 */
export function recordsDataPoint(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.endsWith("?")) return false;
  return /\d/.test(trimmed) || trimmed.split(/\s+/).length >= 6;
}

export type ConversationEvent =
  | { kind: "message"; text: string }
  | { kind: "document"; name: string }
  | { kind: "webpage"; link: string };

export type ConversationTurnInput = {
  requirement: ReportingRequirement;
  /** What the user just did. */
  event: ConversationEvent;
  /** Datum ids already raised here. Nothing is ever raised twice. */
  raised: number[];
  /** Datum ids approved anywhere in this report. */
  approved: number[];
  /** Ids of data points recorded from this event, if any. */
  recorded: number[];
  /** How many replies the assistant has already sent in this conversation. */
  replies: number;
};

/**
 * One turn of the reporting conversation. Mirrors
 * `generateReportConversationTurn`, right down to returning the
 * `GrantReportConversationResponse` that a live model turn carries as JSON.
 *
 * Two rules from `reportConversation.md` are load-bearing here and are kept:
 * data points the user has already approved are not offered again, and nothing
 * is ever added to the approved list on their behalf - `suggestions` is an
 * offer, and approving is the user's act.
 */
export function reportConversationTurn(
  input: ConversationTurnInput,
): GrantReportConversationResponse {
  const { requirement, event, raised, approved, recorded, replies } = input;
  const plan = suggestionPlan(requirement);

  // Everything this requirement has left to offer, in rank order, minus what
  // has already been raised or approved.
  const batch = plan.followUp[replies] ?? [];
  const suggestions = [...recorded, ...batch].filter(
    (id) => !raised.includes(id) && !approved.includes(id),
  );
  const exhausted = replies >= plan.followUp.length;
  const message = replyText({
    event,
    recorded,
    suggestions,
    approvedCount: approved.length,
    exhausted,
  });

  return {
    message,
    suggestions: suggestions.slice(0, MAX_SUGGESTIONS),
    // The prompt reserves this for "the staff member has confirmed and can
    // move on", which here means they have approved something and there is
    // nothing further to offer.
    is_sufficient: exhausted && approved.length > 0,
  };
}

function replyText({
  event,
  recorded,
  suggestions,
  approvedCount,
  exhausted,
}: {
  event: ConversationEvent;
  recorded: number[];
  suggestions: number[];
  approvedCount: number;
  exhausted: boolean;
}): string {
  const offer =
    suggestions.length > 0
      ? " I've put what looks relevant below this message - approve anything you want in your report."
      : "";

  if (event.kind === "document")
    return `Thanks - I've filed “${event.name}” with your sources for this report and read it alongside everything else you've shared.${offer}`;

  if (event.kind === "webpage")
    return `Got it - I've added that page to your sources for this report and read it alongside everything else you've shared.${offer}`;

  if (recorded.length > 0)
    return `Recorded, in your own words, so it stays traceable back to this conversation.${offer || " Approve it below if you want it in your report."}`;

  if (event.text.trim().endsWith("?"))
    return `Good question. Answer it however fits your program - what matters for this requirement is that the figures you give are ones you can stand behind.${offer}`;

  if (exhausted && approvedCount > 0)
    return "Here's what I have for this section: the data points you've approved below. Does this look right, or is there anything you'd like to add or change?";

  return `Noted. If you can put a number or a date to it, that's what turns it into something a funder can check.${offer}`;
}
