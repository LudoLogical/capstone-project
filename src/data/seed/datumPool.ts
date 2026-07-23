import type { Datum, InitiativeDatum, InitiativeSource } from "@/types/data";
import { InitiativeSourceKind, VisualizationMethod } from "@/types/data";
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
} from "./datum";

/**
 * Every Datum this prototype knows about, in one pool.
 *
 * Both flows work the way the AI integrations do: a suggestion is a
 * `Datum.id`, not a label. `reportSuggestions.json` and
 * `reportConversation.json` both hand back `number[]`, so everything
 * downstream - chips, the review list, the analysis cards - resolves ids
 * against this pool rather than carrying its own copy of a data point's text.
 *
 * The pool is deliberately shared across questions: one datum can be relevant
 * to more than one reporting requirement, and when it is, it stays one datum
 * with one approval state.
 */
export const ALL_DATA: Datum[] = [
  // Authoritative (Vibrancy Index)
  DATUM_CVD_RATE,
  DATUM_PRODUCE_ACCESS,
  // NSR service data
  DATUM_OAT_RESOURCES,
  DATUM_RESIDENTS_REACHED,
  DATUM_PROGRAM_RETENTION,
  DATUM_WALKING_SESSIONS,
  DATUM_NUTRITION_WORKSHOPS,
  DATUM_SCREENING_SESSIONS,
  // Initiative-supplied
  DATUM_COMMIT_WALKING_GROUPS,
  DATUM_COMMIT_SCREENING,
  DATUM_COMMIT_WORKSHOPS,
  DATUM_NEIGHBORHOODS_SERVED,
];

const BY_ID = new Map<number, Datum>(ALL_DATA.map((d) => [d.id, d]));

/**
 * The highest id in the seed pool. Data points minted from a conversation are
 * numbered above it, so a runtime id can never collide with a seeded one.
 */
export const SEED_MAX_DATUM_ID = Math.max(...ALL_DATA.map((d) => d.id));

/** The seeded Datum with this id, or undefined if there is none. */
export const seedDatumById = (id: number): Datum | undefined => BY_ID.get(id);

/**
 * The Datum recorded from something the user said in a report conversation.
 *
 * `ChatSource` documents its content as "definitionally identical to that of
 * any Datum instances created from them", so the datum restates the user's
 * words rather than paraphrasing them - which is also what
 * `reportConversation.md` requires of anything captured from the user.
 *
 * Built from the source rather than stored alongside it: the repository is the
 * one place a source lives, so a source deleted there stops resolving here
 * instead of lingering as a stale copy.
 */
export function chatDatum(
  id: number,
  source: InitiativeSource,
): InitiativeDatum | undefined {
  if (source.kind !== InitiativeSourceKind.Chat) return undefined;
  return {
    id,
    content: source.content,
    citation: "Shared by you in this conversation",
    visualizationMethod: VisualizationMethod.None,
    source,
  };
}
