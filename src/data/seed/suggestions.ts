import {
  DATUM_CVD_RATE,
  DATUM_PRODUCE_ACCESS,
  DATUM_PROGRAM_RETENTION,
  DATUM_RESIDENTS_REACHED,
} from "./datum";

/**
 * What the assistant surfaces for an application: the community conditions
 * that establish the need, plus this org's own reach and retention. Ranked
 * most useful first, which is what both suggestion schemas ask for.
 *
 * The report flow has no equivalent list, because its data points are chosen
 * against reporting requirements that don't exist until the user supplies
 * them - see `suggestionPlan` in `src/ai/local.ts`.
 */
export const WRITING_SUGGESTIONS: number[] = [
  DATUM_CVD_RATE.id,
  DATUM_PRODUCE_ACCESS.id,
  DATUM_RESIDENTS_REACHED.id,
  DATUM_PROGRAM_RETENTION.id,
];
