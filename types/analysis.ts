import { AuthoritativeDatum, InitiativeDatum } from "./data";
import { Location, Region } from "./geo";

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
  rationale: string | null; // NTS: null if not added by AI

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

/**
 *
 */
export type GrantReportingAnalysis = GrantWritingAnalysis & {
  // TODO: Waiting on sequence diagram from Priyal
};
