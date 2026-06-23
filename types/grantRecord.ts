import { GrantWritingAnalysis, GrantReportingAnalysis } from "./analysis";
import Grant from "./grant";

/**
 * Defines the main, mutually-exclusive stages of an Initiative's relationship
 * with a Grant.
 */
export enum GrantLifecycleStage {
  /**
   * The Initiative has not taken any lifecycle actions.
   */
  NotSaved = "NOT_SAVED",

  /**
   * The Initiative has saved the Grant, but has yet to confirm whether they
   * have applied for it.
   */
  Saved = "SAVED",

  /**
   * The Initiative has saved and subsequently unsaved the Grant at least once,
   * but has not taken any other lifecycle actions.
   */
  Unsaved = "UNSAVED",

  /**
   * The Initiative has confirmed that they have applied for the Grant, but has
   * yet to confirm whether they were awarded the Grant. (It's possible that
   * the grantor has yet to make or share their final decision.)
   */
  Applied = "APPLIED",

  /**
   * The Initiative has confirmed that they did not apply for the Grant before
   * the deadline. This is a terminal stage.
   */
  ConfirmedNotApplied = "CONFIRMED_NOT_APPLIED",

  /**
   * The Initiative has confirmed that they were not awarded the grant.
   * Reaching this stage requires applying for the Grant first.
   * This is a terminal stage.
   */
  NotAwarded = "NOT_AWARDED",

  /**
   * The Initiative has confirmed that they were awarded the Grant.
   * Reaching this stage requires applying for the Grant first.
   * This is NOT a terminal stage.
   */
  Awarded = "AWARDED",

  /**
   * The Initiative has confirmed that they have completed the report(s)
   * required for the Grant. Reaching this stage requires being awarded the
   * Grant first. This is a terminal stage (and the last one in the lifecycle).
   */
  Reported = "REPORTED",
}

/**
 * A record of a single Initiative's interactions with a single Grant.
 */
type GrantRecord = {
  id: string;

  /**
   * The Grant associated with this GrantRecord.
   */
  grant: Grant;

  /**
   *
   */
  alignmentAnalysis: string;

  /**
   * The stage of the Grant lifecycle that the associated Initiative is
   * currently in with the associated Grant.
   */
  stage: GrantLifecycleStage;

  /**
   * The dates and times (in UTC) at which the Initiative associated with this
   * GrantRecord expressed interest in collaborating with other Initiatives on
   * the associated Grant.
   */
  collabInterestExpressions: Date[];

  /**
   * The grant writing analyses that the associated Initiative has started
   * for the associated Grant.
   */
  writingAnalyses: GrantWritingAnalysis[];

  /**
   * The grant reporting analyses that the associated Initiative has started
   * for the associated Grant.
   *
   * Note: Initiatives cannot start reporting analyses for a Grant until they
   * have confirmed that they were awarded that Grant.
   */
  reportingAnalyses: GrantReportingAnalysis[];
};

export default GrantRecord;
