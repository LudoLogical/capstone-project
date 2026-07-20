import { BaseGrantAnalysis, GrantReportingAnalysis } from "./analysis";
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
   * the Grantor has yet to make or share their final decision.)
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
 * A record of a single instance in which one Initiative contacted
 * another Initiative to express interest in collaborating with them
 * on a specific Grant.
 */
export type CollabContactRecord = {
  /**
   * The unique ID of the Initiative that received the expression of interest
   * documented by this CollabContactRecord.
   */
  recipientID: string;

  /**
   * The date and time (in UTC) at which the expression of interest documented
   * by this CollabContactRecord was sent.
   */
  timestamp: Date;
};

/**
 * A record of a single Initiative's interactions with a single Grant.
 */
type GrantRecord = {
  /**
   * The unique ID of this GrantRecord.
   */
  id: string;

  /**
   * The Grant associated with this GrantRecord.
   */
  grant: Grant;

  /**
   * The stage of the Grant lifecycle that the associated Initiative is
   * currently in with the associated Grant.
   */
  stage: GrantLifecycleStage;

  /**
   * An AI-generated analysis of the alignment between the associated
   * Initiative and the associated Grant, or null if that analysis has not
   * been generated yet.
   */
  alignmentAnalysis: {
    /**
     * A list of reasons why the associated Grant might be a good fit
     * for the associated Initiative.
     */
    pros: string[];

    /**
     * A list of potential concerns that the associated Initiative might want
     * to consider before persuing the associated Grant.
     */
    cons: string[];
  } | null;

  /**
   * True if the Initiative associated with this GrantRecord has expressed
   * interest in collaborating with other Initiatives on the associated Grant;
   * false otherwise.
   *
   * @remarks
   * If this value is true, the Initiative associated with this GrantRecord
   * will be discoverable by and able to receive warm self-introductions
   * via email from other Initiatives who are also subscribed to the
   * associated Grant.
   *
   * However, Initiatives that have already applied for a Grant are made
   * undiscoverable and thus ineligible to receive such emails regardless of
   * whether they subscribed to it in the past.
   */
  subscribed: boolean;

  /**
   * A complete log of the occassions on which the Initiative associated with
   * this GrantRecord contacted another Initiative to express interest in
   * collaborating with them on the associated Grant.
   */
  collabContactRecords: CollabContactRecord[];

  /**
   * The grant writing analyses that the associated Initiative has started
   * for the associated Grant.
   */
  writingAnalyses: BaseGrantAnalysis[];

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
