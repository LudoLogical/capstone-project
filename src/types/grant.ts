import { Grantor, Issue } from "./constants";
import { Region } from "./geo";
import Initiative from "./initiative";

/**
 * A requirement that the recipient(s) of a specific Grant must satisfy
 * when preparing the report(s) that they must submit to the
 * corresponding grantor.
 */
export type ReportingRequirement = {
  /**
   * A brief, heading-style moniker for this ReportingRequirement.
   * Must be no more than a few words long.
   *
   * @example
   * "People supported"
   */
  shortName: string;

  /**
   * The ReportingRequirement itself, phrased as an affirmative command.
   *
   * @example
   * "Include the number of people that the program supported in 2025."
   */
  statement: string;

  /**
   * The ReportingRequirement itself, phrased as a question asked of the
   * Grant recipient(s)
   *
   * @example
   * "How many people did the program support in 2025?"
   */
  question: string;
};

/**
 * An opportunity for one or more Initiatives to be awarded funding and/or
 * non-monetary benefits from a Grantor for use in furtherance of a specific
 * and often geographically bounded purpose that serves a public interest.
 *
 * To receive a Grant award, an Initiative must be eligible for it, complete
 * one or more rounds of applications, and be selected by the Grantor.
 *
 * Once an Initiative has received a Grant award, it may be subject to
 * additional requirements for the duration of the award term, such as
 * attending certain events, collecting data about the work that the Grant
 * award is used to support, and/or producing impact reports for the Grantor.
 */
type Grant = {
  /**
   * The unique ID of this Grant.
   */
  id: string;

  /**
   * The name of this Grant.
   */
  name: string;

  /**
   * The URL of the original listing for this Grant.
   */
  link: string;

  /**
   * The entity that published and manages this Grant.
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
  issues: Issue[];

  /**
   * The geographic area(s) within which work supported by this Grant
   * must occur.
   */
  targetRegions: Region[];

  /**
   * The funding and/or non-monetary benefits associated with this Grant.
   */
  award: {
    /**
     * The total amount of money, in USD, that this Grant provides to
     * its/each awardee.
     */
    totalAmount: number;

    /**
     * The total amount of money, in USD, that this Grant provides to
     * its/each awardee per year on average.
     */
    annualAmount: number;

    /**
     * The non-monetary benefits that this Grant provides to its/each awardee.
     */
    benefits: string[];
  };

  /**
   * The conditions that an Initiative must satisfy to receive this Grant
   * and the obligations associated with receiving that award.
   *
   * Every requirement in this object must appear in and be extracted directly
   * from the original listing for this Grant.
   */
  requirements: {
    /**
     * The specific criteria that quality an Initiative to participate in the
     * application process for this Grant.
     *
     * Every requirement in this array must appear in and be extracted directly
     * from the original listing for this Grant.
     */
    eligibility: string[];

    /**
     * The tasks, materials, commitments, steps, and/or phases that comprise
     * the application process for this Grant.
     *
     * Every requirement in this array must appear in and be extracted directly
     * from the original listing for this Grant.
     */
    application: string[];

    /**
     * The responsibilities that the recipient(s) of this Grant must fulfill.
     * Does not include reports.
     *
     * Every requirement in this array must appear in and be extracted directly
     * from the original listing for this Grant.
     */
    awardee: string[];

    /**
     * The contents, structure, and frequency of the report(s) that the
     * recipient(s) of this Grant must produce for its Grantor.
     *
     * Every ReportingRequirement in this array must appear in and be extracted
     * directly from the original listing for this Grant.
     */
    reporting: ReportingRequirement[];
  };

  /**
   * Sets of AI-generated recommendations about what to include and/or focus
   * on in important documents related to this Grant.
   *
   * Does not include any document requirements that appear in or were
   * extracted directly from the original listing for this Grant.
   * @see {@link Grant.requirements}
   */
  guidance: {
    /**
     * A set of AI-generated recommendations about what to include and/or
     * focus on in an application for this Grant.
     *
     * Does not include any application requirements that appear in or were
     * extracted directly from the original listing for this Grant.
     * @see {@link Grant.requirements}
     */
    application: string[];

    /**
     * A set of AI-generated recommendations about what to include and/or
     * focus on in an impact report for this Grant.
     *
     * Does not include any reporting requirements that appear in or were
     * extracted directly from the original listing for this Grant.
     * @see {@link Grant.requirements}
     */
    reporting: string[];
  };

  /**
   * The deadlines and durations that define how the status of this Grant
   * changes over time.
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
     * The total length (in months) of the period in which the funding and/or
     * benefits associated with this Grant is/are to be distributed and used.
     */
    awardTerm: number;

    /**
     * The date and time (in UTC) by which the awardee(s) of this Grant
     * must submit their first impact report(s), or `null` if no reporting
     * is required.
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
   *
   * @deprecated
   * *The feature associated with this property is currently under review.*
   */
  collabOpportunitySubscribers: Initiative[];

  /**
   * True iff this Grant has been recommended by NSR; false otherwise.
   */
  isRecommended: boolean;
};

export default Grant;
