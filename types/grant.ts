import { Grantor, Issue } from "./constants";
import { Region } from "./geo";
import Initiative from "./initiative";

/**
 *
 */
type Grant = {
  id: string;

  /**
   * The URL of the original listing for this Grant.
   */
  link: string;

  /**
   * The ID of the entity that published and manages this Grant.
   */
  grantor: Grantor;

  /**
   * A short summary of the purpose of this Grant.
   */
  purpose: string;

  /**
   * The set of issues that are related to this Grant.
   *
   * Stored as an array instead of a Set for consistency with the
   * Initiative type.
   */
  issueIDs: Issue[];

  /**
   * The geographic area(s) within which work supported by this Grant
   * must occur.
   */
  targetRegions: Region[];

  /**
   *
   */
  award: {
    /**
     *
     */
    totalAmount: number;

    /**
     * The total amount of money, in USD, that this Grant awards per year
     * on average.
     */
    annualAmount: number;

    /**
     *
     */
    benefits: string[];
  };

  /**
   *
   */
  requirements: {
    /**
     *
     */
    eligibility: string[];

    /**
     *
     */
    application: string[];

    /**
     *
     */
    awardee: string[];

    /**
     *
     */
    reporting: string[];
  };

  /**
   *
   */
  guidance: {
    /**
     *
     */
    application: string[]; // could be { header: string, body: string } instead

    /**
     *
     */
    reporting: string[]; // could be { header: string, body: string } instead
  };

  /**
   *
   */
  timeline: {
    /**
     * The date and time (in UTC) at which applications open for this Grant.
     */
    applicationWindowStart: Date;

    /**
     * The date and time (in UTC) at which applications close for this Grant.
     */
    applicationWindowEnd: Date;

    /**
     * The date and time (in UTC) at or by which applicants are to be notified
     * about whether they were selected to receive this Grant.
     */
    notificationDate: Date;

    /**
     *
     */
    awardTerm: number;

    /**
     * The date and time (in UTC) by which the awardee(s) of this Grant must
     * submit their first impact report(s), or null if no reporting is required.
     */
    firstReportDeadline: Date;

    /**
     * The length (in months) of the reporting period for this Grant,
     * or 0 if only one report is required,
     * or -1 if no reporting is required.
     */
    reportFrequency: number;
  };

  /**
   * The Initiatives that have asked to be notified when another Initiative
   * expresses interest in collaborating on this Grant.
   *
   * Note: Initiatives that have already applied for a Grant are considered
   * ineligible to receive such notifications regardless of whether they
   * appear in this list.
   */
  collabOpportunitySubscribers: Initiative[];

  /**
   * True iff this Grant has been recommended by NSR; false otherwise.
   */
  isRecommended: boolean;
};

export default Grant;
