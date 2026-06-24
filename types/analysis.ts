import { AuthoritativeDatum, InitiativeDatum } from "./data";
import { Location, Region } from "./geo";

/**
 * Defined by \@google/gen-ai; see
 * https://googleapis.github.io/js-genai/release_docs/types/types.ContentListUnion.html
 */
type ContentListUnion = undefined;

/**
 *
 */
export type DatumAnalysis<T> = {
  /**
   *
   */
  datum: T;

  /**
   *
   */
  rationale: string | null; // null iff not added by AI

  /**
   *
   */
  result: DatumAnalysisResult;
};

/**
 *
 */
export type DatumAnalysisResult = {
  /**
   *
   */
  understand: string[]; // could be { header: string, body: string } instead

  /**
   *
   */
  apply: string[]; // could be { header: string, body: string } instead
};

/**
 *
 */
export type GrantWritingAnalysis = {
  /**
   *
   */
  locations: Location[];

  /**
   *
   */
  regions: Region[];

  /**
   *
   */
  authoritativeData: DatumAnalysis<AuthoritativeDatum>[];

  /**
   *
   */
  initiativeData: DatumAnalysis<InitiativeDatum>[];
};

export type GrantReportingConversation = {
  /**
   *
   */
  conversation: ContentListUnion;

  /**
   *
   */
  suggestions: string[][];

  /**
   *
   */
  aiMarkedAnswered: boolean;

  /**
   *
   */
  userMarkedAnswered: boolean;
};

/**
 *
 */
export type GrantReportingAnalysis = GrantWritingAnalysis & {
  /**
   *
   */
  conversations: GrantReportingConversation[];

  // TODO: Waiting on sequence diagram from Priyal
};
