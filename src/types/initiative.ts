import { Issue } from "./constants";
import { InitiativeSource } from "./data";
import { Region } from "./geo";
import GrantRecord from "./grantRecord";

/**
 * The manner in which an Initiative is structured and understood from a
 * legal perspective.
 */
export enum InitiativeType {
  /**
   * An Initiative that is not an independent legal entity and is thus only
   * eligible to receive grant funding through another Initiative (like NSR).
   */
  FinanciallySponsoredProject = "FINANCIALLY_SPONSORED_PROJECT",

  /**
   * An Initiative that is a formally registered 501(c)(3) non-profit.
   */
  RegisteredNonProfitOrganization = "REGISTERED_NON_PROFIT_ORGANIZATION",

  /**
   * An Initiative that is funded primarily through business activities.
   */
  SocialEnterprise = "SOCIAL_ENTERPRISE",

  /**
   * An Initiative that is not a fiscally sponsored project,
   * 501(c)(3) non-profit, or social enterprise.
   */
  Other = "OTHER",
}

/**
 * An entity that serves a public or social mission and pursues Grants to
 * acquire at least some of its support. Must be either a legally incorporated
 * non-profit organization or a community project that is fiscally sponsored by NSR.
 */
type Initiative = {
  /**
   * The unique ID of this Initiative.
   */
  id: string;

  /**
   * The name of this Initiative.
   */
  name: string;

  /**
   * The email address at which this Initiative should be contacted regarding
   * shared interest in collaborating on Grants.
   */
  contactEmail: string;

  /**
   * The InitiativeType that best describes this Initiative.
   */
  type: InitiativeType;

  /**
   * The mission at the heart of this Initiative.
   */
  mission: string;

  /**
   * The set of issues that are related to the work done by this Initiative.
   *
   * Stored as an array instead of a Set to allow users to customize the order
   * in which the issues appear in the UI.
   */
  issues: Issue[];

  /**
   * The geographic area(s) in which this Initiative works.
   */
  serviceAreas: Region[];

  /**
   * The types of work and/or components of the work done by this Initiative.
   */
  programs: string[];

  /**
   * A Map containing all of this Initiative's GrantRecords keyed by the
   * corresponding Grant IDs.
   */
  grantRecords: Map<string, GrantRecord>;

  /**
   * This Initiative's average annual budget, computed from BMS data at
   * runtime and cached short-term on the client side.
   */
  averageAnnualBudget: number;

  /**
   * The InitiativeSources that this Initiative has supplied to support
   * GrantAnalysis instance(s).
   */
  sources: InitiativeSource[];
};

export default Initiative;
